from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticatedOrReadOnly
import requests
from django.core.management.base import BaseCommand
import pandas
import traceback
from bs4 import BeautifulSoup
import os
from django.conf import settings
from django.core.files.base import ContentFile
from django.contrib.auth import authenticate, login
from datetime import datetime
from .serializers import *


def get_profile_page(fide_number):
    URL = 'https://ratings.fide.com/profile/'
    response = requests.get(URL + fide_number)
    soup = BeautifulSoup(response.content, 'html.parser')

    result = {
        'name': soup.find('div', class_='profile-top-title').text,
        'federation': soup.find_all('div', class_='profile-top-info__block__row__data')[1].text,
        'birth_year': soup.find_all('div', class_='profile-top-info__block__row__data')[3].text,
        'sex': soup.find_all('div', class_='profile-top-info__block__row__data')[4].text,
        'title': soup.find_all('div', class_='profile-top-info__block__row__data')[5].text,
        'standard_elo': soup.find_all('div', class_='profile-top-rating-data')[0].text.replace('std', '').strip(),
        'rapid_elo': soup.find_all('div', class_='profile-top-rating-data')[1].text.replace('rapid', '').strip(),
        'blitz_elo': soup.find_all('div', class_='profile-top-rating-data')[2].text.replace('blitz', '').strip(),
        'world_rank_all_players': soup.select('table.profile-table:first-child tbody tr:nth-child(1) td')[2].text,
        'world_rank_active_players': soup.select('table.profile-table:first-child tbody tr:nth-child(2) td')[1].text,
        'national_rank_all_players': soup.select('table.profile-table:first-child tbody tr:nth-child(1) td')[4].text,
        'national_rank_active_players': soup.select('table.profile-table:first-child tbody tr:nth-child(2) td')[3].text,
        'continental_rank_all_players': soup.select('table.profile-table:first-child tbody tr:nth-child(1) td')[6].text,
        'continental_rank_active_players': soup.select('table.profile-table:first-child tbody tr:nth-child(2) td')[5].text,
    }

    for key, value in result.items():
        print(f'{key}: {value}')


def save_history(player, rating_types, last_month=False):
    response = requests.get('https://ratings.fide.com/profile/' + player.fide_id + '/chart')
    soup = BeautifulSoup(response.content, 'html.parser')
    table_entries = soup.find('table', class_='profile-table_chart-table').find('tbody').find_all('tr')

    player = User.objects.get(fide_id=player.fide_id)

    if last_month:
        table_entries = [table_entries[0]]

    for row in table_entries:
        cells = row.find_all("td")

        date = cells[0].text.replace(u'\xa0', '')
        date = datetime.strptime(date, "%Y-%b").replace(day=1).strftime("%Y-%m-%d")

        classical_rating = cells[1].text.replace(u'\xa0', '')
        rapid_rating = cells[3].text.replace(u'\xa0', '')
        blitz_rating = cells[5].text.replace(u'\xa0', '')

        EloLog.objects.create(player=player, date=date, rating=classical_rating, rating_type=rating_types['Standard'])
        if rapid_rating != '':
            EloLog.objects.create(player=player, date=date, rating=rapid_rating, rating_type=rating_types['Rapid'])
        if blitz_rating != '':
            EloLog.objects.create(player=player, date=date, rating=blitz_rating, rating_type=rating_types['Blitz'])


class SignInView(TokenObtainPairView):
    serializer_class = SignInSerializer


class RegisterView(APIView):
    def post(self, request):
        try:
            data = request.data
            data['birthdate'] = datetime.strptime(data['birthdate'].split('T')[0], "%Y-%m-%d").date()
            serializer = PlayerSerializerCRUD(data=request.data)
            serializer.is_valid()
            print(serializer.errors)
            serializer.save()
            return Response(serializer.data)
        except:
            print(traceback.format_exc())
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([IsAdminUser])
class AdminTournamentApplicationsView(APIView):
    def post(self, request):
        tournament = Tournament.objects.get(pk=request.data['id'])
        TournamentApplication.objects.filter(tournament=tournament).delete()
        for row in request.data['applications']:
            TournamentApplication.objects.create(player=User.objects.get(pk=row['player']['id']), tournament=tournament, status=row['status'])

        return Response(status=status.HTTP_200_OK)


