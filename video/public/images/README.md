# Images for the punk / glitch intro

Drop two files in THIS folder. Names must match exactly (lowercase):

    backdrop.png    the abstract typography artwork
    portrait.png    the cut-out portrait

Both are optional — the intro falls back to a procedural stand-in if a file
is missing, so the studio never goes blank while you are still adding art.
Once a file is here it is picked up on the next reload. No code change.

## Portrait background

A PNG with a TRANSPARENT background works best.

If your portrait has a solid WHITE background instead, open
`src/Intro/PunkGlitchIntro.tsx` and set:

    const PORTRAIT_KNOCKS_OUT_WHITE = true;

That multiply-blends the white away and keeps the subject.

## Formats

.png is expected. To use .jpg instead, change the BACKDROP / PORTRAIT
constants at the top of `src/Intro/PunkGlitchIntro.tsx`.
