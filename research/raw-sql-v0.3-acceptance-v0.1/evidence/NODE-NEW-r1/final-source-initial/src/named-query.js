// Converts the authoritative named SQL notation to node-postgres's positional
// protocol at the driver boundary. Binding order is derived from the SQL.
export const lowerNamedQuery = (text, bindings) => {
  const values = [];
  const loweredText = text.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, (match, name) => {
    if (!Object.hasOwn(bindings, name)) {
      throw new Error(`Missing SQL binding: ${name}`);
    }
    values.push(bindings[name]);
    return `$${values.length}`;
  });
  return { text: loweredText, values };
};