class DocumentViewLC(generics.ListCreateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializerLCRUD
    permission_classes = [IsAuthenticatedOrReadOnly]


class DocumentViewRUD(generics.RetrieveUpdateDestroyAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializerLCRUD
    permission_classes = [IsAuthenticatedOrReadOnly]


class DocumentTypeViewLC(generics.ListCreateAPIView):
    queryset = DocumentType.objects.all().order_by('name')
    serializer_class = DocumentTypeSerializerLC


class DocumentUploadView(APIView):
    def post(self, request):
        try:
            if 'file' in request.data and request.data['file']:
                file = request.data['file']
                type = DocumentType.objects.get(pk=request.data['type'])

                original_file_name = file.name
                user_dir_path = os.path.join(settings.MEDIA_URL)
                if not os.path.exists(user_dir_path):
                    os.makedirs(user_dir_path)

                # Read the content as bytes
                file_content = file.read()

                # Create the Document object using the file content
                Document.objects.create(uploader=User.objects.get(pk=request.user.id), name=original_file_name, content=file_content, type=type)

                return Response(status=status.HTTP_200_OK)
        except:
            print(traceback.format_exc())
            return Response(status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticatedOrReadOnly])
class DocumentDownloadView(APIView):
    def post(self, request):
        import base64
        from django.http import JsonResponse

        try:
            document = Document.objects.get(pk=request.data['id'])

            # Assuming document.content is already bytes, not a file-like object
            file_content_base64 = base64.b64encode(document.content).decode('utf-8')

            return JsonResponse({'filename': document.name, 'file': file_content_base64})

        except Document.DoesNotExist:
            return JsonResponse({'error': 'Document not found'}, status=404)


@permission_classes([IsAdminUser])
class GetEloLogView(APIView):
    def post(self, request):
        rating_types = {item.name: item for item in RatingType.objects.all()}

        if 'last_list' in request.data:
            EloLog.objects.filter(date=datetime.now().replace(day=1).strftime("%Y-%m-%d")).delete()
            players = User.objects.filter(fide_id__isnull=False)
            for player in players:
                save_history(player, rating_types, last_month=True)

        elif 'fide' in request.data:
            player = User.objects.get(fide_id=request.data['fide'])
            EloLog.objects.filter(player=player).delete()
            save_history(player, rating_types)

        else:
            EloLog.objects.all().delete()
            players = User.objects.filter(fide_id__isnull=False)
            for player in players:
                save_history(player, rating_types)

        return Response(status=status.HTTP_200_OK)


@authentication_classes([])
@permission_classes([])
class GetEloStatsView(APIView):
    def post(self, request):
        data = {'labels': [], 'datasets': []}

        players = User.objects.filter(id__in=request.data['players'])
        records = EloLog.objects.filter(player__in=players, date__gte=request.data['start'], date__lte=request.data['end'], rating_type__id=request.data['type'])

        dates = records.order_by('date').values('date').distinct()
        for date in dates:
            data['labels'].append(date['date'].strftime('%Y-%m-%d'))

        for player in players:
            data['datasets'].append({'label': player.name, 'data': [None] * len(dates)})
            player_records = records.filter(player=player)
            for player_record in player_records:
                index = data['labels'].index(player_record.date.strftime('%Y-%m-%d'))
                data['datasets'][-1]['data'][index] = player_record.rating

        return Response(status=status.HTTP_200_OK, data=data)


class GetLastPaymentView(APIView):
    def post(self, request):
        print(request.data['id'])
        records = Payment.objects.filter(player__id=request.data['id']).order_by('-end')
        print(records)
        if len(records):
            return Response(status=status.HTTP_200_OK, data=records[0].end)
        return Response(status=status.HTTP_200_OK, data='-')


class GetProfileView(APIView):
    def get(self, request):
        user = User.objects.get(pk=request.user.id)
        return Response(status=status.HTTP_200_OK, data=ProfileSerializer(user).data)


@authentication_classes([])
@permission_classes([])
class GetResultsView(APIView):
    def post(self, request):
        tournaments = Tournament.objects.filter(start_date__gte=request.data['start'], start_date__lte=request.data['end'])
        results = TournamentResult.objects.filter(tournament__in=tournaments)
        player_values = results.values('player').distinct()

        data = []

        for row in player_values:
            p1 = results.filter(place=1, player__id=row['player'])
            p2 = results.filter(place=2, player__id=row['player'])
            p3 = results.filter(place=3, player__id=row['player'])

            data.append({'player': User.objects.get(pk=row['player']).name, '1st': len(p1), '2nd': len(p2), '3rd': len(p3)})

        data.sort(key=lambda x: (x['1st'], x['2nd'], x['3rd']), reverse=True)
        return Response(status=status.HTTP_200_OK, data=data)


class GetTournamentResultsView(APIView):
    def post(self, request):
        records = TournamentResult.objects.filter(tournament=Tournament.objects.get(pk=request.data['id']))
        return Response(status=status.HTTP_200_OK, data=TournamentResultSerializer(records, many=True).data)


class ItemViewLC(generics.ListCreateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializerLCRUD
    permission_classes = [IsAdminUser]


class ItemViewRUD(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializerLCRUD
    permission_classes = [IsAdminUser]


class ItemTypeViewLC(generics.ListCreateAPIView):
    queryset = ItemType.objects.all().order_by('name')
    serializer_class = ItemTypeSerializerLC
    permission_classes = [IsAdminUser]


class LendingViewLC(generics.ListCreateAPIView):
    queryset = Lending.objects.filter(end_date__isnull=True)
    serializer_class = LendingSerializerLCRUD
    permission_classes = [IsAdminUser]


class LendingViewU(generics.UpdateAPIView):
    queryset = Lending.objects.all()
    serializer_class = LendingSerializerLCRUD
    permission_classes = [IsAdminUser]


class NewsViewLC(generics.ListCreateAPIView):
    queryset = News.objects.all().order_by('-id')
    serializer_class = NewsSerializerLCRUD


class NewsViewRUD(generics.RetrieveUpdateDestroyAPIView):
    queryset = News.objects.all()
    serializer_class = NewsSerializerLCRUD
    permission_classes = [IsAdminUser]


class PaymentViewLC(generics.ListCreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializerLCRUD
    permission_classes = [IsAdminUser]


class PaymentViewRUD(generics.RetrieveUpdateDestroyAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializerLCRUD
    permission_classes = [IsAdminUser]


class PlayerViewL(generics.ListAPIView):
    queryset = User.objects.all().order_by('name')
    serializer_class = PlayerSerializerL
    permission_classes = [IsAuthenticatedOrReadOnly]


class PlayerViewRUD(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = PlayerSerializerCRUD
    permission_classes = [IsAdminUser]


@permission_classes([IsAdminUser])
class PowerRankingListView(APIView):
    def get(self, request):
        records = PowerRanking.objects.all().prefetch_related('player').order_by('rank')

        ranklist = []
        ranked_players = []
        remaining_players_list = []

        for record in records:
            ranklist.append({'rank': record.rank, 'player': {'id': record.player.id, 'name': record.player.name, 'fide': record.player.fide_id}})
            ranked_players.append(record.player.id)

        remaining_players = User.objects.all().exclude(id__in=ranked_players).order_by('name')

        for player in remaining_players:
            remaining_players_list.append({'id': player.id, 'name': player.name, 'fide': player.fide_id})

        return Response(
            status=status.HTTP_200_OK,
            data={'ranklist': ranklist, 'remaining_players': remaining_players_list},
        )


@permission_classes([IsAdminUser])
class PowerRankingSaveView(APIView):
    def post(self, request):
        PowerRanking.objects.all().delete()
        players = User.objects.all()
        ranklist = request.data
        for item in ranklist:
            PowerRanking.objects.create(rank=item['rank'], player=players.get(id=item['player']['id']))

        return Response(status=status.HTTP_200_OK)


@permission_classes([IsAdminUser])
class PowerRankingUploadView(APIView):
    def post(self, request):
        problem = []
        ranklist = []
        ranked_players = []
        remaining_players_list = []
        rank = 0

        df = pandas.read_excel(request.FILES['file'], engine='openpyxl')

        if 'FIDE' not in df.columns or 'Név' not in df.columns:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        PowerRanking.objects.all().delete()

        players = User.objects.all()
        try:
            for idx in df.index:
                player = None
                try:
                    fide = int(df['FIDE'][idx])
                    player = players.get(fide_id=fide)
                except:
                    try:
                        player = players.get(name=df['Név'][idx])
                    except:
                        if not pandas.isna(df['FIDE'][idx]):
                            problem.append([str(df['Név'][idx]), str(int(df['FIDE'][idx]))])
                        else:
                            problem.append([str(df['Név'][idx]), ''])

                if player:
                    rank += 1
                    PowerRanking.objects.create(player=player, rank=rank)
                    ranklist.append({'rank': rank, 'player': {'id': player.id, 'name': player.name, 'fide': player.fide_id}})
                    ranked_players.append(player.id)

            remaining_players = players.exclude(id__in=ranked_players).order_by('name')

            for player in remaining_players:
                remaining_players_list.append({'id': player.id, 'name': player.name, 'fide': player.fide_id})

            return Response(
                status=status.HTTP_200_OK,
                data={'problem': problem, 'ranklist': ranklist, 'remaining_players': remaining_players_list},
            )
        except:
            print(traceback.format_exc())
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@authentication_classes([])
@permission_classes([])
class RatingTypeView(generics.ListAPIView):
    queryset = RatingType.objects.all()
    serializer_class = RatingTypeSerializerL


class TournamentApplicationViewLC(generics.ListCreateAPIView):
    queryset = TournamentApplication.objects.all()
    serializer_class = TournamentApplicationSerializerCRUD


class TournamentApplicationViewU(generics.UpdateAPIView):
    queryset = TournamentApplication.objects.all()
    serializer_class = TournamentApplicationSerializerCRUD


class TournamentResultsView(APIView):
    def post(self, request):
        tournament = Tournament.objects.get(pk=request.data['id'])
        TournamentResult.objects.filter(tournament=tournament).delete()
        for row in request.data['results']:
            TournamentResult.objects.create(player=User.objects.get(pk=row['player']['id']), tournament=tournament, place=row['place'], category=row['category'])

        return Response(status=status.HTTP_200_OK)


class TournamentViewLC(generics.ListCreateAPIView):
    queryset = Tournament.objects.all().order_by('start_date')
    serializer_class = TournamentSerializerLCRUD


class TournamentViewRUD(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializerLCRUD
