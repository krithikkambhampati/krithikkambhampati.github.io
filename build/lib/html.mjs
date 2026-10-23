// Tiny helpers for writing HTML in template literals.

export function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Join arrays and drop false/null so `${cond && "<p>…</p>"}` works.
export function html(strings, ...values) {
  return strings.reduce((out, str, i) => {
    let v = values[i - 1];
    if (Array.isArray(v)) v = v.filter((x) => x !== false && x != null).join("");
    else if (v === false || v == null) v = "";
    return out + v + str;
  });
}
