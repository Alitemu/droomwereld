# Droomwereld — Volledige Spelspecificatie voor LLM-implementatie

## Concept

Bouw een browsergebaseerd spel genaamd **Droomwereld** in één enkel HTML-bestand (`game.html`) met vanilla JavaScript en HTML5 Canvas. Geen externe bibliotheken of frameworks.

Het verhaal: de speler gaat slapen en belandt in een droomwereld. Om te ontwaken moet je 8 levels doorstaan, elk een ander mini-spel tegen een robottegenstander, en daarna de eindbaas verslaan.

---

## Technische vereisten

- **Eén bestand**: alles in `game.html` (HTML + `<style>` + `<script>`)
- **Canvas**: 800×600 pixels, zwarte/donkerpaarse achtergrond (`#0a0015`)
- **Stijl**: neon droomsfeer — cyaan (`#00ffff`), paars, geel, gloei-effecten
- **Game loop**: `requestAnimationFrame`
- **Besturing**: toetsenbord (pijltoetsen / WASD) + muisklik waar nodig
- **Geen externe dependencies**

---

## Algemene spelstructuur

### UI-balk (bovenaan, buiten canvas)
- Links: knop **← Vorige** (verborgen op level 1)
- Midden: levelnaam
- Rechts: `❤️ [levens] | Score: [punten]` + knop **Volgende →** (verborgen op eindbaas)

### Levens & score
- Speler begint met **3 levens**
- Level verliezen kost 1 leven
- Als alle levens op zijn: **Game Over**-scherm met twee knoppen:
  - **"Probeer Opnieuw (Zelfde Level)"** — herstart huidig level, 3 levens terug
  - **"Begin Helemaal Opnieuw"** — herlaad de pagina
- Level winnen: +100 score, automatisch naar volgend level
- Navigatieknoppen Vorige/Volgende: wisselen direct van level, levens worden gereset naar 3

### Startscherm
Volledig scherm overlay met titel "🌙 Droomwereld 🌙" en knop "Ga Slapen" die het spel start.

### Eindscherm (winst)
Overlay met "✨ JE HEBT GEWONNEN! ✨" en de eindscore. Geen retry-knop, alleen volledig herstarten.

---

## Levels — gedetailleerde specificatie

Elk level heeft:
- Een **tijdslimiet** die aftelt (zichtbare timer op scherm)
- Een **doel** duidelijk bovenaan het scherm in geel
- **Besturingsinstructies** in lichtblauw eronder
- Labels boven sprites zodat duidelijk is wie wie is

---

### Level 1 — Memory (tijdslimiet: 120s)

**Doel**: Vind meer kaartparen dan de robot.

