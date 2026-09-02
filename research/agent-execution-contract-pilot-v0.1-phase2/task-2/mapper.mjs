export function toResponse(account) {
  return {
    id: account.id,
    status: account.status.toLowerCase(),
  };
}
