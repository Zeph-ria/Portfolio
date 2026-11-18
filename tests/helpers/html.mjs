// Small, quote-aware HTML reader for static contract checks. This is not a browser
// and is deliberately not used to claim CSS/layout or assistive-technology QA.
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export function decodeEntities(value) {
  return String(value).replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (_, entity) => {
    if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2), 16));
    if (entity.startsWith('#')) return String.fromCodePoint(parseInt(entity.slice(1), 10));
    return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' }[entity.toLowerCase()];
  });
}

export function readHtml(source) {
  const elements = [];
  const stack = [];
  const errors = [];
  const tokenPattern = /<!--[^]*?-->|<!doctype[^>]*>|<\/?[a-z][\w:-]*(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
  let lastEnd = 0;
  for (const tokenMatch of source.matchAll(tokenPattern)) {
    const token = tokenMatch[0];
    const text = source.slice(lastEnd, tokenMatch.index);
    if (stack.length) stack.at(-1).ownText += text;
    lastEnd = tokenMatch.index + token.length;
    if (/^<!/.test(token)) continue;
    const closing = /^<\//.test(token);
    const tag = token.match(/^<\/?([\w:-]+)/)[1].toLowerCase();
    if (closing) {
      const last = stack.pop();
      if (!last || last.tag !== tag) errors.push(`Unexpected </${tag}> after ${last?.tag ?? 'root'}`);
      continue;
    }
    const attrs = {};
    const rest = token.replace(/^<[\w:-]+/, '').replace(/\/?\s*>$/, '');
    const attrPattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    for (const attr of rest.matchAll(attrPattern)) {
      const name = attr[1].toLowerCase();
      if (Object.hasOwn(attrs, name)) errors.push(`Duplicate attribute ${name} on <${tag}>`);
      attrs[name] = decodeEntities(attr[2] ?? attr[3] ?? attr[4] ?? '');
    }
    const node = { tag, attrs, parent: stack.at(-1) ?? null, children: [], ownText: '', sourceOffset: tokenMatch.index };
    node.parent?.children.push(node);
    elements.push(node);
    if (!voidTags.has(tag) && !/\/\s*>$/.test(token)) stack.push(node);
  }
  for (const node of stack) errors.push(`Unclosed <${node.tag}>`);
  return { elements, errors };
}

export function textContent(node) {
  return decodeEntities(node.ownText + node.children.map(textContent).join(' ')).replace(/\s+/g, ' ').trim();
}

export function normalizeForExclusions(value) {
  return String(value).normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}
