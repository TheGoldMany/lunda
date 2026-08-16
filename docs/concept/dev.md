# Szolgáltatás-piactér koncepció

Fejlesztői csapat számára — technikai és termék áttekintés

## 1. A koncepció röviden

Uber-szerű, kétoldalú piactér-alkalmazás, ahol a fuvar helyett szakipari szolgáltatásokat (kezdetben víz-, gáz- és villanyszerelés) lehet igényelni, illetve szolgáltatóként vállalni. A cél egy gyors, megbízható párosítás megrendelő és szakember között, sürgős hibaelhárításra és tervezett munkára egyaránt.

## 2. Miért tér el a fuvar-modelltől

- A fuvar homogén és percek alatt lezajlik; a szerelés heterogén (szakágtól és munka jellegétől függően nagyon eltérő) és gyakran napok/hetek alatt fut le.
- Az ár sok esetben nem adható meg előre fixen — helyszíni felmérés vagy legalább részletes leírás/fotó szükséges.
- A szolgáltatói oldal engedélyköteles: gáz- és villanyszerelésnél Magyarországon jogszabályi végzettség/jogosultság szükséges. Ez közvetlen hatással van az adatmodellre és az onboarding logikára.
- Ebből következik: két külön fő folyamatra van szükség egy egyszerű "kérj-egy-fuvart" gomb helyett (lásd 4. pont).

## 3. Felhasználói szerepkörök

- **Megrendelő** — munkát ad fel, ajánlatokat fogad el, fizet, értékel.
- **Szolgáltató** — regisztrál és verifikálja magát, munkákra jelentkezik vagy ajánlatot ad, elvégzi a munkát, fizetést kap.
- **Admin** — verifikációt hagy jóvá/utasít el, vitás eseteket kezel, jutalékot/díjszabást állít.

## 4. Fő folyamatok (user flow szinten)

### 4.1 Sürgős munka (pl. csőtörés, áramkimaradás)

1. Megrendelő kiválasztja a szakágat és leírja a problémát (rövid szöveg + opcionális fotó).
2. A rendszer a legközelebbi, elérhető és verifikált szolgáltatókat listázza becsült kiszállási idővel és irányárral.
3. Megrendelő választ, a szolgáltató elfogadja → Booking jön létre azonnal.
4. Helyszíni munka után a végső ár rögzítése, fizetés, majd kölcsönös értékelés.

### 4.2 Tervezett munka (pl. fürdőszoba-felújítás)

1. Megrendelő részletesebb leírást ad (méretek, fotók, kívánt időpont-tartomány).
2. Több szolgáltató árajánlatot (Quote) küldhet be, ezek összehasonlíthatók.
3. Megrendelő elfogad egyet → Booking jön létre a megbeszélt időpontra.
4. A munka elvégzése után fizetés és értékelés, mint fent.

### 4.3 Szolgáltató-regisztráció és verifikáció

1. Alapadatok, szakág(ak) kiválasztása, díjszabás megadása.
2. Végzettséget/engedélyt igazoló dokumentum feltöltése — admin manuális jóváhagyásig a profil nem jelenik meg a találatok között.
3. Naptár/elérhetőség beállítása.

## 5. Adatmodell (első vázlat)

| Entitás | Fő mezők | Megjegyzés |
|---|---|---|
| User | id, név, telefon, email, szerep (megrendelő/szolgáltató/admin) | Egy fiók lehet mindkét szerepben is |
| ServiceProvider | szakág(ak): víz/gáz/villany, engedély-dokumentum, verifikációs státusz, díjszabás, elérhetőségi naptár, értékelés-átlag | Verifikáció nélkül nem jelenhet meg találati listában |
| JobRequest | megrendelő id, szakág, leírás, fotó/videó melléklet, helyszín, sürgősségi szint (azonnali/tervezett), állapot | Az állapotgép köti össze a többi entitást |
| Quote | job_request id, szolgáltató id, ár, becsült időtartam, érvényesség, státusz (elfogadva/elutasítva/lejárt) | Csak a "tervezett munka" flow-ban jön létre |
| Booking | job_request id, szolgáltató id, időpont, státusz (foglalt/folyamatban/lezárva/lemondva) | Sürgős flow-nál automatikusan létrejön párosításkor |
| Payment | booking id, összeg, fizetési mód, státusz, jutalék mértéke | Barion/Stripe integráció; jutalék-számítás itt történik |
| Review | booking id, értékelő id, pontszám, szöveg | Kétirányú: megrendelő és szolgáltató is értékel |

## 6. Technikai integrációk és követelmények

