# De Droom Wereld: Spelspecificatie

Dit document beschrijft het spel zoals het nu in `index.html` gebouwd is. Gebruik het als referentie bij wijzigingen of als prompt voor een LLM. Wijkt de code af van dit document, dan is de code leidend en moet dit document bijgewerkt worden.

---

## Concept

Een kind valt in slaap en wordt door een portaal de droomwereld in gezogen, waar **MEESTER ROBOT** heerst. Het kind speelt 11 minigames tegen een robot en daarna een eindgevecht in 3 fases tegen MEESTER ROBOT. Na de overwinning wordt het kind wakker in de slaapkamer.

Doelgroep: kinderen op de basisschool. Alle tekst in het spel is Nederlands.

---

## Technische randvoorwaarden

* **Eén bestand:** `index.html`, zonder server, build-stap of externe verzoeken.
* **3D:** Three.js r147 (UMD-build, global `THREE`), ingebakken in het bestand.
* **Geluid:** Web Audio API, alle geluiden worden gesynthetiseerd. Geen audiobestanden.
* **Textures:** gegenereerd met `<canvas>` (`DW.canvasTexture`). Geen afbeeldingsbestanden.
* **Invoer:** toetsenbord, muis en touch. Touch wordt automatisch herkend en kan geforceerd worden met `?touch=1` of `?touch=0`.
* **Schermgrootte:** volledig scherm, schaalt mee met het venster; pixelratio maximaal 2.

### Volgorde van scripts

```
vendor/three.min.js
src/engine.js
src/framework.js
src/level1.js ... src/level12.js
```

Het framework start pas na `window.load`, dus levelbestanden mogen in elke volgorde na `engine.js` staan.

---

## Architectuur

### `engine.js`: gedeelde hulpfuncties (`window.DW`)

| Onderdeel | Functies |
|---|---|
| Registratie | `registerLevel(n, level)` met n = 1..12 (12 = eindbaas), `meta` (naam, uitleg, icoon per level) |
| Rekenen | `clamp`, `lerp`, `damp`, `angleLerp`, `rand`, `randInt`, `pick`, `shuffle`, `ease` |
| 3D bouwstenen | `mat`, `mesh`, `box`, `roundedBox`, `sphere`, `cyl`, `cone`, `capsule`, `canvasTexture`, `makeLabel` |
| Scène | `addLights`, `dreamEnvironment` (lucht, sterren, maan, zwevende lichtbollen, mist), `disposeScene`, `raycast`, `findUp` |
| Personages | `makeCharacter({ kind: 'kid' \| 'robot', color, scale })`, `animateCharacter`, `setMood` (`idle`, `happy`, `sad`, `think`, `angry`), `faceTowards` |
| Effecten | `Particles`, `Shaker` (camerashake) |
| HUD | `hud.top`, `hud.bottom`, `hud.scoreboard(titel, jij, robot)`, `hud.banner`, `hud.countdown()`, `hud.button`, `hud.clear` |
| Geluid | `sfx.play(naam)`, `click`, `flip`, `good`, `bad`, `win`, `lose`, `go`, `tick`, `hit`, `kick`, `pop`, `shoot`, `boom`, `whoosh` |
| Invoer | `input.keys[code]`, `input.pointer`, `input.isDown(...codes)` |

### `framework.js`: de spelschil

Het aantal levels staat als `NUM` (nu 12) bovenin; de eindbaas is altijd de laatste (`BOSS = NUM - 1`, 0-based). Een level toevoegen: level-script vóór de eindbaas zetten, `NUM` ophogen, de eindbaas een nummer hoger registreren, een regel in `DW.meta`, een kleur in `PAL` en een `case` in `addProps` (het eilandje op de levelkaart). Verhoog ook de versie van `SAVE_KEY`.

Renderer, game loop (`requestAnimationFrame`, `dt` begrensd op 0,05 s), schermen, voortgang, stopknop, geluidsknop en touch-besturing. Fouten in een level worden gelogd maar laten het spel niet crashen; ontbreekt een level, dan toont het framework een scherm met **OVERSLAAN**.

