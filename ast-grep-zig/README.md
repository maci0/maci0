# ast-grep for Zig

ast-grep ships no Zig grammar, so every Zig pattern matches nothing until one is
registered. This is the working setup: a grammar build script, the project config
that loads it, and a probe rule to prove it parses.

```sh
./build.sh                 # compiles tree-sitter-zig -> zig.so (pinned commit)
ast-grep scan --config sgconfig.yml src/          # run the rules
ast-grep run --config sgconfig.yml -l zig \
  -p 'const $A = @import($B);' src/main.zig       # one-off pattern
```

Copy `sgconfig.yml`, `build.sh`, and `rules/` into a repo root, or point at them
with `--config`. The compiled `zig.so` is a build artifact: never commit it, run
`build.sh` again instead. `AST_GREP_GRAMMAR_DIR` moves the output, and
`AST_GREP_GRAMMAR_SRC_DIR` moves the grammar checkout (default
`~/.cache/ast-grep-grammars`).

## Why `expandoChar: "_"`

ast-grep rewrites `$VAR` in a pattern to `<expandoChar>VAR` before handing it to
the target grammar's parser. The default `$` is not a legal Zig identifier
character, so every metavariable pattern parsed as an error node and matched
nothing, silently, with exit code 0. Zig identifiers are `[A-Za-z0-9_]`, so the
placeholder has to be `_`. Any custom language needs the same check before its
patterns can be trusted.

## Grammar pinning

`build.sh` clones [tree-sitter-zig](https://github.com/tree-sitter-grammars/tree-sitter-zig)
at a pinned commit (tag `v1.1.2`), not a branch: a floating clone fetches
different source on every run with no way to tell the versions apart. It compiles
`src/parser.c` plus `src/scanner.c` when the grammar ships one (Zig currently
does not), so the same script works for grammars that have an external scanner.

## Probe rule

`rules/zig-probe.yml` matches `fn $NAME($$$ARGS) !void { $$$BODY }` at `hint`
severity. It exists to answer one question after a grammar rebuild: does a
metavariable pattern still match real code? Zero hits on a tree full of
error-returning functions means the grammar or `expandoChar` is wrong, not that
the code is clean.