**Speelveld**: 12 kaarten in een 6×2 raster (6 paren met emoji's: 🌙 ⭐ ☁️ 💫 🌟 ✨). Posities worden **na** het shuffelen toegewezen zodat paren nooit op vaste plekken staan.

**Spelregels**:
- Speler klikt twee kaarten om te onthullen
- Match → kaarten blijven zichtbaar, speler krijgt nog een beurt
- Geen match → kaarten gaan na 500ms dicht, robot krijgt de beurt
- Robot onthoudt alle omgedraaide kaarten en pakt bij een match een gekend paar (als beschikbaar), anders kiest het willekeurig
- **Robot heeft beurt zolang hij match vindt** — alleen bij mismatch krijgt speler de beurt terug
- Spel eindigt als alle 6 paren gevonden zijn (speler + robot samen)
- Win als `spelerparen >= robotparen`, anders verlies

**Robot gedrag**: behoudt een geheugenlijst van geziene kaarten. Na iedere misser wordt de lijst aangevuld. Bij zijn beurt zoekt hij eerst een bekende match, anders raadt hij.

---

### Level 2 — Tikkertjes (tijdslimiet: 60s)

**Doel**: Overleef 60 seconden zonder aangeraakt te worden door de robot.

**Speelveld**: 800×600 arena met rode grensmuren (30px dik) langs de randen en een paar oranje obstakelmuren binnenin als schuilplaats.

**Spelregels**:
- Speler beweegt met pijltoetsen of WASD (snelheid: 5 px/frame)
- Robot jaagt op speler (snelheid: **0.8× spelerssnelheid = 4 px/frame**, vast, geen opschaling)
- Aanraking robot → verlies een leven, level herstart
- 60 seconden overleefd → winst, volgende level

**Timer**: grote afteltimer midden-boven op de grensmuur. Wordt rood en groter bij ≤10 seconden.

**Labels**: "JIJ" boven de blauwe speler, "ROBOT" boven de groene robot.

---

### Level 3 — Verstoppertje (tijdslimiet: 90s)

**Doel**: Verstop je in een verstopplek en blijf verborgen tot de tijd om is.

**Speelveld**: open ruimte met drie gekleurde verstopplekken:
- 🌳 Boom (links boven, 120×150px)
- 🏠 Huis (rechts boven, 100×150px)
- 🌿 Struik (midden onder, 150×100px)

**Spelregels**:
- Speler beweegt met WASD/pijlen (snelheid 4 px/frame)
- Speler loopt in een verstopplek en drukt **SPATIE** → is verborgen (groen gemarkeerd)
- Nogmaals SPATIE → verlaat verstopplek
- Terwijl verborgen: robot kan je niet vinden
- Terwijl niet verborgen: robot beweegt naar speler toe
- Tijd op EN verborgen → **win**
- Tijd op EN niet verborgen → **verlies**
- Robot raakt speler aan → verlies een leven

**Status op scherm**:
- Verborgen: "✅ JE BENT VERBORGEN — wacht tot de tijd om is!"
- Niet verborgen: "⚠️ Robot zoekt jou! Loop naar een verstopplek en druk SPATIE"

---

### Level 4 — Voetbal (tijdslimiet: 120s)

**Doel**: Schiet 3 doelpunten voordat de robot dat doet.

**Speelveld**: voetbalveld. Doelen aan beide kanten (links: speler, rechts: robot). Bal begint in het midden.

**Spelregels**:
- Speler beweegt met WASD/pijlen (snelheid 5 px/frame), alleen linkerkant van veld
- **SPATIE** schiet de bal weg vanuit de richting van speler naar bal
- Bal heeft wrijving (0.98× per frame), stuitert van muren (0.8× dampening)
- Robot beweegt richting bal en schiet richting speler's doel met willekeurig tijdsinterval
- Doelpunt als bal door het doel gaat (y tussen 200–400, x buiten veld)
- Bij doelpunt: bal reset naar midden
- 3 doelpunten speler → win, 3 doelpunten robot → verlies
- Scorebord midden-boven: `[spelerscore]  -  [robotscore]`

---

### Level 5 — Schuifpuzzel (tijdslimiet: 90s)

**Doel**: Los een 4×4 schuifpuzzel op sneller dan de robot.

**Speelveld**: twee 4×4 puzzelrasters naast elkaar — links de speler, rechts de robot.

**Spelregels**:
- Getallen 1–15 + één leeg vakje, willekeurig geschud
- Klik op een tegel naast het lege vakje om hem te verschuiven
- Opgelost als tegels op volgorde staan (1–15, leeg rechtsonder)
- Robot lost automatisch (langzamer dan maximaal) op
- Speler oplost eerst → win, robot eerst → verlies
- Tijd op → verlies

---

### Level 6 — Dans (tijdslimiet: 60s)

**Doel**: Volg de danssequentie correct na, 5 rondes overleven.

**Speelveld**: vier grote dansblokken (pijlen ↑→↓←) in het midden van het scherm.

**Spelregels**:
- Robot toont een reeks pijlbewegingen, één voor één verlicht
- Speler herhaalt de reeks met pijltoetsen
- Correcte invoer → groen oplichten
- Foute invoer → rood oplichten, sequentie reset, ronde mislukt
- Na elke geslaagde ronde wordt de reeks 1 move langer (start op 4)
- 5 rondes halen → win
- Tijd op of 3 fouten → verlies

---

### Level 7 — Koken (tijdslimiet: 120s)

**Doel**: Maak 3 recepten klaar door de juiste ingrediënten in de juiste volgorde te kiezen.

**Speelveld**: 6 klikbare ingrediënten (🍅 🧂 🧈 🍗 🌶️ 🧄), een receptweergave bovenaan, een "pot" die gevuld wordt.

**Spelregels**:
- Elk recept bestaat uit 2–4 ingrediënten in een specifieke volgorde
- Klik de ingrediënten in de volgorde van het recept
- Correct ingrediënt → toegevoegd aan pot
- Fout ingrediënt → -10 seconden tijdstraf, recept reset
- Recept volledig → kookbalk vult zich, na 2s naar volgend recept
- 3 recepten klaar → win
- Tijd op → verlies

---

### Level 8 — Racen (tijdslimiet: 60s)

**Doel**: Bereik de finish voor de robot.

**Speelveld**: verticaal scrollend wegparcours met obstakels (rode barriers) en power-ups.

**Spelregels**:
- Druk op **SPATIE** om vooruit te bewegen (100ms cooldown per druk)
- Obstakels blokkeren de weg → terugsetje van 50px + tijdboete
- **Gele power-up** → snelheidsboost (tijdelijk +extra beweging per druk)
- **Blauwe power-up** → robot vertraagt 3 seconden
- Robot beweegt automatisch met wisselende snelheid
- Speler bereikt finish (1000 "meter") → win
- Robot bereikt finish eerste → verlies
- Voortgang getoond als twee progressiebalkjes op scherm

---

### Eindbaas — Droomkoning (tijdslimiet: 180s)

**Doel**: Versla de Droomkoning in een 4-fasige gevecht.

**Uiterlijk**: gigantische glimmende robot-baas met gezicht, kroon en pulserende gloed. Levensbalk bovenaan (rood), speler levensbalk eronder (groen).

**Fase 1 (100–75% HP)**: Memory-aanvallen. Speler moet snel paren matchen (mini-memory met 4 paren) terwijl de baas schade doet als je te lang wacht. Elk correct paar = 5 schade aan baas.

**Fase 2 (75–50% HP)**: Achtervolgingsfase. Speler rent weg terwijl de baas sneller beweegt dan normaal. Speler kan energieorbs oppakken (klik erop) die 10 schade doen aan de baas. 5 orbs nodig.

**Fase 3 (50–25% HP)**: Puzzelfase. Kleine 3×3 schuifpuzzel oplossen terwijl de baas elke 2s schade doet. Puzzel oplossen = 25 schade aan baas.

**Fase 4 (25–0% HP)**: Eindduel. Directe voetbalmatch: 3 doelpunten schieten om de baas te verslaan. Elk doelpunt = 25 schade.

**Faseovergang**: animatie met tekst "FASE [X] BEGINT!" in het midden van het scherm.

Baas op 0 HP → overwinningsscherm. Speler op 0 HP → verlies een leven, restart fase 1.

---

## Visuele stijl

| Element | Kleur |
|---|---|
| Achtergrond | `#0a0015` (dieppaars-zwart) |
| Primair accent | `#00ffff` (cyaan) |
| Doeltekst | `#ffff00` (geel) |
| Instructietekst | `#aaddff` (lichtblauw) |
| Speler | `#0099ff` (blauw) |
| Robot | `#00ff00` (groen) |
| Gevaar/fout | `#ff4444` (rood) |
| Succes/match | `#00ff00` (groen) |
| Knoppen | gradient cyaan→blauw, zwarte tekst |
| Gloei-effecten | `box-shadow` / canvas `shadowBlur` op neon-kleuren |

Lettertype: Arial/sans-serif, vetgedrukt voor titels.

---

## Robot AI — globale regels

- Alle robots beginnen met moeilijkheidsgraad 1 (gemiddeld niveau)
- Robot is nooit perfect: maakt menselijke fouten om het speelbaar te houden
- **Level 2**: robot beweegt altijd 0.8× spelerssnelheid (kan nooit inhalen als speler goed beweegt)
- **Level 1**: robot onthoudt kaarten maar kiest niet altijd de beste zet
- **Eindbaas**: combineert AI van meerdere levels, neemt toe in moeilijkheid per fase

---

## Bestandsstructuur

Alles in **één `game.html`** bestand:

```
game.html
├── <head> met <style>
│   ├── body layout (centered, donkere achtergrond)
│   ├── #gameContainer (800×600, cyaan border, gloei)
│   ├── #ui (bovenste balk: vorige/volgende knoppen, levelnaam, score)
│   ├── #startScreen (fullscreen overlay)
│   ├── #gameOver (centered overlay)
│   └── .button / .navBtn styling
└── <body>
    ├── #gameContainer
    │   ├── #startScreen
    │   ├── #ui (navigatie + score)
    │   ├── <canvas id="gameCanvas"> (800×600)
    │   └── #gameOver
    └── <script>
        ├── class Level (basisklasse)
        ├── class Level1Memory extends Level
        ├── class Level2Tag extends Level
        ├── class Level3HideAndSeek extends Level
        ├── class Level4Football extends Level
        ├── class Level5Puzzle extends Level
        ├── class Level6Dance extends Level
        ├── class Level7Cooking extends Level
        ├── class Level8Racing extends Level
        ├── class FinalBossDroomkoning extends Level
        ├── Robot basisklassen (RobotTag, RobotMemory, etc.)
        ├── class Game (game loop, level switching, UI)
        └── const game = new Game()
```

---

## Bekende valkuilen om te vermijden

1. **Posities voor shuffle toewijzen** (Level 1): wijs x,y toe *na* `.sort()`, anders staan paren altijd in dezelfde kolom.
2. **`isGameRunning` in `loadLevel()`**: zet altijd `true` in `loadLevel()`, zodat navigatieknoppen die eerst `false` zetten de loop niet blokkeren.
3. **Event listeners opruimen**: verwijder `keydown`/`keyup` handlers bij levelwisseling om dubbele listeners te voorkomen.
4. **Tijdslimiet als win vs. verlies**: voor Level 2 (tikkertjes) en Level 3 (verstoppertje) is tijd-op een *win*, niet een verlies — override de basisklasse tijdscheck.
5. **Robot beurt in Memory**: robot blijft aan de beurt na een match. Geef pas de beurt terug aan de speler na een mismatch.
6. **Canvas timer verborgen door muren**: teken de timer *nadat* je de muren tekent, anders tekenen de muren erover.