### Level-contract

Elk level is een object dat zich registreert met `DW.registerLevel(n, level)`:

```js
{
  init(api) { /* bouw this.scene en this.camera, zet HUD op, start met await DW.hud.countdown() */ },
  update(dt, t) { /* per frame */ },
  destroy() { /* timers en DOM opruimen; de scène wordt door het framework vrijgegeven */ },
  // optioneel:
  onKeyDown(e), onKeyUp(e), onPointerDown(e), onPointerMove(e), onPointerUp(e), onResize(aspect)
}
```

`api` bevat `renderer`, `canvas`, `hud`, `DW`, `aspect()` en `complete(won)`. Een level roept `api.complete(true | false)` precies één keer aan als het klaar is. Het framework negeert latere aanroepen.

---

## Schermverloop

1. **Intro:** slaapkamer bij nacht, portaal opent boven het bed. Overslaan met klik of toets.
2. **Titel:** "DE DROOM WERELD", MEESTER ROBOT en het kind op een zwevend eiland. Knop **BEGIN DE DROOM!**
3. **Levelkaart:** naam, icoon en uitleg van het level, gewonnen/verloren-telling, bolletjes 1 t/m 12 om direct naar een level te springen, knop **START!**
4. **Level:** aftelling, spelen. De ✕ knop of Escape pauzeert en vraagt "Level stoppen?"; stoppen gaat terug naar de levelkaart en telt niet mee.
5. **Resultaat:** bij winst **VOLGENDE UITDAGING**; bij verlies **OPNIEUW PROBEREN** en **OVERSLAAN** (niet bij de eindbaas).
6. Na level 11: **eindbaas-intro** (rode arena, bliksem), daarna level 12.
7. **Overwinning** (vuurwerk, ±6,5 s) en **ochtend**: "Het was allemaal een droom... maar jij WON!" met **OPNIEUW SPELEN**.

### Voortgang

* Geen levens en geen puntentotaal. Per level wordt `won` of `lost` bijgehouden; een gewonnen level blijft gewonnen.
* Voortgang (`idx` en `results`) wordt bewaard in `localStorage` onder `droomwereld-voortgang-v4` (de versie gaat omhoog bij elke wijziging in het aantal levels; oudere voortgang wordt genegeerd), bij elke levelkaart en elk resultaat. Alle toegang zit in try/catch: werkt opslag niet, dan speelt het spel gewoon zonder.
* Titelscherm met bewaarde voortgang: **VERDER SPELEN (LEVEL n)** en **NIEUW SPEL**. Zonder: **BEGIN DE DROOM!**
* NIEUW SPEL, OPNIEUW SPELEN en de ochtendscène wissen de bewaarde voortgang.
* Bij een gelijkspel wint altijd de robot.

---

## Levels

| # | Naam | Winvoorwaarde | Besturing |
|---|---|---|---|
| 1 | Geheugenspel 🃏 | Meer paren dan de robot | Klik/tik |
| 2 | Tikkertjes 🏃 | 45 s niet getikt worden | WASD/pijltjes |
| 3 | Verstoppertje 🙈 | 2 van de 3 rondes niet gevonden | Klik/tik |
| 4 | Voetbal ⚽ | Als eerste 3 doelpunten | WASD + SPATIE |
| 5 | Doolhof Race 🌀 | Eerder bij de uitgang | WASD/pijltjes |
| 6 | Simon Zegt 🔮 | Langer patroon dan de robot | Klik of 1-4 |
| 7 | Trivia Quiz 🎤 | Meer goede antwoorden (van 10) | Klik of 1-4 |
| 8 | Ruimtegevecht 🚀 | Meer punten in 60 s | WASD + SPATIE |
| 9 | Treinrennen 🚂 | 900 m halen zonder gepakt te worden | Pijltjes/WASD of vegen |
| 10 | Boogschieten 🏹 | Meer punten dan de robot na 5 pijlen | Muis/touch of pijltjes + SPATIE |
| 11 | Robotsprong 🧱 | De finishvlag halen (3 hartjes, 240 s) | Pijltjes/WASD + SPATIE, touch: joystick + SPRING |
| 12 | MEESTER ROBOT 👑 | Alle 3 fases winnen | Zie hieronder |