- Geolokáció + térkép a szolgáltató-kereséshez és a becsült érkezési időhöz.
- Fizetési szolgáltató (pl. Barion vagy Stripe) — jutalék-levonással a szolgáltató kifizetésekor.
- Chat/üzenetküldés megrendelő és szolgáltató között a munka egyeztetéséhez.
- Push notification (új ajánlat, elfogadott munka, emlékeztető).
- Dokumentum-feltöltés és tárolás a szakképesítési igazolásokhoz, biztonságos hozzáféréssel (csak admin láthatja).
- Naptár-integráció / saját ütemező a szolgáltatói elérhetőséghez.

## 7. Nem-funkcionális szempontok

- Kezdeti scope: egyetlen város/régió, hogy a szolgáltató-sűrűség elég legyen a gyors párosításhoz.
- GDPR: személyes adatok (cím, telefonszám, végzettségi dokumentum) fokozott védelme.
- Skálázhatóság: az architektúrát úgy érdemes tervezni, hogy új szakágak (asztalos, festő stb.) később könnyen hozzáadhatók legyenek a meglévő JobRequest/Quote/Booking modellhez.

## 8. MVP javasolt scope

- 3 szakág: víz, gáz, villany.
- Mindkét flow (sürgős + tervezett), mert a gáz/villany munkák jelentős része tervezett.
- Szolgáltató-verifikáció manuális admin jóváhagyással (automatizált ellenőrzés később).
- Egy fizetési mód, egy város.
- Alap értékelési rendszer, chat, push notification.

## 9. Nyitott kérdések a fejlesztői csapat felé

- Fix jutalék vagy szolgáltatói előfizetés legyen az első monetizációs modell — ennek technikai vonzata van a Payment entitás körül.
- Hogyan validáljuk a gáz-/villanyszerelői engedélyt automatikusan (van-e elérhető hatósági/kamarai adatbázis API), vagy marad manuális admin-jóváhagyás.
- Kell-e élő helyzet-követés (mint az Uber sofőr-térképe) az MVP-ben, vagy elég a becsült érkezési idő.

---

## Ebből a build-ből mi készült el

### 1. kör (2026-08-16): alap-adatmodell + sürgős munka flow

- **Backend**: `backend/` — Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, JWT-alapú auth.
- **Frontend**: `frontend/` — React, TypeScript, Vite, React Router.
- **Adatmodell**: User, ServiceProvider, JobRequest, Booking, Review.
- **Flow**: regisztráció/bejelentkezés → megrendelő sürgős munkát ad fel → rendszer rangsorolja a legközelebbi verifikált szolgáltatókat (távolság + becsült érkezés + irányár) → szolgáltató elfogadja (race-safe, csak egyvalaki foglalhatja le) → helyszíni munka után szolgáltató rögzíti a végösszeget → kétirányú értékelés.
- **Admin**: szolgáltató-verifikációs sor jóváhagyással/elutasítással.

### 2. kör (2026-08-16): tervezett munka flow + fizetés (mock) + chat

- **Adatmodell bővítés**: `Quote` (árajánlat), `Payment` (mockolt fizetés), `Message` (chat); `JobRequest.preferredStartAt/preferredEndAt`, `Booking.scheduledAt`.
- **4.2 Tervezett munka flow**: megrendelő időablakkal adja fel a munkát → több szolgáltató küld árajánlatot (ár, időtartam, javasolt kezdés, üzenet) → megrendelő összehasonlítja (ár szerint rendezve) és elfogad egyet → Booking jön létre az egyeztetett időpontra, a többi ajánlat elutasítottá válik (race-safe, mint a sürgős flow-nál).
- **Fizetés**: a munka lezárásakor (`finalPrice` rögzítésekor) automatikusan létrejön egy `Payment` rekord 15%-os jutalékkal; a megrendelő "kifizeti" (mockolt, nincs valódi Barion/Stripe hívás). Az értékelés csak fizetés után adható le — ez követi a koncepcióban leírt sorrendet (végső ár → fizetés → értékelés).
- **Chat**: a foglaláshoz kötött, egyszerű szöveges üzenetváltás megrendelő és szolgáltató között, mindkét oldali nézetben (5 másodperces pollinggal, mint a többi élő állapot).

### Tudatos egyszerűsítések, amik továbbra is fennállnak

- **Nincs valódi fizetési gateway** (Barion/Stripe) — a "Fizetés" gomb azonnal PAID-re állítja a mockolt Payment rekordot, nincs kártyaadat-kezelés.
- **Nincs push notification** — minden nézet pollinggal frissül (5–8 mp).
- **Az elfogadás egylépéses** a sürgős flow-ban: bármelyik illeszkedő szakágú, verifikált és elérhető szolgáltató láthatja és elfogadhatja a nyitott kérést a beérkező-listájában (nincs külön "meghívom ezt a szolgáltatót" lépés).
- Egyetlen város (Budapest) feltételezve, koordináta-alapú (haversine) távolságszámítással, valós térkép/geokódolás nélkül.
- Fotó/videó feltöltés még nincs (a `photoUrl` mező csak egy URL-t fogad el, nincs fájlfeltöltő UI).
