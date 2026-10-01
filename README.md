# De Droom Wereld 🌙

## Concept

Een kind valt in slaap en wordt door een portaal boven het bed de droomwereld in gezogen. Daar heerst **MEESTER ROBOT**. Hij daagt je uit voor 11 spelletjes tegen zijn robothelper. Daarna volgt de eindstrijd tegen MEESTER ROBOT zelf. Versla hem en je wordt 's ochtends wakker in je eigen slaapkamer.

Het hele spel is 3D (Three.js) en draait volledig in de browser vanuit één bestand: `index.html`.

---

## Spelverloop

1. **Intro:** slaapkamer bij nacht, het portaal opent. Klik of druk op een toets om over te slaan.
2. **Titelscherm:** knop **BEGIN DE DROOM!**
3. **Levelkaart:** toont het huidige level met naam en uitleg, plus bolletjes 1 t/m 12 waarmee je naar elk level kunt springen. Knop **OVERSLAAN ⏭** (behalve bij de eindbaas) gaat meteen door naar het volgende level. Knop **START!**
4. **Level spelen:** elk level start met een aftelling. Met de ✕ knop of **Escape** pauzeer je: **stoppen** (terug naar de levelkaart) of **overslaan** (door naar het volgende level). Het level telt dan niet mee.
5. **Resultaat:**
   * Gewonnen: **VOLGENDE UITDAGING**
   * Verloren: **OPNIEUW PROBEREN** of **OVERSLAAN** (overslaan kan niet bij de eindbaas)
6. Na level 11 volgt een intro van de eindbaas, daarna level 12.
7. **Overwinning:** vuurwerk, daarna de ochtendscène: *"Het was allemaal een droom... maar jij WON!"* met knop **OPNIEUW SPELEN**.

Er zijn geen levens. Het spel houdt alleen bij hoeveel levels je gewonnen en verloren hebt. Een level dat je ooit gewonnen hebt, blijft gewonnen.

**Voortgang wordt bewaard** in de browser. Kom je terug, dan staat op het titelscherm **VERDER SPELEN** (en **NIEUW SPEL** om opnieuw te beginnen). Na de ochtendscène wordt de voortgang gewist.

**Gelijkspel betekent altijd: de robot wint.** Dat geldt voor level 1, 6, 7, 8 en 10.

---

## Levels

### Level 1: Geheugenspel 🃏
Memory aan een 3D speeltafel met 16 kaarten (8 paren). Aan het begin liggen alle kaarten een paar seconden open: onthoud ze.
* Jij begint. Vind je een paar, dan ben je nog een keer aan de beurt. Bij een fout gaat de beurt naar de robot.
* De robot onthoudt elke kaart die ooit is omgedraaid. Kent hij een paar, dan pakt hij dat in 75% van de gevallen.
* **Winnen:** meer paren dan de robot.
* **Besturing:** klik of tik op een kaart.

### Level 2: Tikkertjes 🏃
De robot is 'm op een zwevend snoepeiland met paddenstoelen, lolly's, kristallen, hooibalen en kisten als obstakels.
* Jij loopt iets sneller dan de robot (6,5 tegen 5,4), maar de robot mikt op waar je naartoe loopt.
* Power-ups: ⭐ **ster** = 4 seconden sneller, ❄️ **sneeuwvlok** = robot 3 seconden bevroren.
* **Winnen:** 45 seconden niet getikt worden.
* **Besturing:** WASD of pijltjes (touch: joystick).

### Level 3: Verstoppertje 🙈
Een diorama op tafel met 9 verstopplekken (rood huisje, schuur, grote boom, tent, houten kist, vat, tunnel, hooiberg, hondenhok). Een reuzenrobot zoekt met een vergrootglas.
* Je hebt 6 seconden om een plek te kiezen (of druk op **Klaar!**).
* De robot doorzoekt 6 van de 9 plekken in willekeurige volgorde. Doorzochte plekken krijgen een groen ✓.
* Tijdens het zoeken mag je **één keer verhuizen**. De slimme zet: sluip naar een plek met een ✓, want daar komt de robot niet meer terug. Timing is alles: verhuis je terwijl de robot in een plek kijkt ("NU sluipen!"), dan hoort hij je maar in 15% van de gevallen. Verhuis je op een ander moment, dan in 70%.
* Blijf je gewoon zitten, dan win je een ronde 1 op de 3 keer. Met goed getimed sluipen ongeveer 3 op de 4 keer.
* **Winnen:** best of 3 rondes (eerste die 2 rondes wint).
* **Besturing:** klik of tik op een plek.