### Level 1: Geheugenspel
* 3D speeltafel, 16 kaarten (8 paren): ster, hart, maan, zon, wolk, bliksem, bloem, diamant.
* Start: alle kaarten ±4 s open ("Onthoud ze!"), daarna dicht.
* Speler begint. Paar gevonden = nog een beurt; fout = beurt naar de robot. Hetzelfde geldt voor de robot.
* Robot-AI: onthoudt elke kaart die na de start is omgedraaid. Kent hij een paar, dan kiest hij het met 75% kans; anders draait hij een onbekende kaart om en pakt de bijpassende kaart als hij die kent. Denktijd 1,2 tot 1,8 s.

### Level 2: Tikkertjes
* Rond snoepeiland (straal 16) met 12 obstakels.
* Snelheid speler 6,5, robot 5,4. Getikt bij afstand < 1,1.
* Robot-AI: mikt iets vóór de speler (voorspelt de looprichting) en stuurt om obstakels heen.
* Power-ups: elke 9 à 10 s verschijnt er een (max 3 tegelijk). Ster = speler 4 s 1,6× sneller. Sneeuwvlok = robot 3 s bevroren (kan dan niet tikken).
* HUD: grote afteltimer met balk, indicator van de actieve power-up, rode rand als de robot dichtbij is.

### Level 3: Verstoppertje
* Diorama met 9 plekken: het rode huisje, de schuur, de grote boom, de tent, de houten kist, het vat, de tunnel, de hooiberg, het hondenhok.
* Per ronde: 6 s om een plek te kiezen (of **Klaar!**). Geen keuze = willekeurige plek.
* Zoeken: de robot doorzoekt `MAX_CHECKS` = 6 van de 9 plekken in een eerlijke, willekeurige volgorde. Doorzochte plekken krijgen een groen ✓.
* Verhuizen: tijdens het zoeken één keer naar een andere plek (niet de plek die de robot net doorzoekt). Het risico wordt bepaald op het moment van klikken: kijkt de robot op dat moment in een plek (deksel open, `peeking()`), dan 15% kans dat hij het hoort; anders 70%. Hoort hij het, dan doorzoekt hij de nieuwe plek als volgende (ook als die al een ✓ had) en krijgt hij daar een extra zoekbeurt voor.
* Het badge rechtsboven toont live "NU sluipen!" (groen) of "Wacht... de robot let op" (oranje).
* Kansen per ronde: blijven zitten 3/9 ≈ 33%; goed getimed naar een ✓ sluipen ≈ 8/9 × 85% ≈ 76%. Het level beloont dus opletten en timing, niet geluk.
* Best of 3.

### Level 4: Voetbal
* Zaalvoetbalveld 30 × 18 in een droomstadion, eerste naar 3.
* Snelheid speler 6,6, robot 5,5.
* Schieten: SPATIE ingedrukt houden laadt de kracht op (max 0,6 s), kracht 14 tot 22. Krachtbalk onderin.
* Robot-AI (elke 0,1 s): rolt de bal naar zijn doel, dan dekt hij af; heeft de speler de bal op zijn helft, dan blokkeert hij de lijn naar het doel; dribbelt de speler op eigen helft, dan zakt hij terug; anders loopt hij om de bal heen en dribbelt/schiet richting het doel van de speler.
* Na een doelpunt: banner "DOELPUNT!" en aftrap vanaf het midden.

### Level 5: Doolhof Race
* Doolhof van 15 × 11 vakken, elke keer nieuw gegenereerd (depth-first). Alleen doolhoven met een kortste route van 45 tot 115 vakken worden gebruikt.
* Start linksonder, uitgang (goud portaal met lichtstraal) rechtsboven.
* Snelheid speler 5, robot 3,4. De robot start 1,5 s later en volgt de kortste route. HUD toont hoe ver de robot is (%).

