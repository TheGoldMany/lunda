# lunda

Uber-szerű, kétoldalú szolgáltatás-piactér szakipari munkákra (kezdetben víz-, gáz- és villanyszerelés). A koncepció teljes leírása: [`docs/concept/dev.md`](docs/concept/dev.md) és [`docs/concept/design.md`](docs/concept/design.md).

Ez a build a koncepció első, működő szeletét tartalmazza: **teljes alap-adatmodell + a sürgős munka flow végponttól végpontig** (regisztráció → munka feladása → legközelebbi verifikált szolgáltatók listája → foglalás → lezárás → kétirányú értékelés), admin verifikációs sorral. Amit ez a szelet *nem* tartalmaz (fizetés, chat, push, tervezett munka/árajánlat flow) az a `docs/concept/dev.md` alján van felsorolva.

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
| `POST /job-requests` | megrendelő | Sürgős munka feladása |
| `GET /job-requests/:id/providers` | megrendelő | Legközelebbi verifikált szolgáltatók (távolság, becsült idő, irányár) |
| `GET /bookings/incoming` | szolgáltató | Hozzá illő nyitott munkák |
| `POST /bookings` | szolgáltató | Munka elfogadása → Booking létrejön |
| `PATCH /bookings/:id/complete` | szolgáltató | Végösszeg rögzítése, munka lezárása |
| `POST /reviews` | megrendelő/szolgáltató | Kétirányú értékelés lezárt munkára |
| `POST /providers/me` | szolgáltató | Onboarding-profil (szakág, díjszabás, helyszín) |
| `GET /providers/pending`, `PATCH /providers/:id/verify` | admin | Verifikációs sor jóváhagyással/elutasítással |

## Adatmodell

Lásd `backend/prisma/schema.prisma`: `User`, `ServiceProvider`, `JobRequest`, `Booking`, `Review`. A `Quote` és `Payment` entitások (tervezett munka flow, fizetési integráció) még nincsenek implementálva.
