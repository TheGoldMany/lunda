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

## Ebből a build-ből mi készült el (2026-08-16)

Az első kódolt szeletben (`frontend/`) a 4.1 megrendelői út valósult meg: szakág-választás ikonokkal, probléma leírása, cím megadása, a legközelebbi verifikált szakemberek listája (távolság, becsült érkezés, irányár, értékelés), foglalás állapotának követése, és a munka után kétirányú csillagos értékelés. A szolgáltatói oldalról a profil/verifikáció-státusz követés, a beérkező munkák listája és a munka lezárása készült el.

**Vizuális nyelv egyelőre**: megbízható-visszafogott irányba tolva (sötétzöld elsődleges szín, letisztult kártyák, jól látható jelvény-szerű állapotcímkék a verifikációhoz/foglalás-státuszhoz) — ez egy kiindulási pont, nem végleges döntés a design csapat 7. pontban feltett kérdésére.

**Amit ez a szelet nem tartalmaz**: fotó/videó feltöltés, chat, élő térképes követés, tervezett munka / árajánlat-összehasonlítás, push notification. Ezek a következő iterációk témái.
