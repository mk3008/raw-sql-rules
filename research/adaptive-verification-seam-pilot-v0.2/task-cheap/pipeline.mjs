export function runPipeline(input) {
  const normalized = { ...input, quantity: Number(input.quantity) };
  const checked = { ...normalized, quantity: Math.max(0, normalized.quantity) };
  return { sku: checked.sku, status: checked.quantity >= 0 ? 'available' : 'sold-out' };
}
