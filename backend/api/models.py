from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# from django.contrib.auth.hashers import  make_password


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, name='Name', is_male=True, is_staff=False, password='123'):
        user = self.model(email=self.normalize_email(email), is_staff=is_staff, is_male=is_male, name=name)
        # user = self.model(email=self.normalize_email(email), is_staff=is_staff, is_male=is_male, name=name, password=make_password(password))
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name='Name', is_male=True, password='123'):
        user = self.create_user(email=email, is_staff=True, password=password, name=name, is_male=is_male)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    class Meta:
        db_table = 'Player'

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    email = models.EmailField(max_length=100, unique=True)
    fide_id = models.CharField(max_length=15, unique=True, null=True)
    komir_id = models.CharField(max_length=15, unique=True, null=True)
    birthdate = models.DateField(null=True)
    birthplace = models.CharField(max_length=50, null=True)
    address = models.CharField(max_length=100, null=True)
    is_male = models.BooleanField(default=True)
    mother_name = models.CharField(max_length=50, null=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'


class Payment(models.Model):
    class Meta:
        db_table = 'Payment'

    id = models.AutoField(primary_key=True)
    player = models.ForeignKey('User', on_delete=models.SET_NULL, null=True)
    date = models.DateField()
    start = models.DateField()
    end = models.DateField(null=True)
    amount = models.IntegerField()


class EloLog(models.Model):
    class Meta:
        db_table = 'EloLog'

    id = models.AutoField(primary_key=True)
    player = models.ForeignKey('User', on_delete=models.SET_NULL, null=True)
    date = models.DateField()
    rating = models.SmallIntegerField()
    rating_type = models.ForeignKey('RatingType', on_delete=models.CASCADE)


class RatingType(models.Model):
    class Meta:
        db_table = 'RatingType'

    id = models.SmallAutoField(primary_key=True)
    name = models.CharField(max_length=50)


class PowerRanking(models.Model):
    class Meta:
        db_table = 'PowerRanking'

    id = models.AutoField(primary_key=True)
    player = models.ForeignKey('User', on_delete=models.CASCADE)
    rank = models.IntegerField(unique=True)


class Item(models.Model):
    class Meta:
        db_table = 'Item'

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    type = models.ForeignKey('ItemType', on_delete=models.SET_NULL, null=True)
    count = models.IntegerField()


class ItemType(models.Model):
    class Meta:
        db_table = 'ItemType'

    id = models.SmallAutoField(primary_key=True)
    name = models.CharField(max_length=50)


class Lending(models.Model):
    class Meta:
        db_table = 'Lending'

    id = models.AutoField(primary_key=True)
    player = models.ForeignKey('User', on_delete=models.CASCADE)
    item = models.ForeignKey('Item', on_delete=models.CASCADE)
    count = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField(null=True)


class Tournament(models.Model):
    class Meta:
        db_table = 'Tournament'

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    place = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    notes = models.TextField(null=True)
    is_team = models.BooleanField()
    power_ranking_kept = models.BooleanField()


class TournamentApplication(models.Model):
    class Meta:
        db_table = 'TournamentApplication'

    id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE)
    player = models.ForeignKey('User', on_delete=models.CASCADE)
    status = models.CharField(max_length=50)
    car_capacity = models.SmallIntegerField(null=True)


class TournamentResult(models.Model):
    class Meta:
        db_table = 'TournamentResult'

    id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE)
    player = models.ForeignKey('User', on_delete=models.CASCADE)
    category = models.CharField(max_length=50)
    place = models.SmallIntegerField()


class Document(models.Model):
    class Meta:
        db_table = 'Document'

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, default='name')
    content = models.BinaryField()
    uploader = models.ForeignKey('User', on_delete=models.CASCADE)
    tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE, null=True)
    news = models.ForeignKey('News', on_delete=models.CASCADE, null=True)
    type = models.ForeignKey('DocumentType', on_delete=models.CASCADE)


class DocumentType(models.Model):
    class Meta:
        db_table = 'DocumentType'

    id = models.SmallAutoField(primary_key=True)
    name = models.CharField(max_length=50)


class News(models.Model):
    class Meta:
        db_table = 'News'

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_public = models.BooleanField()
