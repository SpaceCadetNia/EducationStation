# EducationStation

Retro space-themed learning webapps for local play around the house.

## Run locally

On macOS, double-click:

```text
Launch EducationStation.command
```

It starts the server, opens the menu, and prints the address for other
computers in the house.

Or start it manually.

From this folder:

```sh
python3 -m http.server 8080 --bind 0.0.0.0
```

Then open:

```text
http://YOUR-LAPTOP-IP:8080/
```

The first activity is `Number Seeker`, with separate pages for plus, minus,
multiply, and divide.

## Credits

Sound effects are sourced from [Freesound](https://freesound.org).

Music was generated from my personal Suno account:
[machyume on Suno](https://suno.com/@machyume).

## License

EducationStation is released under the MIT License. See `LICENSE`.
