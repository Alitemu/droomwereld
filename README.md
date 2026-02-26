# Droomwereld 🌙

## Concept

Wanneer je gaat slapen, kom je terecht in een magische droomwereld vol avontuur. Je moet 8 levels doorstaan, elk met een ander soort spel tegen een robottegenstander, voordat je de eindbaas kunt verslaan en veilig kunt ontwaken.

---

## Levels

### Level 1 — Memory
Speel memory tegen een robot. Flip kaarten om en vind paren. De robot onthoudt elke kaart en wordt steeds slimmer. Win door meer paren te vinden dan de robot.

### Level 2 — Tikkertjes
Speel tikkertje in een doolhof. De robot probeert jou te tikken. Ontsnap lang genoeg om punten te scoren en het level te halen.

### Level 3 — Verstoppertje
Verstop je in een 2D-wereld terwijl de robot zoekt. Gebruik schaduwen, struiken en gebouwen om je te verbergen. Wordt je gevonden vóór de tijd om? Dan verlies je.

### Level 4 — Voetbal
Speel een potje voetbal (1 tegen 1) tegen de robot. Schiet de bal in het doel van de robot. Wie als eerste 3 doelpunten maakt, wint het level.

### Level 5 — Puzzel
Los een schuifpuzzel op sneller dan de robot. Beide spelers krijgen dezelfde puzzel. De robot wordt steeds sneller per poging. Wie het eerst klaar is, wint.

### Level 6 — Dans (Simon Zegt)
Doe de bewegingen na die de robot voordoet (een soort Simon Says). Het tempo wordt steeds hoger. Maak je een fout? Dan verlies je een leven. Overleef alle rondes om te winnen.

### Level 7 — Koken
Een kookspel waarbij je ingrediënten in de juiste volgorde combineert om het recept klaar te maken vóór de robot. Verkeerde combinaties kosten tijd. De snelste kok wint.

### Level 8 — Racen
Race met een dromkart door een surrealistisch parcours in de wolken. Gebruik power-ups en vermijd obstakels. Finish als eerste om de eindbaas te ontgrendelen.

---

## Eindbaas — De Droomkoning

De Droomkoning is een gigantische robot die alle vaardigheden van de vorige levels combineert. De strijd bestaat uit 4 fases:

1. **Fase 1:** Memory-aanvallen ontwijken terwijl je kaartparen matcht om zijn schild te breken.
2. **Fase 2:** Tik de Droomkoning op zijn zwakke punten terwijl hij jou achtervolgt.
3. **Fase 3:** Verstop je terwijl je puzzelstukken verzamelt om zijn kern bloot te leggen.
4. **Fase 4:** Een finale voetbalwedstrijd — schiet 5 doelpunten om de Droomkoning te verslaan en te ontwaken.

---

## Architectuur & Subagents

De game wordt gebouwd met behulp van gespecialiseerde subagents:

| Subagent | Verantwoordelijkheid |
|---|---|
| `agent-level-1` | Memory-spel logica en robot-AI |
| `agent-level-2` | Tikkertjes beweging en botsingsdetectie |
| `agent-level-3` | Verstoppertje zichtbaarheidslogica en robot-zoekgedrag |
| `agent-level-4` | Voetbalmechanics en robot-schietlogica |
| `agent-level-5` | Schuifpuzzel generator en robot-solver |
| `agent-level-6` | Dans/Simon-Zegt ritme-engine en invoerdetectie |
| `agent-level-7` | Kookspel recept-systeem en tijdmanagement |
| `agent-level-8` | Racespel fysica, parcoursgeneratie en power-ups |
| `agent-eindbaas` | Droomkoning fase-logica en gecombineerde AI |
| `agent-merge` | Voegt alle levelcode samen tot één samenhangend spel |
| `agent-test` | Test alle levels, overgangen, robot-AI en eindbaas op correctheid |

---

## Technische Stack

- **Frontend:** HTML5 Canvas + JavaScript
- **Stijl:** CSS3 (droomachtige animaties, neon-kleuren)
- **AI robots:** Regelgebaseerde logica per level, oplopende moeilijkheidsgraad
- **Structuur:** Modulair — elk level is een losstaande module, samengebracht door `agent-merge`

---

## Hoe te spelen

1. Start het spel (`game.html` openen in de browser)
2. Klik op "Ga Slapen" om de droomwereld te betreden
3. Doorloop alle 8 levels
4. Versla de Droomkoning
5. Ontwaak als winnaar!
