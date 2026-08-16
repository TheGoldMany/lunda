# lunda

Uber-szerű, kétoldalú szolgáltatás-piactér szakipari munkákra (kezdetben víz-, gáz- és villanyszerelés). A koncepció teljes leírása: [`docs/concept/dev.md`](docs/concept/dev.md) és [`docs/concept/design.md`](docs/concept/design.md).

Ez a build a koncepció mindkét fő flow-ját végigviszi:

- **Sürgős munka (4.1)**: regisztráció → munka feladása → legközelebbi verifikált szolgáltatók listája → foglalás (race-safe elfogadás) → lezárás.
- **Tervezett munka (4.2)**: időablakkal feladott munka → több szolgáltató árajánlatot küld → megrendelő összehasonlítja és elfogad egyet → Booking az egyeztetett időpontra.
- Mindkét flow innentől közösen folytatódik: **chat** a foglaláshoz kötve → munka lezárása végösszeggel → **fizetés** (mockolt, 15% jutalékkal) → **kétirányú értékelés** (csak fizetés után).
- **Admin**: szolgáltató-verifikációs sor jóváhagyással/elutasítással.
- **Térkép mindenhol, ahol helyszín számít**: kattintható/húzható térképes helyszín-választó az új munka feladásakor, szakember-/ajánlat-térkép a rangsorolt lista mellett, térképes beérkező-munka popup közvetlen elfogadással a szolgáltatói oldalon, kis statikus térkép a foglalás-nézeteken. OpenStreetMap-alapú (Leaflet), nincs API-kulcs.
- **UX-finomítás**: toast-visszajelzés a fő akciókhoz (elfogadás, lezárás, fizetés, árajánlat), pulzáló skeleton-placeholder listák betöltés közben a puszta szöveg helyett.
- **Szolgáltatói elérhetőség-kapcsoló**: a szolgáltató egy érintéssel jelezheti, hogy jelenleg nem vállal új munkát — ilyenkor kimarad a sürgős flow rangsorolt találatai közül.
- **Fotó a munka feladásakor**: kliens-oldali tömörítés, nincs külső fájltároló — a kép `data:` URL-ként landol a meglévő `photoUrl` mezőben.
- **Értesítési harang**: olvasatlan-jelvény + lenyíló lista a fontosabb eseményekhez (elfogadott munka, új ajánlat, fizetendő/befizetett összeg, verifikációs döntés) — gyakorlati helyettesítője a valódi böngésző-push-nak ebben a fázisban.

Amit ez a build *nem* tartalmaz (valódi fizetési gateway, valódi böngésző-push, videó feltöltés, élő GPS-nyomkövetés, cím-alapú geokódolás) az a `docs/concept/dev.md` és `docs/concept/design.md` alján van felsorolva, iterációnkénti bontásban.

## Struktúra

- `backend/` — Node.js + TypeScript + Express API, Prisma ORM, PostgreSQL, JWT auth.
- `frontend/` — React + TypeScript + Vite, React Router.
- `docs/concept/` — az eredeti koncepció-dokumentumok (dev + design) markdown formában.

## Előfeltételek

- Node.js 20+
- PostgreSQL (helyi szerver vagy elérhető connection string)

## Backend indítása

```bash
cd backend
npm install
cp .env.example .env   # állítsd be a DATABASE_URL-t és a JWT_SECRET-et
npx prisma migrate deploy
npm run seed            # teszt admin/megrendelő/szolgáltató fiókokat hoz létre
npm run dev              # http://localhost:4000
```

A seed script kiírja a teszt bejelentkezési adatokat (admin, megrendelő, 3 szolgáltató — mindegyik jóváhagyott státuszban, Budapesten).

Éles buildhez: `npm run build && npm start`.

## Frontend indítása

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL a backend címére mutasson
npm run dev             # http://localhost:5173
```

Buildhez: `npm run build` (a `dist/` mappába generál statikus fájlokat).

## API végpontok (rövid áttekintés)

| Végpont | Szerepkör | Leírás |
|---|---|---|
| `POST /auth/register`, `POST /auth/login` | bárki | Regisztráció/belépés, JWT tokent ad vissza |
| `POST /job-requests` | megrendelő | Munka feladása (`urgency: URGENT` vagy `PLANNED`) |
| `GET /job-requests/:id/providers` | megrendelő | Sürgős flow: legközelebbi verifikált szolgáltatók (távolság, becsült idő, irányár) |
| `GET /job-requests/planned/open` | szolgáltató | Tervezett flow: hozzá illő nyitott munkák, amikre ajánlatot adhat |
| `GET /job-requests/:id/quotes` | megrendelő | Tervezett flow: beérkezett ajánlatok ár szerint rendezve |
| `POST /quotes` | szolgáltató | Árajánlat beküldése egy tervezett munkára (munkánként egy) |
| `POST /quotes/:id/accept` | megrendelő | Ajánlat elfogadása → Booking jön létre az egyeztetett időpontra |
| `GET /bookings/incoming` | szolgáltató | Sürgős flow: hozzá illő nyitott munkák |
| `POST /bookings` | szolgáltató | Sürgős flow: munka elfogadása → Booking létrejön |
| `GET /bookings/me` | megrendelő/szolgáltató | Saját foglalások (fizetéssel együtt) |
| `PATCH /bookings/:id/complete` | szolgáltató | Végösszeg rögzítése, munka lezárása → Payment (PENDING) létrejön |
| `GET /bookings/:id/messages`, `POST /bookings/:id/messages` | a foglalás két fele | Chat a foglaláshoz kötve |
| `POST /payments/:id/pay` | megrendelő | Fizetés (mockolt) → Payment PAID |
| `POST /reviews` | megrendelő/szolgáltató | Kétirányú értékelés lezárt és kifizetett munkára |
| `POST /providers/me` | szolgáltató | Onboarding-profil (szakág, díjszabás, helyszín) |
| `PATCH /providers/me/availability` | szolgáltató | Elérhetőség be/kikapcsolása |
| `GET /providers/pending`, `PATCH /providers/:id/verify` | admin | Verifikációs sor jóváhagyással/elutasítással |
| `GET /notifications` | bárki | Saját értesítések (legutóbbi 30) |
| `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` | bárki | Értesítés(ek) olvasottnak jelölése |

## Adatmodell

Lásd `backend/prisma/schema.prisma`: `User`, `ServiceProvider`, `JobRequest`, `Quote`, `Booking`, `Payment`, `Message`, `Review`, `Notification`.
