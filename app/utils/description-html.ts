// Gets a product's written descriptions — the HTML the dashboard's editors
// save — ready to put on a page.
//
// Much of what is saved was pasted in from other shops' pages, so it arrives
// with their wrapper tags, their CSS class names (which can collide with this
// site's own), stray labels and blank lines at the edges. What comes out of
// here keeps the author's text, structure and styling — titles, lists, fonts,
// sizes, colors, icons, emoji — and nothing else.

import { withSiteFontVariables } from "@/app/utils/description-fonts";
import {
  DESCRIPTION_ICON_CLASS,
  renderDescriptionIcons,
} from "@/app/utils/description-icons";
import { DESCRIPTION_BLANK_CLASS } from "@/app/utils/description-styles";

const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

/**
 * A description as plain text that still shows the author's structure — list
 * items become "• " bullet lines and paragraphs stay on their own line — for
 * places that can't take HTML (the page's meta description).
 */
export function descriptionText(html: string): string {
  return (
    html
      .replace(/<li[^>]*>/gi, "\n• ")
      .replace(/<\/li>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h[1-6]|tr|ul|ol|table)>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(
        /&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;|&apos;/g,
        (m) => HTML_ENTITIES[m],
      )
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      // No blank lines between blocks — paragraphs and bullets stack tight,
      // one per line, instead of leaving a gap-sized empty line between them.
      .filter((line) => line !== "")
      .join("\n")
      .trim()
  );
}

// Nothing that runs, in either description.
const ACTIVE_PAIRED_TAGS =
  /<(script|style|object|embed|form|svg|canvas)\b[\s\S]*?<\/\1\s*>/gi;
const ACTIVE_SINGLE_TAGS =
  /<\/?(script|style|object|embed|form|svg|canvas|input|button|select|textarea|link|meta|base)\b[^>]*>/gi;

// And in the short description, no pictures or players either. The
// dashboard's editor leaves these out already; this covers descriptions
// written before it did.
const MEDIA_PAIRED_TAGS =
  /<(iframe|video|audio|picture|figure)\b[\s\S]*?<\/\1\s*>/gi;
const MEDIA_SINGLE_TAGS =
  /<\/?(iframe|video|audio|picture|figure|img|source|track)\b[^>]*>/gi;

// The only class names that mean anything here: the editor's icon and emoji
// markers. Every other class came along with pasted text and belongs to the
// page it was copied from.
const EMOJI_CLASS = "sd-emoji";
const KEPT_CLASSES = new Set([DESCRIPTION_ICON_CLASS, EMOJI_CLASS]);

// The attributes a description's tags may keep: what styles and links text,
// lays out a table, and names an icon…
const TEXT_ATTRIBUTES = new Set([
  "style",
  "href",
  "target",
  "rel",
  "title",
  "dir",
  "lang",
  "start",
  "reversed",
  "colspan",
  "rowspan",
  "scope",
  "border",
  "cellpadding",
  "cellspacing",
  "data-icon",
  "data-size",
]);
// …and, in the overview, what a picture or a video needs.
const MEDIA_ATTRIBUTES = new Set([
  "src",
  "alt",
  "width",
  "height",
  "controls",
  "poster",
  "type",
  "allow",
  "allowfullscreen",
  "frameborder",
  "loading",
  "referrerpolicy",
]);

