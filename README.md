# Szakdolgozat - Sakkegyesületi nyilvántartó rendszer

### Telepítési útmutató Windows operációs rendszerhez:

Node LTS verziójának letöltése és telepítése: https://nodejs.org/en/download

Python 3.12 verziójának letöltése és telepítése: https://www.python.org/downloads/

Mind a Node, mind a Python be kell, hogy kerüljön a környzeti változók közé.

#### Backend projekt (backend mappa)

- A mappába szükséges egy `.env` fájl, az alábbi kulcsokkal: DJANGO_SUPERUSER_EMAIL, DJANGO_SUPERUSER_PASSWORD, DJANGO_SUPERUSER_NAME, MEDIA_URL, SECRET_KEY például:

DJANGO_SUPERUSER_EMAIL=test@test.com

DJANGO_SUPERUSER_PASSWORD=123

DJANGO_SUPERUSER_NAME=Margl Roland

MEDIA_URL=.documents/

SECRET_KEY=6tzghjuifdfeymcmcpepwflcpwpeprpwdxsspvvc912121`

- Virtuális környezet létrehozása: `python -m venv env`

- Virtuális környezet aktiválása: `.\env\Scripts\activate`

- Szükséges csomagok telepítése: `pip install -r requirements.txt`

- Adatbázis migrálása: `python manage.py migrate`

- Opcionális adatbetöltés: `python manage.py loaddata sampledata.json` vagy `python manage.py testdata.json`. Az elsődleges kulcsok úgy vannak megírva, hogy egy adatbázisra csak az egyik illeszthető be közvetlenül a kezdeti migráció után. Előbbi JSON fájl rekordjai rendelkeznek némi valóságalappal, utóbbi kifejezetten teszthez generált adatokat tartalmaz.

- A szerver indítása (localhost:8000 porton): `python manage.py runserver`

Az első installáció után már csak a `.\env\Scripts\activate` és `python manage.py runserver` parancsokra van szükség.

#### Frontend projekt

- Nyisson adminisztátorként egy terminált

- A csomagkezelő helyes működéséhez `corepack enable` és `yarn set version stable` parancsok

- Frontend mappába navigálás

- A csomagok telepítése `yarn`

- A szerver indítása (localhost:5173 porton): `yarn vite`

Az első installáció után már csak a `yarn vite` parancsra van szükség
