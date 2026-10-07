# LANGUAGE — Language Garden

Language-learning games for the kids, starting with Vietnamese (`VN/`).

Open `LANGUAGE/` from the running EducationStation server
(e.g. `http://localhost:8080/LANGUAGE/`). The launch page uses the same
1024×768 stage (`../shared/stage.js`), START gate, numbered cards, top-nav back
link and UI sounds as EducationStation, with a garden theme in place of space.

## Publishing

This folder is published along with EducationStation (games, lesson audio and
the voice recording used to make it), but nothing on the public menu links to
it; open `LANGUAGE/` directly. Only generation logs and scratch files stay
local. When syncing:

```sh
rsync -a --exclude .git --exclude .DS_Store \
  --exclude 'LANGUAGE/VN/audio/make_voices.log' --exclude 'LANGUAGE/VN/audio/.work' \
  --exclude '__pycache__' \
  <local EducationStation>/ <public EducationStation>/
```

## Layout

```text
LANGUAGE/
  index.html              launch page (languages → games)
  shared/language.css     garden theme on top of ../shared/retro.css
  shared/language-menu.js menu screens and cards
  VN/                     Vietnamese games
```

To add a game, put it under `VN/<game>/index.html` and add a card to the `vn`
screen in `shared/language-menu.js` (`launch: true`). To add a language, add a
card to `home` and a new screen.
