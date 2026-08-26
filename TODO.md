# Profile TODO

Outstanding work from the profile review on 2026-08-26. Traffic figures are the
14 days ending that date; star counts are from the same day.

Already done that day: descriptions on all 45 public repos, topics on 44 of 45
(the profile repo itself does not need them).

## Fix the pinned repositories

GitHub exposes no API for profile pins, so this one is manual:
<https://github.com/maci0> -> **Customize your pins**. Six is the cap.

1. `toktop`
2. `clanker` (922 views, 429 clones, the most-viewed repo)
3. `europa1400-networkfix` (7 stars, the highest)
4. `openmiles` (6 stars)
5. `gauntlet`
6. `rebrew`

Currently pinned and coming off: `pelorus`, which is a fork of
`dora-metrics/pelorus` carrying none of my commits; plus `katamaran` and
`muninn-sidecar`.

`muninn-sidecar` has 4 stars and is the third-highest, dropped only because of
the six-pin cap. If it goes back on, `rebrew` (0 stars) or `gauntlet` (1 star) is
the swap.

## Ship binaries

People are cloning these to build from source because there is nothing to
download, which is where most of them give up.

| repo | language | clones (14d) | releases |
| --- | --- | --- | --- |
| `agave` | Zig | 2813 | 0 |
| `clanker` | Zig | 429 | 0 |
| `cwen` | C | 44 | 0 |
| `openmiles` | Zig | 68 | 0 |
| `quota-widget` | Python | 11 | 0 |

`gauntlet` (30 releases) and `toktop` (9) already do this. The Quetoo Flatpak
release workflow is a working template for tag-triggered builds that attach
artifacts:
<https://github.com/WickedOldGames/org.quetoo.Quetoo/blob/master/.github/workflows/release.yml>

## Record demos

`toktop` and `clanker` are terminal UIs, so a still README undersells both. An
asciinema cast or a GIF near the top is the highest-leverage change left, and it
matters more now that `toktop` is going first among the pins.

Needs recording by hand; not something automation can produce.

## Set social preview images

All twelve repos checked still use the GitHub default, so shared links render as
a generic grey card on Hacker News, Reddit and Slack instead of a screenshot.

Settings -> General -> Social preview, per repo. Worth doing for the six pinned
ones at minimum.

## Smaller items

- The profile `blog` field is empty while `hireable` is true.
- `gilde-decomp` has 3 stars and no README at all. Deliberately deferred.
