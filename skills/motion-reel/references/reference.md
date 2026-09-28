# From a reference to a style guide

Without a reference the model falls back to its defaults. Naming a style beats describing one, and a
real frame or video gives pacing, type and transitions to copy. Take the grammar, never the content.

## A frame
Open it (Read shows images). Say what to take (palette, type, grain, composition) and what not
(the subject, logos, characters).

## A video
Read can't open MP4, so turn it into images and numbers first:
```bash
mkdir -p refs/frames
ffmpeg -i refs/ref.mp4 -vf "fps=2,scale=480:-1" refs/frames/f%03d.png                 # a frame every 0.5 s
ffmpeg -i refs/ref.mp4 -vf "fps=2,scale=320:-1,tile=6x5" -frames:v 1 refs/sheet.png    # the first 15 s on one image
ffmpeg -i refs/ref.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep -o "pts_time:[0-9.]*"   # cut times
```
Cut times give shot lengths (median and spread); the sheet gives transitions and how text enters and
leaves. Describe the pacing shot by shot before writing code.

## An image library
A folder of the user's own images or past work: open a sample, write the guide from it. A reference
nobody else has is the best cure for films that look like everyone else's.

## docs/style_guide.md
- Palette (hex) and where each colour is used; the one accent
- Type: families, weights, tracking, sizes (phone-readable), how text enters and leaves
- Shot lengths and rhythm; transition types and when each is used
- Camera: moves, scale changes, parallax
- Texture: grain, paper, pixel grid, line quality
- Taken from the reference / taken from the subject's own world
- Refused: what this film will not do
Show it with the shot list and wait for the OK before code.
