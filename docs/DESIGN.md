# Design notes

## Brand

| | |
| --- | --- |
| Name | **Numbo** |
| Promise | Math adventures for grades 1–6, with Bobby |
| Mascot | **Bobby**, a round yellow keeper of numbers with two antennae (red and blue) and orange feet |
| Logo | NUMBO in six-colour toy blocks, each block tilted a few degrees (`docs/brand/logo.svg`) |
| Voice | Warm, short sentences, never scolding: "Not quite. Try once more!" |
| Fonts | Fredoka (headings, buttons), Nunito (reading) |

### Colour tokens (`src/styles.css`)

| Token | Value | Use |
| --- | --- | --- |
| `--red` | `#d93844` | Grade 1 tile, the N block |
| `--blue` | `#2f6fe8` | Learn, answer A |
| `--green` | `#22b866` | Play, success |
| `--yellow` | `#ffc933` | Bobby, stars, selected state |
| `--purple` | `#7c4ae8` | Hard level, answer B |
| `--orange` | `#ff8a3d` | Medium level, answer C |
| `--teal` | `#18b9c6` | Answer D |
| `--navy` / `--line` | `#1d1747` | Outlines and text on bright tiles |
| `--sky1..3` | `#9fdcff #dff4ff #fff4cf` | Page background (day) |

Every colour pair used for text is at least 4.5:1 (3:1 for large text). White text sits on red, blue and purple; navy text sits on green, orange, teal and yellow.
Night mode swaps the sky and card colours (`data-theme="dark"` or the system setting) and keeps the same tile colours.

### Shape language

Thick navy outlines (3 px), chunky bottom shadows like toy blocks, large radii (14–28 px), soft rise-in animation.
All motion stops under `prefers-reduced-motion`.

## Layout

| Width | Home | Other screens |
| --- | --- | --- |
| Phones (under 460 px) | Header on two rows, places in 2 columns (odd last tile spans both) | Full-width card |
| Tablets (460–1099 px) | Places in 3 columns | Card up to 880 px |
| Laptops and up (1100 px+) | Two columns: Bobby and the Number Shelf on the left, places on the right, fits one screen | Card up to 980 px, larger question text and answers |

Touch targets are at least 44 px. No screen scrolls sideways from 320 px up to 1920 px (`tests/e2e/responsive.py`).

## Interaction principles

- One screen at a time: home, place, learn, levels, quiz, result. The logo resets everything and replays the story.
- Every button gives a soft tap; right and wrong answers have their own sounds plus a spoken cheer or a hint.
- A wrong answer gets one retry with a hint before the answer is shown.
- Grades 1–2 hear each question automatically; older grades have a Listen button.
- Progress is stars per place and level, stored in `localStorage` under `numbo.v2`; preferences under `numbo.pref`.
