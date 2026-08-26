#!/usr/bin/env bash
# Build the tree-sitter grammars ast-grep needs for languages it does not ship.
#
# ast-grep has no Zig, C3, or Hare parser, so structural search over those
# languages is impossible without one. This compiles each grammar into a shared
# library and drops it where sgconfig.yml expects it. The .so files are build
# artifacts: they are not committed, and this script is how you get them back.
#
# Usage: ./build.sh [lang ...]     # default: every grammar below
set -euo pipefail

OUT_DIR="${AST_GREP_GRAMMAR_DIR:-$(cd "$(dirname "$0")" && pwd)}"
SRC_DIR="${AST_GREP_GRAMMAR_SRC_DIR:-$HOME/.cache/ast-grep-grammars}"

# lang|repo|ref. Every ref is a tag's commit, never a branch: a floating clone
# fetches different source on every run with no way to tell the versions apart.
GRAMMARS=(
  "zig|https://github.com/tree-sitter-grammars/tree-sitter-zig.git|b670c8df85a1568f498aa5c8cae42f51a90473c0"    # v1.1.2
  "c3|https://github.com/c3lang/tree-sitter-c3.git|06ad624ceb8bbed01ad65dfbd51626938a1ea3f2"                    # v0.9.0
  "hare|https://github.com/tree-sitter-grammars/tree-sitter-hare.git|bc45707db7cbd739c9240f3a85b265d2f6490398"   # v1.0.0
)

command -v cc >/dev/null || { printf 'error: a C compiler is required\n' >&2; exit 1; }
mkdir -p "$OUT_DIR" "$SRC_DIR"

build_one() {
  local lang="$1" repo="" ref="" entry checkout srcs=()
  for entry in "${GRAMMARS[@]}"; do
    if [ "${entry%%|*}" = "$lang" ]; then
      entry="${entry#*|}"
      repo="${entry%%|*}"
      ref="${entry#*|}"
      ref="${ref%%[[:space:]]*}"
      break
    fi
  done
  [ -n "$repo" ] || { printf 'error: unknown grammar %s\n' "$lang" >&2; return 1; }

  checkout="$SRC_DIR/tree-sitter-$lang"
  [ -d "$checkout/.git" ] || git clone --quiet "$repo" "$checkout"
  git -C "$checkout" fetch --quiet origin "$ref"
  git -C "$checkout" checkout --quiet --detach "$ref"

  # Some grammars ship an external scanner and some do not, so it is compiled
  # only when present rather than assumed either way. A C++ scanner (.cc) needs
  # c++ instead of cc for the whole link.
  srcs=("$checkout/src/parser.c")
  if [ -f "$checkout/src/scanner.cc" ]; then
    command -v c++ >/dev/null || { printf 'error: %s needs a C++ compiler\n' "$lang" >&2; return 1; }
    srcs+=("$checkout/src/scanner.cc")
    c++ -shared -fPIC -O2 -I "$checkout/src" "${srcs[@]}" -o "$OUT_DIR/$lang.so"
  else
    [ -f "$checkout/src/scanner.c" ] && srcs+=("$checkout/src/scanner.c")
    cc -shared -fPIC -O2 -I "$checkout/src" "${srcs[@]}" -o "$OUT_DIR/$lang.so"
  fi
  printf 'built %s (%s @ %.12s)\n' "$OUT_DIR/$lang.so" "$lang" "$ref"
}

langs=("$@")
if [ ${#langs[@]} -eq 0 ]; then
  for entry in "${GRAMMARS[@]}"; do langs+=("${entry%%|*}"); done
fi
for lang in "${langs[@]}"; do build_one "$lang"; done

# The dollars are ast-grep metavariables and must remain literal in the example.
# shellcheck disable=SC2016
printf 'check them: ast-grep run --config sgconfig.yml -l zig -p "const \$A = @import(\$B);" <file.zig>\n'
