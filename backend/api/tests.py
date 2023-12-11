from django.test import TestCase
from datetime import date
from .models import User, Payment, EloLog, RatingType, PowerRanking, Item, ItemType, Lending


class UserModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@test.com', name='Test User', is_male=True, password='123')

    def test_user_creation(self):
        self.assertEqual(self.user.email, 'test@test.com')
        self.assertEqual(self.user.name, 'Test User')
        self.assertTrue(self.user.is_male)
        self.assertFalse(self.user.is_staff)

    def test_payment_creation(self):
        payment = Payment.objects.create(player=self.user, date=date.today(), start=date.today(), amount=100)
        self.assertEqual(payment.player, self.user)
        self.assertEqual(payment.amount, 100)


class EloLogModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@test.com', name='Test User', is_male=True, password='123')
        self.rating_type = RatingType.objects.create(name='Standard')

    def test_elo_log_creation(self):
        elo_log = EloLog.objects.create(player=self.user, date=date.today(), rating=1500, rating_type=self.rating_type)
        self.assertEqual(elo_log.player, self.user)
        self.assertEqual(elo_log.rating, 1500)
        self.assertEqual(elo_log.rating_type, self.rating_type)


class PowerRankingModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@test.com', name='Test User', is_male=True, password='123')

    def test_power_ranking_creation(self):
        power_ranking = PowerRanking.objects.create(player=self.user, rank=1)
        self.assertEqual(power_ranking.player, self.user)
        self.assertEqual(power_ranking.rank, 1)


class ItemModelTestCase(TestCase):
    def test_item_creation(self):
        item_type = ItemType.objects.create(name='Sakkóra')
        item = Item.objects.create(name='DGT 2010', type=item_type, count=5)
        self.assertEqual(item.name, 'DGT 2010')
        self.assertEqual(item.type, item_type)
        self.assertEqual(item.count, 5)


class LendingModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@test.com', name='Test User', is_male=True, password='123')
        self.item_type = ItemType.objects.create(name='Sakkóra')
        self.item = Item.objects.create(name='DGT 2010', type=self.item_type, count=5)

    def test_lending_creation(self):
        lending = Lending.objects.create(player=self.user, item=self.item, count=2, start_date=date.today(), end_date=date.today())
        self.assertEqual(lending.player, self.user)
        self.assertEqual(lending.item, self.item)
        self.assertEqual(lending.count, 2)
        self.assertEqual(lending.start_date, date.today())
        self.assertEqual(lending.end_date, date.today())
