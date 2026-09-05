// Lowers application-owned named SQL parameters for node-postgres.
// Markers in SQL literals, quoted identifiers, and comments remain SQL text.
export const bindNamedParameters = (sql, bindings) => {
  const values = [];
  let text = '';
  let index = 0;
  let blockCommentDepth = 0;

  while (index < sql.length) {
    const character = sql[index];
    const next = sql[index + 1];

    if (blockCommentDepth > 0) {
      if (character === '/' && next === '*') blockCommentDepth += 1;
      if (character === '*' && next === '/') blockCommentDepth -= 1;
      text += character;
      if ((character === '/' && next === '*') || (character === '*' && next === '/')) text += sql[++index];
      index += 1;
      continue;
    }
    if (character === '-' && next === '-') {
      const end = sql.indexOf('\n', index);
      text += sql.slice(index, end === -1 ? sql.length : end);
      index = end === -1 ? sql.length : end;
      continue;
    }
    if (character === '/' && next === '*') {
      blockCommentDepth = 1;
      text += '/*';
      index += 2;
      continue;
    }
    if (character === "'" || character === '"') {
      const quote = character;
      const start = index++;
      while (index < sql.length) {
        if (sql[index] === '\\') index += 2;
        else if (sql[index] === quote && sql[index + 1] === quote) index += 2;
        else if (sql[index] === quote) {
          index += 1;
          break;
        } else index += 1;
      }
      text += sql.slice(start, index);
      continue;
    }
    const dollarQuote = sql.slice(index).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/)?.[0];
    if (dollarQuote) {
      const end = sql.indexOf(dollarQuote, index + dollarQuote.length);
      const close = end === -1 ? sql.length : end + dollarQuote.length;
      text += sql.slice(index, close);
      index = close;
      continue;
    }
    if (character === ':' && sql[index - 1] !== ':' && /[A-Za-z]/.test(next ?? '')) {
      const match = sql.slice(index).match(/^:([A-Za-z][A-Za-z0-9_]*)\b/);
      if (match) {
        const [, name] = match;
        if (!Object.hasOwn(bindings, name)) throw new Error(`missing SQL binding: ${name}`);
        values.push(bindings[name]);
        text += `$${values.length}`;
        index += match[0].length;
        continue;
      }
    }
    text += character;
    index += 1;
  }
  return { text, values };
};