### Level 4: Voetbal ⚽
1 tegen 1 zaalvoetbal in een droomstadion.
* Houd SPATIE langer ingedrukt voor een hardere trap (krachtbalk onderin).
* De robot dekt zijn doel af, blokkeert de lijn naar zijn doel en loopt om de bal heen om zelf aan te vallen.
* **Winnen:** als eerste 3 doelpunten.
* **Besturing:** WASD om te rennen, SPATIE om te schieten (touch: joystick + SCHIET).

### Level 5: Doolhof Race 🌀
Een gloeiend heggendoolhof van 15 bij 11 vakken dat elke keer nieuw wordt gegenereerd. Een lichtstraal wijst naar het gouden portaal bij de uitgang.
* De robot start 1,5 seconde later en loopt langzamer (3,4 tegen 5), maar kent de kortste route.
* **Winnen:** eerder bij het portaal zijn dan de robot.
* **Besturing:** WASD of pijltjes (touch: joystick).

### Level 6: Simon Zegt 🔮
Een kristallen tempel met 4 gekleurde kristallen (rood, blauw, geel, groen).
* Jij speelt eerst: het patroon wordt voorgedaan en jij herhaalt het. Elke ronde komt er één kleur bij, tot maximaal 20. Bij je eerste fout stopt je beurt.
* Daarna speelt de robot hetzelfde patroon. Hij drukt elke stap met 85% kans goed.
* **Winnen:** een langer patroon halen dan de robot.
* **Besturing:** klik op de kristallen of toetsen 1 t/m 4.

### Level 7: Trivia Quiz 🎤
Een tv-quizstudio. 10 vragen, willekeurig gekozen uit 51 (rekenen, taal, aardrijkskunde, natuur, feestdagen, kunst, sport en geschiedenis), met vier antwoorden.
* Per vraag heb je 12 seconden. De robot antwoordt na 2,5 tot 7 seconden en heeft 70% kans op het goede antwoord.
* **Winnen:** meer goede antwoorden dan de robot.
* **Besturing:** klik op A, B, C of D, of toetsen 1 t/m 4.

### Level 8: Ruimtegevecht 🚀
Twee ruimteschepen naast elkaar schieten 60 seconden lang op aanstormende asteroïden.
* Gewone asteroïde = 1 punt, gouden asteroïde = 2 punten. Grote asteroïden moet je twee keer raken. Het tempo gaat omhoog naarmate de tijd verstrijkt.
* **Ontwijken telt:** raak je een asteroïde, dan verlies je 2 punten en kun je 1,2 seconde niet schieten (je schip knippert). Dat geldt ook voor de robot.
* De robot richt niet perfect, verspilt soms schoten en ziet ongeveer 1 op de 4 aanstormende asteroïden te laat.
* **Winnen:** meer punten dan de robot.
* **Besturing:** WASD of pijltjes om te vliegen, SPATIE om te schieten (touch: joystick + VUUR).

### Level 9: Treinrennen 🚂
Een endless runner zoals Subway Surfers, op zwevende droomrails met 3 banen. Jij rent vooruit, de robot zit je op de hielen.
* Ontwijk hekken en treinen. **Lage hekken** (rood-wit): springen. **Hoge balken** (geel-paars): rollen. **Treinen**: wissel van baan, of ren via een **helling** omhoog en loop over de daken.
* Struikel je, dan komt de robot dichterbij (meter rechtsboven). Hij zakt langzaam weer terug. **Struikel je twee keer snel achter elkaar, dan pakt hij je.** Frontaal tegen een trein is extra gevaarlijk.
* Pak onderweg zoveel mogelijk ⭐ sterren. Het tempo gaat omhoog naarmate je verder komt.
* **Winnen:** de finish op 900 meter halen zonder gepakt te worden.
* **Besturing:** ←/→ of A/D = van baan wisselen, ↑, W of SPATIE = springen, ↓ of S = rollen (in de lucht: snel naar beneden). Touch: vegen in die richting, tikken = springen.