### Level 6: Simon Zegt
* Kristallen tempel met 4 kristallen: rood, blauw, geel, groen.
* Eén vast willekeurig patroon van 20 kleuren voor beide spelers.
* Speler eerst: patroon wordt getoond vanaf lengte 1, elke goede ronde +1. Eerste fout = einde beurt. Alle 20 goed = maximale score.
* Daarna de robot met hetzelfde patroon: elke stap 85% kans goed, 0,6 s denktijd per stap.
* Score = aantal voltooide rondes. Meer dan de robot = winst.

### Level 7: Trivia Quiz
* Tv-studio met publiek, twee spelerspodia en een groot scherm.
* 10 vragen uit een pool van 51, elk met 4 antwoorden die geschud worden. In de code is `o[0]` altijd het goede antwoord.
* Onderwerpen: rekenen, taal (meervoud, verkleinwoord, spelling, lidwoorden), aardrijkskunde van Nederland en Europa, natuur en het menselijk lichaam, feestdagen, kunst, sport en geschiedenis.
* 12 s per vraag. Robot antwoordt na 2,5 tot 7 s, 70% kans op goed.

### Level 8: Ruimtegevecht
* Twee schepen naast elkaar, asteroïden komen van ver weg op je af. Ronde van 60 s.
* Soorten: gewoon (1 punt), ijs (1 punt), goud (10% kans, 2 punten). Grote asteroïden hebben 2 treffers nodig.
* Asteroïden komen steeds sneller en vaker naarmate de tijd verstrijkt. Een botsing kost `CRASH_PTS` = 2 punten (nooit onder 0) en `STUN` = 1,2 s niet schieten; het schip knippert en er verschijnt "-2". Dit geldt voor speler en robot.
* Vuursnelheid speler: één schot per 0,22 s. De schepen duwen elkaar weg als ze te dicht bij elkaar komen.
* Robot-AI: kiest een doelwit, richt met een willekeurige afwijking en schiet af en toe mis. Ontwijken: per asteroïde beslist de robot één keer of hij hem ziet (75%); een geziene asteroïde binnen ±38 eenheden die op koers ligt, ontwijkt hij met hogere snelheid.

### Level 9: Treinrennen
* Endless runner à la Subway Surfers. 3 banen (x = −2,4 / 0 / 2,4); de speler staat op z = 0 en de wereld schuift naar de camera.
* Snelheid loopt op van 12 naar 19 eenheden/s. Finish op `GOAL` = 900 m (duurt ongeveer 60 s); daar verschijnt een gouden finishpoort.
* Obstakels worden in rijen gespawnd (elke max(16, snelheid × 1,15..1,5) eenheden):
  * **laag hek** (hoogte 1,0): springen. **hoge balk** (1,4 tot 2,6): rollen (0,7 s).
  * **trein** van 12, 16 of 22 lang, dakhoogte 2,4; 50% heeft een **helling** van 7 lang waarmee je op het dak rent. Op daken kun je springen en van dak naar dak lopen; aan het eind val je terug op de rails.
  * **muur**: vanaf 25% van de afstand soms een hek over alle 3 banen (iedereen springt of rolt).
  * Eerlijkheidsregel: er zijn nooit treinen in alle 3 de banen tegelijk, en een baan telt als bezet zolang een trein tot 14 eenheden vóór de nieuwe rij doorloopt (tijd om te wisselen).
* Sterren in lijnen op vrije banen en op treindaken met een helling.
* **Robot = de achtervolger.** `gap` van 0 tot 100, start op 70, herstelt met 6 per seconde. Hek geraakt −65, frontaal tegen een trein −80, van opzij tegen een trein −40 (je wordt teruggezet naar je vorige baan). Na een botsing 1,2 s onkwetsbaar (knipperen) en 25% snelheid kwijt. `gap` ≤ 0 = gepakt. Twee hekken binnen ongeveer 5 s = gepakt.
* De robot is pas in beeld als hij dichtbij is; de meter rechtsboven toont altijd hoe dichtbij hij is.
* Besturing: ←/→/A/D wisselen, ↑/W/SPATIE springen, ↓/S rollen (in de lucht: snel omlaag). Touch: vegen (drempel 0,12 in schermcoördinaten), tikken = springen.
* Getest met een simpele autopilot: haalt de finish zonder te struikelen; niets doen = gepakt rond 250 m.

