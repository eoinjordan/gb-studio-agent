# Mini Hole City — GBC Starter (GB Studio)

This pack contains **ready-to-import sprites, tiles, and a sample background** for a Game Boy Color
"Hole.io"-style game built in **GB Studio 3.2+**.

## Structure
- assets/sprites
  - hole_small.png (16x16)
  - hole_medium.png (24x24)
  - hole_large.png (32x32)
  - hole_shadow.png (16x16, optional)
- assets/objects
  - cone_8.png, bin_8.png, bush_8.png
  - car_red_16.png, car_blue_16.png
  - bench_16x8.png
  - truck_24x16.png
  - house_32.png
- assets/tilesets
  - city_tiles.png (128x128 sheet of 8x8 tiles)
- assets/backgrounds
  - sample_city_256.png (256x256 test background)
- docs
  - scripts.md (GB Studio event setup: variables, collisions, growth)
  - palettes.md (palette assignment tips)

## Import Steps (GB Studio)
1. Create a **Game Boy Color** project (Project Settings → Platform → Game Boy Color).
2. Import tileset: **Backgrounds → Tilesets → Add → city_tiles.png**.
3. Create a new background and draw your map using `city_tiles.png` (or import `sample_city_256.png` as a quick test background).
4. Import sprites:
   - Player: use `hole_small.png` as the initial Player sprite (16×16).
   - Add additional sprites `hole_medium.png` and `hole_large.png` to switch at runtime.
   - Import objects under **Actors** from `assets/objects`.
5. Assign palettes per sprite/background in **Scene → Palettes** (see `docs/palettes.md`).
6. Add variables (Project → Variables): `Score`, `HoleLevel`, `Timer`, `Speed`.
7. Apply scripts from `docs/scripts.md` on the Player and Objects.

Happy building!
