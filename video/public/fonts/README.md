# Fonts

## Zuume Rough (the real thing)

Zuume Rough is a commercial font from Fenotype — it cannot be committed to
this repo. Once you have a licence (Adobe Fonts / MyFonts), drop the file
into THIS folder named exactly:

    ZuumeRough.woff2      (preferred)
    ZuumeRough.otf        (also works)

Nothing else to change. `src/Caption/ProfileCaption.tsx` already declares
a @font-face pointing here, and lists Zuume Rough first in the font stack,
so it takes over automatically the moment the file exists.

Until then the captions render in **Anton**, a free condensed heavy display
face used as the closest available stand-in.
