# De Droom Wereld: Spelspecificatie

Dit document beschrijft het spel zoals het nu in `index.html` gebouwd is. Gebruik het als referentie bij wijzigingen of als prompt voor een LLM. Wijkt de code af van dit document, dan is de code leidend en moet dit document bijgewerkt worden.

---

## Concept

Een kind valt in slaap en wordt door een portaal de droomwereld in gezogen, waar **MEESTER ROBOT** heerst. Het kind speelt 8 minigames tegen een robot en daarna een eindgevecht in 3 fases tegen MEESTER ROBOT. Na de overwinning wordt het kind wakker in de slaapkamer.

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
src/level1.js ... src/level9.js
```

Het framework start pas na `window.load`, dus levelbestanden mogen in elke volgorde na `engine.js` staan.

---

## Architectuur

### `engine.js`: gedeelde hulpfuncties (`window.DW`)

| Onderdeel | Functies |
|---|---|
| Registratie | `registerLevel(n, level)` met n = 1..9 (9 = eindbaas), `meta` (naam, uitleg, icoon per level) |
| Rekenen | `clamp`, `lerp`, `damp`, `angleLerp`, `rand`, `randInt`, `pick`, `shuffle`, `ease` |
| 3D bouwstenen | `mat`, `mesh`, `box`, `roundedBox`, `sphere`, `cyl`, `cone`, `capsule`, `canvasTexture`, `makeLabel` |
| Scène | `addLights`, `dreamEnvironment` (lucht, sterren, maan, zwevende lichtbollen, mist), `disposeScene`, `raycast`, `findUp` |
| Personages | `makeCharacter({ kind: 'kid' \| 'robot', color, scale })`, `animateCharacter`, `setMood` (`idle`, `happy`, `sad`, `think`, `angry`), `faceTowards` |
| Effecten | `Particles`, `Shaker` (camerashake) |
| HUD | `hud.top`, `hud.bottom`, `hud.scoreboard(titel, jij, robot)`, `hud.banner`, `hud.countdown()`, `hud.button`, `hud.clear` |
| Geluid | `sfx.play(naam)`, `click`, `flip`, `good`, `bad`, `win`, `lose`, `go`, `tick`, `hit`, `kick`, `pop`, `shoot`, `boom`, `whoosh` |
| Invoer | `input.keys[code]`, `input.pointer`, `input.isDown(...codes)` |

### `framework.js`: de spelschil

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
3. **Levelkaart:** naam, icoon en uitleg van het level, gewonnen/verloren-telling, bolletjes 1 t/m 9 om direct naar een level te springen, knop **START!**
4. **Level:** aftelling, spelen. De ✕ knop of Escape pauzeert en vraagt "Level stoppen?"; stoppen gaat terug naar de levelkaart en telt niet mee.
5. **Resultaat:** bij winst **VOLGENDE UITDAGING**; bij verlies **OPNIEUW PROBEREN** en **OVERSLAAN** (niet bij level 9).
6. Na level 8: **eindbaas-intro** (rode arena, bliksem), daarna level 9.
7. **Overwinning** (vuurwerk, ±6,5 s) en **ochtend**: "Het was allemaal een droom... maar jij WON!" met **OPNIEUW SPELEN**.

### Voortgang

* Geen levens en geen puntentotaal. Per level wordt `won` of `lost` bijgehouden; een gewonnen level blijft gewonnen.
* Voortgang (`idx` en `results`) wordt bewaard in `localStorage` onder `droomwereld-voortgang-v1`, bij elke levelkaart en elk resultaat. Alle toegang zit in try/catch: werkt opslag niet, dan speelt het spel gewoon zonder.
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
| 9 | MEESTER ROBOT 👑 | Alle 3 fases winnen | Zie hieronder |

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

---

## Level 9: MEESTER ROBOT (eindbaas)

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

* **Joystick** in levels 2, 4, 5, 8 en in fase 1 van level 9.
* **Actieknop:** SCHIET in level 4, VUUR in level 8.
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
