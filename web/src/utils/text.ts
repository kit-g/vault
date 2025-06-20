/**
 * Converts an HTML string into a plain text string by stripping all HTML tags,
 * while preserving line breaks from block-level elements.
 * @param html The HTML string to convert.
 * @returns A plain text representation of the HTML.
 */
export function stripHtml(html: string): string {
  let text = html;

  // first, replace <br> tags and the closing tags of common block elements
  // with a newline character. This is the most important step.
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, '\n');
  text = text.replace(/<\/blockquote>/gi, '\n');

  // now that the newlines are in the string, use the DOM method
  // to strip any remaining inline tags (like <b>, <i>, <span>, etc.).
  const div = document.createElement('div');
  div.innerHTML = text;
  const plainText = div.textContent || "";

  // clean up any resulting multiple blank lines.
  return plainText.replace(/\n\s*\n/g, '\n').trim();
}