// Converts the authoritative named SQL notation to node-postgres's positional
// protocol at the driver boundary. Binding order is derived from the SQL.
export const lowerNamedQuery = (text, bindings) => {
  const values = [];
  let loweredText = '';
  let index = 0;
  let state = 'code';

  while (index < text.length) {
    const character = text[index];
    const next = text[index + 1];

    if (state === 'code') {
      if (character === "'") state = 'string';
      else if (character === '-' && next === '-') state = 'line-comment';
      else if (character === '/' && next === '*') state = 'block-comment';
      else if (character === ':' && text[index - 1] !== ':' && /[A-Za-z_]/.test(next ?? '')) {
        const match = /^:([A-Za-z_][A-Za-z0-9_]*)/.exec(text.slice(index));
        const name = match[1];
        if (!Object.hasOwn(bindings, name)) throw new Error(`Missing SQL binding: ${name}`);
        values.push(bindings[name]);
        loweredText += `$${values.length}`;
        index += match[0].length;
        continue;
      }
    } else if (state === 'string' && character === "'") {
      if (next === "'") {
        loweredText += "''";
        index += 2;
        continue;
      }
      state = 'code';
    } else if (state === 'line-comment' && character === '\n') {
      state = 'code';
    } else if (state === 'block-comment' && character === '*' && next === '/') {
      loweredText += '*/';
      index += 2;
      state = 'code';
      continue;
    }

    loweredText += character;
    index += 1;
  }

  return { text: loweredText, values };
};
