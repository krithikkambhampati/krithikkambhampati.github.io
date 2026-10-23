// A small build-time syntax highlighter for the code excerpts on project
// pages. It knows just enough of C, Go, Python and JavaScript to colour
// keywords, types, calls, strings, numbers and comments, and renders each
// source line as its own span so CSS can number them.

import { esc } from "./html.mjs";

const KEYWORDS = {
  c: "auto break case char const continue default do double else enum extern float for goto if inline int long register return short signed sizeof static struct switch typedef union unsigned void volatile while bool true false NULL",
  go: "break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var nil true false",
  python: "and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield None True False self",
  js: "async await break case catch class const continue default delete do else export extends finally for from function if import in instanceof let new of return switch this throw try typeof var void while yield null undefined true false",
  kotlin: "as break class continue do else false for fun if in is null object package private return super this throw true try typealias val var when while until mutableListOf mutableMapOf to",
};

const TYPES = {
  c: /^(?:[A-Z][A-Za-z0-9_]*|[a-z_][a-z0-9_]*_t|size_t|ssize_t|pthread_\w+|FILE|uint\d+_t|int\d+_t|u_char|u_int)$/,
  go: /^(?:[A-Z][A-Za-z0-9_]*|string|int|int64|int32|uint|uint8|uint64|float64|float32|bool|byte|rune|error|any)$/,
  python: /^(?:[A-Z][A-Za-z0-9_]*|int|str|float|dict|list|tuple|set|bool)$/,
  js: /^[A-Z][A-Za-z0-9_]*$/,
  kotlin: /^[A-Z][A-Za-z0-9_]*$/,
};

function tokenize(src, lang) {
  const kw = new Set((KEYWORDS[lang] || "").split(" "));
  const typeRe = TYPES[lang] || /^$/;
  const lineComment = lang === "python" ? "#" : "//";
  const out = [];
  let i = 0;

  const push = (type, text) => out.push({ type, text });

  while (i < src.length) {
    const ch = src[i];
    const rest = src.slice(i);

    // comments
    if (rest.startsWith(lineComment)) {
      const end = src.indexOf("\n", i);
      const stop = end === -1 ? src.length : end;
      push("c", src.slice(i, stop));
      i = stop;
      continue;
    }
    if (lang !== "python" && rest.startsWith("/*")) {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      push("c", src.slice(i, stop));
      i = stop;
      continue;
    }
    if (lang === "python" && (rest.startsWith('"""') || rest.startsWith("'''"))) {
      const q = rest.slice(0, 3);
      const end = src.indexOf(q, i + 3);
      const stop = end === -1 ? src.length : end + 3;
      push("s", src.slice(i, stop));
      i = stop;
      continue;
    }
    // preprocessor / decorators
    if ((lang === "c" && ch === "#") || (lang === "python" && ch === "@")) {
      const lineStart = src.lastIndexOf("\n", i - 1) + 1;
      if (src.slice(lineStart, i).trim() === "") {
        const end = src.indexOf("\n", i);
        const stop = end === -1 ? src.length : end;
        push("p", src.slice(i, stop));
        i = stop;
        continue;
      }
    }
    // strings
    if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < src.length && src[j] !== ch) {
        if (src[j] === "\\") j++;
        if (src[j] === "\n" && ch !== "`") break;
        j++;
      }
      push("s", src.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    // numbers
    const num = /^(?:0x[0-9a-fA-F]+|\d+(?:\.\d+)?)(?:[uUlLfF]*)/.exec(rest);
    if (num && !/[A-Za-z0-9_]/.test(src[i - 1] || "")) {
      push("n", num[0]);
      i += num[0].length;
      continue;
    }
    // identifiers
    const id = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
    if (id) {
      const word = id[0];
      const after = src.slice(i + word.length).match(/^\s*\(/);
      if (kw.has(word)) push("k", word);
      else if (typeRe.test(word)) push("t", word);
      else if (after) push("f", word);
      else push("", word);
      i += word.length;
      continue;
    }
    push("", ch);
    i++;
  }
  return out;
}

export function highlight(src, lang) {
  const tokens = tokenize(src.replace(/\t/g, "    ").replace(/\s+$/, ""), lang);
  const lines = [[]];
  for (const tok of tokens) {
    const parts = tok.text.split("\n");
    parts.forEach((part, idx) => {
      if (idx > 0) lines.push([]);
      if (part) lines[lines.length - 1].push(tok.type ? `<span class="t-${tok.type}">${esc(part)}</span>` : esc(part));
    });
  }
  return lines.map((l) => `<span class="ln">${l.join("") || " "}</span>`).join("");
}
