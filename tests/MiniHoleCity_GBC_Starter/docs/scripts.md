# GB Studio Event Scripts (Copy Steps)

## Variables (Project → Variables)
- **Score** (number, starts at 0)
- **HoleLevel** (number, starts at 1)
- **Timer** (number, starts at 60)
- **Speed** (number, starts at 2)

## Scene: On Init (Main City Scene)
1. Set Variable **Score** = 0
2. Set Variable **HoleLevel** = 1
3. Set Variable **Timer** = 60
4. Set Variable **Speed** = 2
5. Start a Timer: Every 60 ticks (≈ 1s), do:
   - If **Timer** > 0 → Subtract 1 from **Timer**
   - If **Timer** == 0 → Switch Scene → Game Over

## Player (Hole) — On Update
- Apply Movement: Up/Down/Left/Right using **Speed** as player speed (use 'Set Actor Speed' → Player = Speed)
- Optional polish: small camera shake when eating big items

## Growth Thresholds (Attach to Player On Update or use a Common Script)
- If **Score** >= 10 and **HoleLevel** == 1:
  - Set **HoleLevel** = 2
  - Change Player Sprite → **hole_medium.png**
  - Play Sound (Grow)
- If **Score** >= 25 and **HoleLevel** == 2:
  - Set **HoleLevel** = 3
  - Change Player Sprite → **hole_large.png**
  - Play Sound (Grow)

## Object Template (Actor: e.g., Tree or Car) — On Player Collision
Use the same pattern for each object, changing **RequiredLevel** and **ScoreGain**.

- For Tier 1 (Cone/Bin/Bush):
  - If **HoleLevel** >= 1:
    - Hide Actor (Self)
    - Add **Score** += 1
    - Play Sound (Gulp)
  - Else:
    - Play Sound (Bump)

- For Tier 2 (Car/Bench):
  - If **HoleLevel** >= 2:
    - Hide Actor (Self)
    - Add **Score** += 3
    - Play Sound (Gulp)
  - Else:
    - Play Sound (Bump)

- For Tier 3 (Truck/House):
  - If **HoleLevel** >= 3:
    - Hide Actor (Self)
    - Add **Score** += 5
    - Play Sound (Big Gulp)
  - Else:
    - Play Sound (Bump)

## HUD (Scene: On Draw or attach to a UI Actor that updates every second)
- Display Text at (0,0): `SCORE: [Score]`
- Display Text at (12,0): `TIME: [Timer]`

## Game Over Scene (On Init)
- Display Text Centered: `FINAL SCORE: [Score]`
- If **Score** > **HighScore**:
  - Set **HighScore** = **Score**
  - Display `NEW HIGH SCORE!`
- Wait for Button (A or Start) → Switch Scene to Main City Scene
