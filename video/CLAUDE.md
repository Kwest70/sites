# Working rules for the `video/` Remotion project

## What this is

A Remotion video project for **Future Creatives**, living in `video/` inside
the Next.js site repo. It is a separate npm package (React 19 + Tailwind v4)
and must not be merged into the root app's dependency tree.

## The user's setup — do not forget this

- Windows 10, Command Prompt, **non-technical**. They are not a developer.
- Their working copy is a **`git clone`** at
  `C:\Users\kwest\Documents\The Cultural Assembly\sites-claude-create-video-setup-q9f5a3\sites`
- Branch: `claude/create-video-setup-q9f5a3`
- They run the studio from `sites\video` with `npm run dev`.

## The workflow — never deviate

1. User describes what they want **in plain English**.
2. **Claude edits the files here and pushes.**
3. User runs `git pull` then restarts `npm run dev`.

**Never ask the user to copy and paste code.** Never ask them to hand-edit a
file. They asked for this explicitly and it is the whole point of the setup.

## Hard rules — each of these was violated and cost real time

1. **VERIFY BEFORE PUSHING.** Render a still and *look at it* with the Read
   tool before every push that changes anything visual:
   ```
   npx remotion still HelloWorld /tmp/.../check.png --frame=60 \
     --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
   ```
   Then run `npm run lint`. Never push blind and let the user discover the
   breakage.

2. **NEVER INVENT THE LOGO.** The Future Creatives F mark already exists in
   this repo at `src/components/Logo.tsx` (site) and
   `video/src/HelloWorld/Logo.tsx` (video). Use those exact SVG paths. Do not
   draw approximations out of `<rect>` elements. This was done three times and
   was wrong three times.

3. **NEVER import a binary asset that isn't in the repo.** `import x from
   "./foo.png"` fails the build if the file isn't committed, and the user sees
   a blank white page with no explanation. Prefer inline SVG. If an image is
   genuinely needed, commit the file first.

4. **A blank studio page = a build error.** Read the terminal output for the
   `ERROR in ./src/...` line rather than guessing at caches or hard refreshes.

5. **Give one command at a time.** Numbered, in its own code block, with what
   the expected output looks like. They cannot tell my tool output apart from
   instructions meant for them — never let them copy a command I ran here.

## Brand

| Token | Hex |
|---|---|
| Logo cyan | `#4FD8F5` |
| Midnight (text) | `#0E0018` |
| Purple | `#2D0054` |
| Orange | `#FF5500` |
| Gold | `#D4A017` |
| Offwhite | `#F5F0EA` |

Defaults live in `src/Root.tsx` under `defaultProps`. Editing those changes
what the studio and the render both show.

## Commands

```bash
npm ci          # install (npm install OOMs on their machine — use ci)
npm run dev     # studio on localhost:3000
npm run lint    # eslint + tsc — must pass before pushing
npx remotion render HelloWorld out/video.mp4
```

## Root repo interaction

`video/` is excluded from the root `tsconfig.json` so `next build` does not
typecheck it. Do not remove that exclusion — it breaks the site build.
