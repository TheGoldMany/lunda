# Szolgáltatás-piactér koncepció

Design csapat számára — élmény és felhasználói utak

## 1. A koncepció röviden

Uber-szerű, kétoldalú piactér-alkalmazás, ahol a fuvar helyett szakipari szolgáltatásokat (kezdetben víz-, gáz- és villanyszerelés) lehet igényelni, illetve szolgáltatóként vállalni. A cél egy gyors, megbízható párosítás megrendelő és szakember között — mind sürgős hibaelhárításra, mind tervezett munkára.

## 2. Két perszóna, két nagyon eltérő élmény

| | Megrendelő | Szolgáltató |
|---|---|---|
| Helyzet | Otthoni probléma van (pl. csöpög a csap, kiment az áram), gyakran stresszes, sürgős állapotban | Szakember, aki napi munkái mellett új megbízásokat keres, útközben/munkaközben használja az appot |
| Fő igény | Gyors, megbízható segítség, átlátható ár, ne kelljen ismerősöket hívogatnia | Kiszámítható, jó minőségű megbízás-áramlás, gyors adminisztráció, biztos fizetés |
| Fő félelem | Becsapják, túlárazzák, vagy nem jön szakember időben | Nem fizetnek neki, rossz értékelést kap jogtalanul, sok idő megy adminisztrációra |
| UX következmény | Bizalmi jelek (értékelés, verifikáció-jelvény) legyenek azonnal láthatók; az ár és az idő legyen világos, mielőtt elköteleződik | A jelentkezés/ajánlatadás legyen néhány érintésben elvégezhető, lehetőleg egy kézzel, mozgás közben is |

## 3. A tervezés vezérelve: bizalom

Ez nem egy szórakoztató vagy impulzus-vezérelt alkalmazás — pénzt, otthoni biztonságot (gáz, villany) és időbeosztást érintő döntésekről van szó. Az UX-nek minden lépésben azt kell sugallnia: "ez a szakember valóban jogosult erre, és tudom, mire számíthatok". Ez konkrétan azt jelenti, hogy a verifikációs jelvény, az értékelések és az ár/idő-átláthatóság nem másodlagos díszítőelem, hanem a fő konverziós tényező.

## 4. Fő felhasználói utak, amikre képernyőterv kell

### 4.1 Megrendelői oldal

1. Onboarding / regisztráció
2. Szakág-választás (víz / gáz / villany) — vizuálisan jól megkülönböztethető ikonokkal
3. Probléma leírása: rövid szöveg + fotó/videó feltöltés (laikus nyelvezet, ne szakzsargon)
4. Sürgősség kiválasztása: "most azonnal" vs. "tervezem, van rá időm"
5. Találati lista / ajánlatok összehasonlítása (ár, becsült idő, értékelés, verifikáció-jelvény)
6. Foglalás megerősítése, chat a szolgáltatóval
7. Fizetés
8. Értékelés a munka után

### 4.2 Szolgáltatói oldal

1. Regisztráció + szakág(ak) megadása
2. Végzettség/engedély-dokumentum feltöltése és a verifikációs állapot követése (függőben / jóváhagyva / elutasítva)
3. Elérhetőség/naptár beállítása
4. Beérkező munkák / ajánlatkérések listája, gyors elfogadás vagy árajánlat-küldés
5. Munka lezárása, fizetés státusza, értékelés fogadása

## 5. Kulcs UX-döntési pontok, amiket érdemes közösen kigondolni

- Hogyan kommunikáljuk vizuálisan a "verifikált szakember" státuszt úgy, hogy az valóban bizalmat építsen, ne csak egy jelvény legyen a sok közül.
- Hogyan segítsünk egy laikus megrendelőnek pontosan leírni a problémát (pl. irányított kérdések / kategórián belüli gyors-választható tipikus hibák), hogy a szolgáltató reális ajánlatot tudjon adni.
- Sürgős vs. tervezett munka: vizuálisan és a flow szintjén is egyértelműen külön kell válnia már a kezdő képernyőn.
- Az árajánlat-összehasonlító nézet (tervezett munkánál több ajánlat is érkezhet) — hogyan tegyük könnyen összevethetővé anélkül, hogy táblázat-szerűen száraz legyen.
- Szolgáltatói oldalon az adminisztráció legyen minimális — sok szakember nem "appos generáció", ezért az egyszerűség itt kritikusabb, mint a megrendelői oldalon.

## 6. Induló scope (MVP)

