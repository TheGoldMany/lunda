# lunda

Uber-szerű, kétoldalú szolgáltatás-piactér szakipari munkákra (kezdetben víz-, gáz- és villanyszerelés). A koncepció teljes leírása: [`docs/concept/dev.md`](docs/concept/dev.md) és [`docs/concept/design.md`](docs/concept/design.md).

Ez a build a koncepció mindkét fő flow-ját végigviszi:

- **Sürgős munka (4.1)**: regisztráció → munka feladása → legközelebbi verifikált szolgáltatók listája → foglalás (race-safe elfogadás) → lezárás.
- **Tervezett munka (4.2)**: időablakkal feladott munka → több szolgáltató árajánlatot küld → megrendelő összehasonlítja és elfogad egyet → Booking az egyeztetett időpontra.
- Mindkét flow innentől közösen folytatódik: **chat** a foglaláshoz kötve → munka lezárása végösszeggel → **fizetés** (mockolt, 15% jutalékkal) → **kétirányú értékelés** (csak fizetés után).
- **Admin**: szolgáltató-verifikációs sor jóváhagyással/elutasítással.

Amit ez a build *nem* tartalmaz (valódi fizetési gateway, push notification, fotó/videó feltöltés, élő térképes követés) az a `docs/concept/dev.md` és `docs/concept/design.md` alján van felsorolva, iterációnkénti bontásban.

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
| `GET /providers/pending`, `PATCH /providers/:id/verify` | admin | Verifikációs sor jóváhagyással/elutasítással |

## Adatmodell

Lásd `backend/prisma/schema.prisma`: `User`, `ServiceProvider`, `JobRequest`, `Quote`, `Booking`, `Payment`, `Message`, `Review`.