### Level 10: Boogschieten
* 5 rondes (`ROUNDS`): afstand 16/20/24/28/32 m; wind vanaf ronde 2 (willekeurige richting, sterkte 0,35 tot 1); bewegend doel in ronde 4 en 5 (`bobX(t) = sin(0,45 t) × 1,5`). Per ronde schiet eerst de speler, dan de robot, met dezelfde wind.
* Doel: straal `R` = 1,1 op hoogte 1,7, 5 ringen van 0,22: 10 (geel), 8 (rood), 6 (blauw), 4 (zwart), 2 (wit), anders 0.
* Pijl: startsnelheid 20 tot 44 m/s afhankelijk van de spanning (`DRAW_T` = 1 s voor vol), zwaartekracht 6 m/s², zijwind 1,6 × wind m/s². De functie `flight()` rekent de baan uit en wordt gebruikt voor de hulplijn (alleen ronde 1) en voor de robot; de pijl zelf gebruikt dezelfde natuurkunde.
* Richten: de muis/vinger wijst een punt op het vlak van het doel aan (raycast). Het vizier zwiept licht; na `SHAKE_AFTER` = 2,2 s vasthouden gaat het steeds harder trillen. Tijdens het spannen zoomt de camera in (fov 50 → 30). Loslaten onder 15% spanning schiet niet (melding "Houd langer vast!").
* Camera: over de schouder bij het richten, volgt daarna de pijl, en toont het doel met "+8" of "ROOS! +10".
* Robot-AI: rekent de perfecte richting uit (ook vóór het bewegende doel), telt daar een willekeurige fout bij op (spreiding groeit met de afstand) en schiet altijd met volle spanning. Gemiddeld 7,6 / 6,8 / 5,9 / 5,0 / 4,3 punten per ronde, ongeveer 30 van 50.
* Getest: een perfecte schutter haalt 50 van 50, dus elke ronde is haalbaar.
* Gelijkspel = robot wint.

### Level 11: Robotsprong
* 2,5D platformspel: 3D-wereld, zijaanzicht, het kind beweegt alleen in x en y. Tegels van 1 × 1; het parcours wordt in code opgebouwd in `buildMap()` (ongeveer 176 tegels breed) met hulpfuncties `ground`, `row`, `pipe`, `stairs`, `starRow` en `en` (vijand).
* Tegels: grond, bakstenen blok (`B`), sterblok (`?`, geeft een ster), schildblok (`M`), leeg blok (`U`), steen (`S`, trappen), buis (`P`). Grond, trappen en aarde zijn InstancedMeshes.
* Kind: loopt 7,2/s, springt met 16,5/s. Zolang je springen vasthoudt en omhoog gaat, is de zwaartekracht 55% (hoger springen, max. ongeveer 5,9 tegels). Springbuffer en 'coyote time' van 0,1 s, zodat een iets te vroege of te late druk nog telt. Botsingen per as met tegels, met substeps tegen doorschieten.
* Vijanden worden actief binnen 17 tegels:
  * Loopbot: loopt 1,8/s, keert bij muren en andere robots, loopt van randen af. Erop springen = plat.
  * Schildbot: erop springen = bal (6 s, daarna wakker). Bal aanraken of erop springen = wegtrappen met 11/s; een rollende bal gooit andere robots om, kaatst terug van muren en kan jou raken (0,25 s gratie na het trappen). Op een rollende bal springen = stoppen.
  * Zweefbot: zweeft in een sinusbaan, geen zwaartekracht.
  * Een stoot tegen een blok van onderen gooit een robot die erop staat om.