Három szakág (víz, gáz, villany), egy város, mindkét fő flow (sürgős és tervezett), alap chat és értékelési rendszer. A vizuális rendszernek úgy kell épülnie, hogy később új szakágak (pl. asztalos, festő) egyszerűen hozzáadhatók legyenek anélkül, hogy újra kellene tervezni az alap-flow-kat.

## 7. Nyitott kérdések a design csapat felé

- Milyen vizuális nyelv/hangulat illik ehhez a kategóriához — inkább megbízható-visszafogott (banki/biztosítási appok mintájára), vagy barátságosabb-közvetlenebb?
- Kell-e élő térképes követés (mint Uber sofőr-nyomkövetés) az MVP-ben, vagy elég egy egyszerű "becsült érkezés: kb. X perc" jelzés?
- Hogyan különböztessük meg vizuálisan a három szakágat (szín/ikon-rendszer), hogy skálázható maradjon további szakágak hozzáadásakor?

---

## Ebből a build-ből mi készült el

### 1. kör: a sürgős (4.1) megrendelői és szolgáltatói út

Szakág-választás ikonokkal, probléma leírása, cím megadása, a legközelebbi verifikált szakemberek listája (távolság, becsült érkezés, irányár, értékelés), foglalás állapotának követése, és a munka után kétirányú csillagos értékelés. A szolgáltatói oldalról a profil/verifikáció-státusz követés, a beérkező munkák listája és a munka lezárása készült el.

### 2. kör: sürgős/tervezett szétválasztás a kezdő képernyőn + tervezett flow + fizetés + chat

- Az "Mikorra kell?" választó ("Most azonnal" vs. "Tervezem, van rá időm") már az új-munka képernyő tetején jelenik meg, pontosan a 7. pontban feltett elvárás szerint — vizuálisan és flow szinten is azonnal elválik a két út.
- Tervezett munkánál a megrendelő a beérkezett ajánlatokat kártyás listában látja (ár, időtartam, értékelés, üzenet), a legolcsóbb kiemelve — nem táblázat-szerű, összevethető marad anélkül, hogy száraz lenne (5. pont egyik nyitott kérdése).
- Az árajánlat elfogadása után a foglalás nézet egy egyszerű, buborékos chat-sávot kap (saját üzenet jobbra/zöld, partneré balra/fehér) és egy fizetés-dobozt ("Fizetés (teszt mód)" gomb, majd "Kifizetve" jelzés) — az értékelés-form csak fizetés után jelenik meg.

**Vizuális nyelv egyelőre**: megbízható-visszafogott irányba tolva (sötétzöld elsődleges szín, letisztult kártyák, jól látható jelvény-szerű állapotcímkék a verifikációhoz/foglalás-státuszhoz/fizetéshez) — ez egy kiindulási pont, nem végleges döntés a design csapat 7. pontban feltett kérdésére.

### 3. kör: térkép + UX-finomítás

Válasz a 7. pont "kell-e élő térképes követés" kérdésére: **statikus térkép igen, élő GPS-nyomkövetés nem** — ez tűnik a jó középútnak ebben a fázisban.

- **Helyszín-választás térképen**: az új-munka űrlapon a korábbi kézi koordináta-mezők helyett egy kattintható/húzható térképes jelölő van (a pontos koordináták kézi megadása másodlagos, összecsukott opcióként megmaradt tartaléknak). "Saját helyzetem" gomb az azonnali geolokációhoz.
- **Szakember-térkép a sürgős flow-ban**: a megrendelő a munka helyszínét és a rangsorolt szakembereket egyszerre látja a térképen (jelölő + lista együtt, nem az egyik váltja a másikat), popupban ár/idő/értékelés.
- **Ajánlat-térkép a tervezett flow-ban**: hasonlóan, az ajánlatot adó szolgáltatók helye is látszik a térképen.
- **Szolgáltatói oldal**: a beérkező (sürgős) és tervezett munkák térképen is megjelennek a szolgáltató saját helyzetéhez képest; a térképi jelölő popupjából közvetlenül el lehet fogadni a munkát / árajánlatot lehet küldeni rá — nem kell visszagörgetni a listához.
- **Foglalás-nézet**: kis, nem interaktív térkép mutatja a munka pontos helyét mindkét oldalon.
- **Visszajelzés**: rövid, eltűnő toast-üzenetek (pl. "Munka elfogadva!", "Sikeres fizetés!") a korábbi néma állapotváltások helyett, és pulzáló váz (skeleton) placeholder a listák betöltésekor a puszta "Betöltés..." szöveg helyett.

