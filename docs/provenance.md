# Provenance

- 2026-11-08: At the user's request, added a rule to stop processes by exact PID, never by pattern (`pkill -f`, `killall`, `pgrep -f | xargs kill`), because the pattern matched the agent's own shell command line and killed it during MitoX firmware work. Evidence: `AGENTS.md`, Working Loop section. Verified the saved rule through `~/.agents/AGENTS.md` and `git diff --check`.

- 2026-10-24: At the user's request, added automatic cleanup of worktrees and local branches after verified merges to `main`, including inactive leftovers from earlier sessions. Required clean worktrees, merge evidence, named non-forced removal, and preservation of active work and remote branches. Evidence: `AGENTS.md`, Git and AI Attribution section; global symlink `~/.agents/AGENTS.md`. Verified the saved rule through the symlink and `git diff --check`; no worktrees or branches were removed.

- 2026-10-23: At the user's request, added mandatory Humanizer and Unslop writing guidance to the global rules in `AGENTS.md`, linked through `~/.agents/AGENTS.md`. Sources: https://github.com/blader/humanizer and https://github.com/theclaymethod/unslop. Verified both repository pages, the global symlink target, the saved instruction through the symlink, and `git diff --check`.