### Level 10: Boogschieten 🏹
Schiet met pijl en boog op een 🎯 aan het eind van een grasveld. 5 rondes; per ronde schiet jij eerst en dan de robot, onder precies dezelfde omstandigheden.
* Elke ronde staat het doel verder weg: 16, 20, 24, 28 en 32 meter. Vanaf ronde 2 waait er wind (vlag bij het doel en de balk bovenin). In ronde 4 en 5 zweeft het doel heen en weer.
* De pijl zakt door de zwaartekracht en waait mee met de wind. Richt dus iets **boven** de roos en **tegen de wind in**, en bij een bewegend doel iets **vóór** het doel.
* Hoe langer je vasthoudt, hoe strakker de boog (1 seconde = vol). Houd je langer dan ruim 2 seconden vast, dan gaat je arm trillen.
* Ronde 1 laat met een gele stippellijn zien waar je pijl heen gaat.
* Punten: geel 10, rood 8, blauw 6, zwart 4, wit 2, mis 0.
* **Winnen:** meer punten dan de robot na 5 rondes (de robot haalt gemiddeld ongeveer 30 van de 50).
* **Besturing:** muis bewegen = richten, ingedrukt houden = spannen, loslaten = schieten. Toetsenbord: pijltjes of WASD = richten, SPATIE vasthouden = spannen. Touch: tik en houd vast, schuif om te richten, laat los.

### Level 11: Robotsprong 🧱
Een platformspel van links naar rechts, in de stijl van de klassieke springspellen, maar dan met robots als vijanden.
* **Loopbot** (klein, rood): spring erbovenop om hem plat te maken. Loop je ertegenaan, dan verlies je een hartje.
* **Schildbot** (groene koepel): spring erop en hij rolt zich op tot een bal. Trap de bal weg en hij schiet door de gang en gooit andere robots om. Pas op dat hij niet terugkaatst! Na 6 seconden wordt een bal weer wakker.
* **Zweefbot** (paars, met propeller): zweeft op en neer. Spring erbovenop of wacht tot hij weg is.
* **Blokken:** stoot van onderen tegen een sterblok voor een ⭐. Eén blok met schild (🛡️) geeft een schild: één botsing gratis, en je kunt dan bakstenen blokken kapot stoten.
* Onderweg: buizen, kuilen, trappen, een **checkpoint** halverwege en de **finishvlag** aan het eind.
* 3 hartjes. Vallen in een kuil of geraakt worden kost een hartje; je gaat dan terug naar het begin of het checkpoint. Tijdslimiet 240 seconden.
* **Winnen:** de finishvlag halen.
* **Besturing:** ←/→ of A/D = lopen, SPATIE, ↑ of W = springen (langer vasthouden = hoger). Touch: joystick + SPRING-knop.

---

## Eindbaas: MEESTER ROBOT 👑

Een gevecht in drie fases in een donkere arena. Faal je in een fase, dan begin je **alleen die fase** opnieuw. Je kunt de eindbaas dus niet verliezen, alleen opnieuw proberen.

1. **Fase 1, Ontwijken:** overleef 20 seconden terwijl MEESTER ROBOT aanvalt met meteoren, laserstralen, energiebollen en schokgolven. Na 10 seconden worden de aanvallen één keer zwaarder. Je hebt 5 hartjes. Besturing: WASD of pijltjes.
2. **Fase 2, Steen-papier-schaar:** jij moet 2 rondes winnen, de robot 3. Je hebt 3 seconden per keuze; kies je niet, dan wordt er willekeurig gekozen. Besturing: knoppen of toetsen 1, 2, 3.
3. **Fase 3, Rekenrace:** sommen met +, − en ×. Typ het antwoord voordat de robot het heeft (5 tot 8 seconden, steeds iets sneller). Keersommen gaan tot 10 × 10. Jij hebt 4 goede antwoorden nodig, de robot 6. Besturing: cijfertoetsen, Enter en Backspace, of het cijferpaneel op het scherm.

---

## Technische opzet

* **Eén bestand:** `index.html` bevat Three.js r147 en alle spelcode als losse `<script>` blokken.
* **`engine.js`:** gedeelde 3D hulpfuncties onder `window.DW`: vormen en materialen, personages (`makeCharacter`, `setMood`), droomomgeving, deeltjes, HUD, geluid (Web Audio, geen geluidsbestanden) en invoer. Hier staan ook de levelnamen (`DW.meta`).
* **`framework.js`:** renderer, game loop, schermen (intro, titel, levelkaart, resultaat, eindbaas, overwinning, ochtend), voortgang, stopknop, geluidsknop en touch-besturing.
* **`level1.js` t/m `level12.js`:** elk level registreert zich met `DW.registerLevel(n, level)`. Level 12 is de eindbaas. Het aantal levels staat in `framework.js` als `NUM`; de eindbaas is altijd `BOSS = NUM - 1` (0-based).

Werkt met toetsenbord en muis én op touchscreens (virtuele joystick en actieknoppen). Touch forceren of uitzetten kan met `?touch=1` of `?touch=0` achter de URL.

---

## Hoe te spelen

Open `index.html` in een moderne browser (Chrome, Edge, Firefox of Safari). Er is geen server of installatie nodig.
