from django.db import migrations
from django.conf import settings
from api.models import User


def create_initial_types(apps, schema_editor):
    RatingType = apps.get_model('api', 'RatingType')
    ItemType = apps.get_model('api', 'ItemType')
    DocumentType = apps.get_model('api', 'DocumentType')

    RatingType.objects.create(name='Standard')
    RatingType.objects.create(name='Rapid')
    RatingType.objects.create(name='Blitz')

    ItemType.objects.create(name='Sakkóra')
    ItemType.objects.create(name='Készlet')
    ItemType.objects.create(name='Könyv')

    DocumentType.objects.create(name='Fénykép')
    DocumentType.objects.create(name='Körlevél')
    DocumentType.objects.create(name='Jegyzőkönyv')
    DocumentType.objects.create(name='Versenykiírás')


def generate_superuser(apps, schema_editor):
    user = User.objects.create(email=settings.DJANGO_SUPERUSER_EMAIL, name=settings.DJANGO_SUPERUSER_NAME, is_staff=True)
    user.set_password(settings.DJANGO_SUPERUSER_PASSWORD)
    user.save()


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [migrations.RunPython(create_initial_types), migrations.RunPython(generate_superuser)]
