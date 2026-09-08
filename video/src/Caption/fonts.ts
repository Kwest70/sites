import { continueRender, delayRender, staticFile } from "remotion";

/**
 * Fonts for the caption compositions.
 *
 * Loaded through the FontFace API behind delayRender() so that no frame is
 * ever captured while a face is still resolving. Declaring the faces in CSS
 * instead caused a flash of invisible text that landed on random frames and
 * produced intermittently blank frames in the render.
 *
 * Zuume Rough is a commercial font (Fenotype) and is not committed here — its
 * load is allowed to fail. Drop ZuumeRough.woff2 (or .otf) into
 * video/public/fonts/ and it is picked up automatically, because it sits ahead
 * of the fallback in the stack. See public/fonts/README.md.
 */
export const CAPTION_FONT_FAMILY =
  '"Zuume Rough", "Caption Fallback", sans-serif';

const loadFace = async (family: string, sources: string[]) => {
  for (const source of sources) {
    try {
      const face = await new FontFace(
        family,
        `url(${staticFile(source)})`,
      ).load();
      document.fonts.add(face);
      return true;
    } catch {
      // Try the next format, then give up on this family.
    }
  }

  return false;
};

const handle = delayRender("Loading caption fonts");

Promise.all([
  loadFace("Caption Fallback", ["fonts/Anton-Regular.woff2"]),
  loadFace("Zuume Rough", ["fonts/ZuumeRough.woff2", "fonts/ZuumeRough.otf"]),
])
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));
