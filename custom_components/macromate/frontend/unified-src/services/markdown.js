import { html } from "lit";
// Markdown is rendered as Lit templates: HTML and links never become raw markup.
function inline(text) {
  return String(text)
    .split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g)
    .map((part) =>
      part.startsWith("**")
        ? html`<strong>${part.slice(2, -2)}</strong>`
        : part.startsWith("`")
          ? html`<code>${part.slice(1, -1)}</code>`
          : part.startsWith("*")
            ? html`<em>${part.slice(1, -1)}</em>`
            : part,
    );
}
export function markdown(text) {
  return String(text || "")
    .split("\n")
    .map((line) =>
      line.startsWith("### ")
        ? html`<h3>${inline(line.slice(4))}</h3>`
        : line.startsWith("## ")
          ? html`<h2>${inline(line.slice(3))}</h2>`
          : line.startsWith("# ")
            ? html`<h1>${inline(line.slice(2))}</h1>`
            : /^[-*] /.test(line)
              ? html`<ul>
                  <li>${inline(line.slice(2))}</li>
                </ul>`
              : html`<p>${inline(line)}</p>`,
    );
}
