from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

from .views import *

urlpatterns = [
    path('admin-tournament-applications', AdminTournamentApplicationsView.as_view()),
    path('document/', DocumentViewLC.as_view()),
    path('document/<int:pk>', DocumentViewRUD.as_view()),
    path('document-download', DocumentDownloadView.as_view()),
    path('document-type', DocumentTypeViewLC.as_view()),
    path('document-upload', DocumentUploadView.as_view()),
    path('elo-log', GetEloLogView.as_view()),
    path('elo-stats', GetEloStatsView.as_view()),
    path('get-power-ranking', PowerRankingListView.as_view()),
    path('get-profile', GetProfileView.as_view()),
    path('get-tournament-results', GetTournamentResultsView.as_view()),
    path('item/', ItemViewLC.as_view()),
    path('item/<int:pk>', ItemViewRUD.as_view()),
    path('item-type', ItemTypeViewLC.as_view()),
    path('last-payment', GetLastPaymentView.as_view()),
    path('lending/', LendingViewLC.as_view()),
    path('lending/<int:pk>', LendingViewU.as_view()),
    path('news/', NewsViewLC.as_view()),
    path('news/<int:pk>', NewsViewRUD.as_view()),
    path('payment/', PaymentViewLC.as_view()),
    path('payment/<int:pk>', PaymentViewRUD.as_view()),
    path('player/', PlayerViewL.as_view()),
    path('player/<int:pk>', PlayerViewRUD.as_view()),
    path('power-ranking-save', PowerRankingSaveView.as_view()),
    path('power-ranking-upload', PowerRankingUploadView.as_view()),
    path('rating-types', RatingTypeView.as_view()),
    path('register/', RegisterView.as_view(), name="sign_up"),
    path('results', GetResultsView.as_view()),
    path('token/', SignInView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('tournament/', TournamentViewLC.as_view()),
    path('tournament/<int:pk>', TournamentViewRUD.as_view()),
    path('tournament-results', TournamentResultsView.as_view()),
    path('tournament-application/', TournamentApplicationViewLC.as_view()),
    path('tournament-application/<int:pk>', TournamentApplicationViewU.as_view()),
]
