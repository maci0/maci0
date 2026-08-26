# ast-grep grammars: Zig, C3, Hare

ast-grep ships no grammar for these three, so every pattern matches nothing until
one is registered. This is the working setup: a build script for the grammars,
the project config that loads them with the right `expandoChar`, probe rules, and
sample files to prove all of it parses.

```sh
./build.sh                                   # all three -> zig.so, c3.so, hare.so
./build.sh c3                                # just one
ast-grep scan --config sgconfig.yml samples/ # self-check: 5 hints across 3 languages
ast-grep scan --config sgconfig.yml src/     # run the rules on real code
ast-grep run --config sgconfig.yml -l zig \
  -p 'const $A = @import($B);' src/main.zig  # one-off pattern
```

Copy `sgconfig.yml`, `build.sh`, and `rules/` into a repo root, or point at them
with `--config`. The compiled `.so` files are build artifacts: never commit them,
run `build.sh` again instead. `AST_GREP_GRAMMAR_DIR` moves the output,
`AST_GREP_GRAMMAR_SRC_DIR` moves the grammar checkouts (default
`~/.cache/ast-grep-grammars`).

## expandoChar, the part that silently breaks everything

ast-grep rewrites `$VAR` in a pattern to `<expandoChar>VAR` before handing it to
the target grammar's parser. If the result is not a legal identifier there, the
pattern parses into an error node and matches nothing, silently, at exit code 0.
Nothing in the output says the placeholder was the problem.

| Language | expandoChar | Why |
|---|---|---|
| Zig | `_` | Identifiers are `[A-Za-z0-9_]`; `$` is not one of them. |
| Hare | `_` | Same. |
| C3 | `a` | C3 classifies identifiers by case, and `$` means something else. |

C3 is the interesting one. Its grammar has four identifier categories: lowercase
is a variable or function (`ident`), Capitalized is a type (`type_ident`),
ALL_CAPS is a constant (`const_ident`), and a leading `$` is a compile-time
identifier (`ct_ident` / `ct_const_ident`). So `$NAME` left alone parses as a
compile-time constant, and the underscore that works for Zig turns `$NAME` into
`_NAME`, which reads as ALL_CAPS and is rejected where a variable belongs.
Metavariable names are uppercase, so the expando has to supply the lowercase
start: `a` makes `$NAME` into `aNAME`, an ordinary `ident`.

The same reasoning gives C3's one hard limit: no metavariable in a **type**
position. A type there must be Capitalized-then-lowercase (`Foo`), and no
single-character prefix on an uppercase metavariable name can produce that. Write
the type out (`fn int $NAME(...)`), or match the enclosing declaration and filter.

Check this for any grammar you add. Build it, then run a pattern with a
metavariable against code you know contains a match: zero hits means the
placeholder, not the code.

## Fragments need context

A pattern is parsed as a standalone file, so a fragment that is not valid at top
level cannot match on its own. C3 accepts only declarations there, which is why
`return $A + $B;` and `add($A, $B)` match nothing while a whole `fn` declaration
matches fine. Wrap the fragment and select the node you want:

```yaml
rule:
  pattern:
    context: 'fn void _probe() { $FN($$$ARGS); }'
    selector: call_expr
```

Hare is looser: `const $A = $B;` is a valid top-level declaration, so it matches
in-function bindings too, no context needed.

Useful C3 node names: `func_definition`, `declaration_stmt`, `return_stmt`,
`expr_stmt`, `call_expr`, `binary_expr`, `ident_expr`. Hare: `call_expression`.
Dump your own with `--debug-query=ast` on a pattern that parses. Note that the
debug dump prints the pattern **before** expando substitution, so a `$` showing
up in an error node there is normal and not proof the config is wrong.

## Grammar pinning

`build.sh` clones each grammar at a pinned tag commit, never a branch: a floating
clone fetches different source on every run with no way to tell the versions
apart.

| Language | Grammar | Pin |
|---|---|---|
| Zig | [tree-sitter-grammars/tree-sitter-zig](https://github.com/tree-sitter-grammars/tree-sitter-zig) | `b670c8df` (v1.1.2) |
| C3 | [c3lang/tree-sitter-c3](https://github.com/c3lang/tree-sitter-c3) | `06ad624c` (v0.9.0) |
| Hare | [tree-sitter-grammars/tree-sitter-hare](https://github.com/tree-sitter-grammars/tree-sitter-hare) | `bc45707d` (v1.0.0) |

It compiles `src/parser.c` plus an external scanner when the grammar ships one
(`scanner.c` with `cc`, `scanner.cc` with `c++`; none of these three currently
ship one). Adding a language is one row in the `GRAMMARS` table, one block in
`sgconfig.yml`, and a probe rule.

## Probe rules

`rules/*-probe.yml` each match one shape that the samples are known to contain:
an error-returning function in Zig, a call in C3 and Hare. They exist to answer
one question after a grammar rebuild or a version bump: does a metavariable
pattern still match real code? A clean scan over `samples/` with zero hints means
the grammar or the `expandoChar` broke, not that the code is clean.
