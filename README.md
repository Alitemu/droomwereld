# De Droom Wereld 🌙

## Concept

Een kind valt in slaap en wordt door een portaal boven het bed de droomwereld in gezogen. Daar heerst **MEESTER ROBOT**. Hij daagt je uit voor 8 spelletjes tegen zijn robothelper. Daarna volgt de eindstrijd tegen MEESTER ROBOT zelf. Versla hem en je wordt 's ochtends wakker in je eigen slaapkamer.

Het hele spel is 3D (Three.js) en draait volledig in de browser vanuit één bestand: `index.html`.

---

## Spelverloop

1. **Intro:** slaapkamer bij nacht, het portaal opent. Klik of druk op een toets om over te slaan.
2. **Titelscherm:** knop **BEGIN DE DROOM!**
3. **Levelkaart:** toont het huidige level met naam en uitleg, plus bolletjes 1 t/m 9 waarmee je naar elk level kunt springen. Knop **START!**
4. **Level spelen:** elk level start met een aftelling. Met de ✕ knop of **Escape** kun je stoppen; het level telt dan niet mee.
5. **Resultaat:**
   * Gewonnen: **VOLGENDE UITDAGING**
   * Verloren: **OPNIEUW PROBEREN** of **OVERSLAAN** (overslaan kan niet bij de eindbaas)
6. Na level 8 volgt een intro van de eindbaas, daarna level 9.
7. **Overwinning:** vuurwerk, daarna de ochtendscène: *"Het was allemaal een droom... maar jij WON!"* met knop **OPNIEUW SPELEN**.

Er zijn geen levens. Het spel houdt alleen bij hoeveel levels je gewonnen en verloren hebt. Een level dat je ooit gewonnen hebt, blijft gewonnen.

**Voortgang wordt bewaard** in de browser. Kom je terug, dan staat op het titelscherm **VERDER SPELEN** (en **NIEUW SPEL** om opnieuw te beginnen). Na de ochtendscène wordt de voortgang gewist.

**Gelijkspel betekent altijd: de robot wint.** Dat geldt voor level 1, 6, 7 en 8.

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

---

## Eindbaas: MEESTER ROBOT 👑

Een gevecht in drie fases in een donkere arena. Faal je in een fase, dan begin je **alleen die fase** opnieuw. Je kunt de eindbaas dus niet verliezen, alleen opnieuw proberen.

1. **Fase 1, Ontwijken:** overleef 30 seconden terwijl MEESTER ROBOT aanvalt met meteoren, laserstralen, energiebollen en schokgolven. Elke 8 seconden worden de aanvallen zwaarder. Je hebt 3 hartjes. Besturing: WASD of pijltjes.
2. **Fase 2, Steen-papier-schaar:** eerste die 2 rondes wint. Je hebt 3 seconden per keuze; kies je niet, dan wordt er willekeurig gekozen. Besturing: knoppen of toetsen 1, 2, 3.
3. **Fase 3, Rekenrace:** sommen met +, − en ×. Typ het antwoord voordat de robot het heeft (3 tot 6 seconden, steeds iets sneller). Eerste met 5 goede antwoorden wint. Besturing: cijfertoetsen, Enter en Backspace, of het cijferpaneel op het scherm.

---

## Technische opzet

* **Eén bestand:** `index.html` bevat Three.js r147 en alle spelcode als losse `<script>` blokken.
* **`engine.js`:** gedeelde 3D hulpfuncties onder `window.DW`: vormen en materialen, personages (`makeCharacter`, `setMood`), droomomgeving, deeltjes, HUD, geluid (Web Audio, geen geluidsbestanden) en invoer. Hier staan ook de levelnamen (`DW.meta`).
* **`framework.js`:** renderer, game loop, schermen (intro, titel, levelkaart, resultaat, eindbaas, overwinning, ochtend), voortgang, stopknop, geluidsknop en touch-besturing.
* **`level1.js` t/m `level9.js`:** elk level registreert zich met `DW.registerLevel(n, level)`.

Werkt met toetsenbord en muis én op touchscreens (virtuele joystick en actieknoppen). Touch forceren of uitzetten kan met `?touch=1` of `?touch=0` achter de URL.

---

## Hoe te spelen

Open `index.html` in een moderne browser (Chrome, Edge, Firefox of Safari). Er is geen server of installatie nodig.
