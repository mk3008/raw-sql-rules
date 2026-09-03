function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
export async function runPipeline(input) {
  await wait(4000); await wait(4000); await wait(4000);
  const normalized = { ...input, completed: Boolean(input.completed) };
  const audited = { ...normalized, audit: 'recorded' };
  return { id: audited.id, status: audited.completed ? 'complete' : 'pending' };
}
