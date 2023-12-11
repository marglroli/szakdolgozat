from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import *
from datetime import datetime


class SignInSerializer(TokenObtainPairSerializer):
    def get_token(cls, user):
        token = super().get_token(user)
        token['user'] = LoginSerializer(user).data

        return token


class LoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "is_staff"]


class ProfileSerializer(serializers.ModelSerializer):
    next_tournament = serializers.SerializerMethodField()
    tournament_count = serializers.SerializerMethodField()
    results = serializers.SerializerMethodField()
    ratings = serializers.SerializerMethodField()
    last_payment = serializers.SerializerMethodField()
    lending = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = "__all__"

    def get_next_tournament(self, instance):
        print(datetime.now().strftime("%Y-%m-%d"))
        applications = TournamentApplication.objects.filter(player=instance).exclude(status='Nem jövök').prefetch_related('tournament').filter(tournament__start_date__gte=datetime.now().strftime("%Y-%m-%d")).order_by('tournament__start_date')
        if len(applications):
            return {'name': applications[0].tournament.name, 'start_date': (applications[0].tournament.start_date.strftime("%Y-%m-%d"))}
        return {'name': '-', 'start_date': '-'}

    def get_tournament_count(self, instance):
        applications = TournamentApplication.objects.filter(player=instance).exclude(status='Nem jövök').prefetch_related('tournament').filter(tournament__start_date__lte=datetime.now().strftime("%Y-%m-%d"))
        team = applications.filter(tournament__is_team=True)
        return {'all': len(applications), 'team': len(team)}

    def get_results(self, instance):
        podiums = TournamentResult.objects.filter(player=instance, place__lte=3)
        wins = podiums.filter(place=1)
        return {'podiums': len(podiums), 'wins': len(wins)}

    def get_ratings(self, instance):
        standard = EloLog.objects.filter(player=instance, rating_type__id=1).order_by('-date')
        rapid = EloLog.objects.filter(player=instance, rating_type__id=2).order_by('-date')
        blitz = EloLog.objects.filter(player=instance, rating_type__id=3).order_by('-date')
        return_data = {}

        if len(standard):
            return_data.update({'standard': standard[0].rating})
        else:
            return_data.update({'standard': '-'})
        if len(rapid):
            return_data.update({'rapid': rapid[0].rating})
        else:
            return_data.update({'rapid': '-'})
        if len(blitz):
            return_data.update({'blitz': blitz[0].rating})
        else:
            return_data.update({'blitz': '-'})

        return return_data

    def get_last_payment(self, instance):
        records = Payment.objects.filter(player=instance).order_by('-end')
        if len(records):
            return records[0].end
        return '-'

    def get_lending(self, instance):
        records = Lending.objects.filter(player=instance, end_date__isnull=True).prefetch_related('item')
        return LendingSerializerLCRUD(records, many=True).data


class PlayerSerializerCRUD(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"

    def create(self, validated_data):
        user = User.objects.create(
            email=validated_data['email'],
            name=validated_data['name'],
            address=validated_data['address'],
            birthdate=validated_data['birthdate'],
            birthplace=validated_data['birthplace'],
            fide_id=validated_data['fide_id'],
            komir_id=validated_data['komir_id'],
            is_staff=validated_data['is_staff'],
            is_male=validated_data['is_male'],
            mother_name=validated_data['mother_name'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class PlayerSerializerL(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "fide_id"]


class DocumentSerializerLCRUD(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ["id", "name", "type"]

    def get_type(self, instance):
        return instance.type.name


class DocumentTypeSerializerLC(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = "__all__"


class ItemSerializerLCRUD(serializers.ModelSerializer):
    lended = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = "__all__"

    def get_lended(self, instance):
        count = 0
        objects = Lending.objects.filter(item=instance, end_date__isnull=True)
        for item in objects:
            count += item.count
        return count


class ItemTypeSerializerLC(serializers.ModelSerializer):
    class Meta:
        model = ItemType
        fields = "__all__"


class LendingSerializerLCRUD(serializers.ModelSerializer):
    player_name = serializers.SerializerMethodField(read_only=True)
    item_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lending
        fields = "__all__"

    def get_player_name(self, instance):
        return instance.player.name

    def get_item_name(self, instance):
        return instance.item.name


class NewsSerializerLCRUD(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = "__all__"


class TournamentSerializerLCRUD(serializers.ModelSerializer):
    applications = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = "__all__"

    def get_applications(self, instance):
        objects = TournamentApplication.objects.filter(tournament=instance)

        if not instance.power_ranking_kept:
            return TournamentApplicationSerializerL(objects, many=True).data

        coming = objects.filter(status='Jövök').values_list('player')
        power_raking_order = PowerRanking.objects.filter(player__in=coming).order_by('rank')
        ranked_players = power_raking_order.values_list('player')
        return_data = []

        for idx, record in enumerate(power_raking_order):
            application = objects.get(player=record.player)
            return_data.append(TournamentApplicationSerializerL(application).data)
            extra = {'rank': idx + 1}
            return_data[-1].update(extra)

        remaining = objects.exclude(player__in=ranked_players)
        for record in remaining:
            return_data.append(TournamentApplicationSerializerL(record).data)

        return return_data


class TournamentApplicationSerializerL(serializers.ModelSerializer):
    player = serializers.SerializerMethodField()

    class Meta:
        model = TournamentApplication
        fields = "__all__"

    def get_player(self, instance):
        return PlayerSerializerL(instance.player).data


class TournamentApplicationSerializerCRUD(serializers.ModelSerializer):
    class Meta:
        model = TournamentApplication
        fields = "__all__"


class PaymentSerializerLCRUD(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"


class RatingTypeSerializerL(serializers.ModelSerializer):
    class Meta:
        model = RatingType
        fields = "__all__"


class TournamentResultSerializer(serializers.ModelSerializer):
    player = serializers.SerializerMethodField()

    class Meta:
        model = TournamentResult
        fields = "__all__"

    def get_player(self, instance):
        return PlayerSerializerL(instance.player).data