* Schild: één botsing gratis, breekt bakstenen blokken. 3 hartjes, 1,6 s onkwetsbaar na een treffer. Vallen onder y = −6 kost een hartje. Terug naar het begin of het checkpoint; robots binnen 4 tegels van dat punt verdwijnen.
* Tijd 240 s. Winnen = de vlagpaal raken (het kind glijdt naar beneden en loopt naar het huisje).
* Ontwerpregels, geleerd bij het testen: **geen blokken vlak boven de rand van een kuil** (je stoot je hoofd en valt erin) en **geen kuil vlak achter een hoge buis** (je landt er blind in).
* Getest met een simpele autopilot die alleen naar rechts loopt en springt bij muren, kuilen en robots: haalt de vlag in 35 s met 1 hartje over.

---

## Level 12: MEESTER ROBOT (eindbaas)

Arena met een reusachtige robot met kroon. De eindbaas kan niet verloren worden: faal je in een fase, dan begint alleen die fase opnieuw ("FASE X OPNIEUW!"). Na fase 3 volgt de overwinning.

### Fase 1: Ontwijken
* Overleef 30 s. De speler loopt rond op een ronde vloer (WASD/pijltjes).
* 3 hartjes, na een treffer 1,5 s onkwetsbaar. 0 hartjes = fase 1 opnieuw.
* Aanvallen in willekeurige volgorde: meteoren (vallen vaak dicht bij de speler), laserstralen die over de vloer zwaaien, energiebollen en schokgolfringen.
* Elke 8 s gaat het niveau omhoog (max 3): meer lasers, meer en snellere bollen.

### Fase 2: Steen-papier-schaar
* Eerste die 2 rondes wint. 3 s bedenktijd per ronde; geen keuze = willekeurige keuze.
* De robot kiest volledig willekeurig.
* Besturing: knoppen op het scherm of toetsen 1 (steen), 2 (papier), 3 (schaar).

### Fase 3: Rekenrace
* Sommen: optellen en aftrekken met getallen 1 t/m 20 (nooit een negatieve uitkomst), vermenigvuldigen met 2 t/m 12.
* De robot "rekent" 3 tot 6 s; die tijd wordt per gespeelde som 5% korter.
* Fout antwoord: invoer wordt gewist, je mag opnieuw proberen zolang de robot nog niet klaar is.
* Eerste met 5 punten wint.
* Besturing: cijfertoetsen, Enter, Backspace of het cijferpaneel op het scherm.

---

## Touch-besturing

* **Joystick** in levels 2, 4, 5, 8, 11 en in fase 1 van de eindbaas.
* **Vegen** in level 9 (Treinrennen).
* **Tik, houd vast en schuif** in level 10 (Boogschieten).
* **Actieknop:** SCHIET in level 4, VUUR in level 8, SPRING in level 11.
* Overige levels werken met tikken op objecten of knoppen.

---

## Visuele stijl

* Kleurrijke droomwereld: zwevende eilanden, snoep, kristallen, sterrenhemel en zachte gloed.
* Speler: oranje kind. Robot-tegenstander: cyaan robot. Eindbaas: grote donkere robot met gouden kroon en rode ogen.
* Titel met bewegend verloop van geel, roze en lichtblauw.
* HUD: afgeronde "pill"-labels, banners voor GEWONNEN!/VERLOREN! (goud of rood), scorebord Jij tegen Robot.
* Winnen is goud (`#ffd700`), verliezen rood (`#ff4d5e`), goed groen (`#7dff9a`).

---

## Afspraken bij wijzigingen

1. Een level roept `api.complete()` maar één keer aan en controleert `this.dead` na elke `await` of timer, zodat een gestopt level niets meer doet.
2. `destroy()` ruimt alle eigen timers, event listeners en DOM-elementen op.
3. Gelijkspel = robot wint. Houd dit consistent en vermeld het in de banner.
4. Robots zijn nooit perfect: elke robot-AI heeft een ingebouwde kans op fouten of vertraging.
5. Nieuwe tekst in het spel is Nederlands en geschikt voor kinderen.
6. Alles blijft in één bestand zonder externe verzoeken.