A térkép OpenStreetMap-alapú (Leaflet), API-kulcs nélkül működik — ez fontos, mert nem köti a projektet egy fizetős térkép-szolgáltatóhoz már az MVP fázisban sem.

### 4. kör: szolgáltatói elérhetőség, fotó a probléma leírásához, értesítések

- **"Elérhető vagyok" kapcsoló** a szolgáltatói felület tetején (Munkák oldal) — egy érintéssel ki/bekapcsolható, azonnali visszajelzéssel (toast). Válasz arra a korábban rejtve maradt hiányosságra, hogy a `isAvailable` adat megvolt, de semmilyen felület nem engedte állítani.
- **Fotó csatolása a probléma leíráshoz** — pontosan a design koncepció 4.1 pontjában szereplő elvárás ("rövid szöveg + fotó/videó feltöltés"). Előnézettel, eltávolítás-gombbal; a fotó megjelenik a megrendelő saját listájában/részletes nézetében és a szolgáltató beérkező-munka listájában/térképi popupjában is (nem csak elrejtve várja, hogy valaki rákattintson).
- **Értesítési harang** a fejlécben, olvasatlan-jelvénnyel és lenyíló listával — ez adja a válasz a korábbi "nincs push notification" hiányra egy, ebben a fázisban reálisan megvalósítható formában: nem böngésző-szintű push, hanem alkalmazáson belüli, azonnal látható visszajelzés a fontos eseményekhez (elfogadták a munkát, új ajánlat érkezett, fizetni kell, megérkezett a fizetés, elbírálták a verifikációt).

**Amit ez a build nem tartalmaz még**: videó feltöltés, élő GPS-nyomkövetés, valódi böngésző-push, valódi fizetési gateway, helyszín-keresés/geokódolás címből (a "Cím" mező és a térképi pont egyelőre külön adatok, nincs automatikus összekapcsolás). Ezek a következő iterációk témái.

### 5. kör: vizuális rendszer csere — emoji helyett ikonok, "high-tech enterprise" hangulat

A korábbi build emoji-ikonokat (💧🔥⚡🔔📍🏠🔧, ★ szöveges csillag) és egy visszafogott, banki-jellegű zöld paletta használt. Kifejezett visszajelzés alapján ez a kör lecserélte mindkettőt:

- **Ikonrendszer**: minden emoji helyett [Lucide](https://lucide.dev) SVG-ikon (konzisztens vonalvastagság, méret, stílus) — `src/lib/icons.tsx`. A térképjelölők (Leaflet `divIcon`) is ugyanazokat a path-adatokat használják nyers SVG-ként, mivel a térkép-könyvtár natív HTML-t vár, nem React-elemet. Szakágankénti színkódolt jelvény (`TradeBadge`): víz=kék, gáz=narancs, villany=borostyán — megválaszolja a design-koncepció 6. pontjának nyitott kérdését ("hogyan különböztessük meg vizuálisan a három szakágat").
- **Vizuális nyelv csere**: indigó (#4338ca) elsődleges szín cián kiegészítővel a korábbi zöld helyett, önhosztolt Inter betűtípus (`@fontsource/inter`, nem CDN-ről), finomabb szürke-kék semleges paletta, konzisztens árnyék-/lekerekítés-skála. Az eyebrow-stílusú szekciócímek (kis, nagybetűs, betűközzel elhúzott feliratok), a pöttyel jelzett állapot-pillék, a sötét chrome-alapú toast (zöld/piros ékezettel a bal szélen), és a kártyák enyhe belépő-animációja (`rise-in`) mind ezt az irányt erősítik.
- **Valódi hiba javítva közben**: a `.content` flex-konténer alapértelmezett `align-items: stretch` viselkedése miatt minden kártya a teljes nézet magasságára nyúlt, hatalmas üres teret hagyva rövid tartalom (pl. bejelentkezés) alatt — ez `align-items: flex-start`-ra javítva. Egy másik, kevésbé nyilvánvaló hiba: a globális `button:hover:not(:disabled)` szabály specifikussága felülírta a finomabb, egy-osztályos hover-stílusokat (harang gomb, csillag-választó, szakág-kártyák), így azok hoverkor tévesen tömör indigó háttérré váltak volna — javítva a `:not(:disabled)` eltávolításával és `pointer-events: none` hozzáadásával a letiltott gombokhoz.
