# Reference material

Drop reference videos, screenshots or stills in HERE — not in `public/`.

`public/` is bundled into every render; this folder is not, so reference
material never ends up inside an exported video.

## Giving Claude a reference video

1. Copy the file into this folder.
2. Keep it SHORT — trim to the 5-10 seconds that actually show the look.
   A long clip bloats the repo and adds nothing; the first few seconds of
   the effect is all that's needed.
3. Commit and push (from the `sites` folder, not `video`):

       git add -A
       git commit -m "Add reference video"
       git push

4. Say it's pushed.

Claude pulls it, extracts frames and inspects the timing, colour, type and
motion directly.

## Note on the first push

The first `git push` from this machine may open a browser asking you to
sign in to GitHub. That is normal and happens once — Git for Windows
stores the credential afterwards.