const OPENING_TAG = /<([a-z][a-z0-9]*)\b((?:"[^"]*"|'[^']*'|[^>"'])*)>/gi;
const ATTRIBUTE = /([^\s"'=<>/]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g;
const UNSAFE_URL = /^(javascript|vbscript|data:text\/html)/i;

const unquote = (value: string) =>
  /^(".*"|'.*')$/.test(value) ? value.slice(1, -1) : value;

// Rewrites every opening tag with only the attributes it may keep.
const cleanAttributes = (html: string, allowMedia: boolean): string =>
  html.replace(OPENING_TAG, (_tag, name: string, rawAttributes: string) => {
    const selfClosing = /\/\s*$/.test(rawAttributes);
    const kept: string[] = [];

    for (const [, rawName, rawValue] of rawAttributes.matchAll(ATTRIBUTE)) {
      const attribute = rawName.toLowerCase();
      const value = rawValue === undefined ? undefined : unquote(rawValue);

      if (attribute === "class") {
        const classes = (value ?? "")
          .split(/\s+/)
          .filter((className) => KEPT_CLASSES.has(className));
        if (classes.length > 0) kept.push(`class="${classes.join(" ")}"`);
        continue;
      }

      const allowed =
        TEXT_ATTRIBUTES.has(attribute) ||
        (allowMedia && MEDIA_ATTRIBUTES.has(attribute));
      if (!allowed) continue;

      if (value === undefined) {
        kept.push(attribute);
        continue;
      }
      // A link or picture address that would run code instead of loading.
      if (
        (attribute === "href" || attribute === "src" || attribute === "poster") &&
        UNSAFE_URL.test(value.replace(/\s+/g, ""))
      ) {
        continue;
      }
      // A style that would run code (old-browser tricks).
      if (attribute === "style" && /expression\s*\(|javascript:/i.test(value)) {
        continue;
      }
      kept.push(`${attribute}="${value.replace(/"/g, "&quot;")}"`);
    }

    return `<${name}${kept.length > 0 ? ` ${kept.join(" ")}` : ""}${selfClosing ? " /" : ""}>`;
  });

// What a block with no text in it can still hold: spaces, line breaks, and
// the tags of styling that was applied to the empty line (a font size, bold).
// An icon is not nothing — its placeholder is left out of this.
const NOTHING = String.raw`(?:\s|&nbsp;|<br\s*\/?>|<\/?(?:span|strong|b|em|i|u|s|font|sup|sub)\b(?:(?!data-icon)[^>])*>)*`;
// A paragraph, title or plain block with nothing in it — a blank line.
// (Its groups are named: it is built into the two patterns below, where a
// numbered group would be counted from the start of the whole pattern.)
const EMPTY_BLOCK = String.raw`<(?<blank>p|div|h[1-6])\b[^>]*>${NOTHING}<\/\k<blank>\s*>`;
// Blank lines at the very start or end add nothing but a gap above or below
// the text. They are looked for through any wrapper <div>s round the text —
// pasted descriptions usually sit inside one or two.
const LEADING_BLANKS = new RegExp(
  String.raw`^(?<wrappers>(?:\s*<div\b[^>]*>)*\s*)(?:${EMPTY_BLOCK}\s*)+`,
  "i",
);
const TRAILING_BLANKS = new RegExp(
  String.raw`(?:\s*${EMPTY_BLOCK})+(?<wrappers>(?:\s*<\/div\s*>)*\s*)$`,
  "i",
);
// The label other shops print over this text ("Brief Description"), copied
// along with it. On this page the text needs no label.
const LEADING_LABEL =
  /^((?:\s*<div\b[^>]*>)*\s*)<(p|div|h[1-6]|strong|b)\b[^>]*>\s*(?:brief|short)\s+description\s*:?\s*<\/\2\s*>/i;

const trimBlankEdges = (html: string): string => {
  let trimmed = html.trim();
  // Each pass can uncover another blank line or the label behind it.
  for (let pass = 0; pass < 5; pass += 1) {
    const next = trimmed
      .replace(LEADING_BLANKS, "$<wrappers>")
      .replace(LEADING_LABEL, "$1")
      .replace(TRAILING_BLANKS, "$<wrappers>")
      .trim();
    if (next === trimmed) break;
    trimmed = next;
  }
  return trimmed;
};

// A blank line made inside a paragraph instead of between two — the
// paragraph opens with a line break ("<p>&nbsp;<br>Made in Korea</p>") or
// closes with one. It is moved out into a paragraph of its own, so it is
// drawn like every other blank line.
const OPENING_BREAKS =
  /<(p|h[1-6])\b([^>]*)>(?:(?:\s|&nbsp;)*<br\s*\/?>)+(?:\s|&nbsp;)*(?=\S)/gi;
const CLOSING_BREAKS =
  /(?:<br\s*\/?>\s*)+(?:&nbsp;\s*)+<\/(p|h[1-6])\s*>/gi;

const liftInnerBlankLines = (html: string): string =>
  html
    .replace(
      OPENING_BREAKS,
      (_match, tag: string, attributes: string) =>
        `<p>&nbsp;</p><${tag}${attributes}>`,
    )
    .replace(CLOSING_BREAKS, (_match, tag: string) => `</${tag}><p>&nbsp;</p>`);

// The blank lines left inside the text — an empty paragraph between two
// others — are marked, so the page can draw them shorter than a full line.
const BLANK_LINE = new RegExp(
  String.raw`<(p|div|h[1-6])\b((?:(?!\bclass\s*=)[^>])*)>(${NOTHING})<\/\1\s*>`,
  "gi",
);

const markBlankLines = (html: string): string =>
  html.replace(
    BLANK_LINE,
    (_blank, tag: string, attributes: string, content: string) =>
      `<${tag}${attributes} class="${DESCRIPTION_BLANK_CLASS}">${content}</${tag}>`,
  );

const hasTags = (html: string) => /<[a-z][^>]*>/i.test(html);

const prepare = (html: string, allowMedia: boolean): string => {
  let cleaned = html
    .replace(ACTIVE_PAIRED_TAGS, "")
    .replace(ACTIVE_SINGLE_TAGS, "");
  if (!allowMedia) {
    cleaned = cleaned
      .replace(MEDIA_PAIRED_TAGS, "")
      .replace(MEDIA_SINGLE_TAGS, "");
  }
  cleaned = trimBlankEdges(
    liftInnerBlankLines(cleanAttributes(cleaned, allowMedia)),
  );

  // Text typed without any tags keeps its line breaks.
  if (!hasTags(cleaned)) return cleaned.replace(/\r?\n/g, "<br />");

  // The icons go in last: they are drawn as <svg>, which the clean-up above
  // would otherwise remove.
  return renderDescriptionIcons(
    withSiteFontVariables(markBlankLines(cleaned)),
  );
};

/**
 * The short description, ready to show: text only — titles, lists, fonts,
 * sizes, colors, icons and emoji as the author set them. Returns "" when
 * there is no text in it at all.
 */
export function prepareSummaryHtml(html: string): string {
  const prepared = prepare(html, false);
  // Icons count as content; a description of nothing but blank lines doesn't.
  return descriptionText(prepared) === "" && !prepared.includes("<svg")
    ? ""
    : prepared;
}

/**
 * The overview, ready to show: everything the author put in it — pictures,
 * videos and tables included. Returns "" when it is empty.
 */
export function prepareOverviewHtml(html: string): string {
  const prepared = prepare(html, true);
  return descriptionText(prepared) === "" &&
    !/<(img|iframe|video|svg)\b/i.test(prepared)
    ? ""
    : prepared;
}
