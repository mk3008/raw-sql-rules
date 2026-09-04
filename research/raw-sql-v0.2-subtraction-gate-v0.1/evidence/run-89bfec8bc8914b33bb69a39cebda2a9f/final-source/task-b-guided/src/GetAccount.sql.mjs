export const getAccountSql = `
  WITH input AS (
    SELECT :accountId::uuid AS accountId
  )
  SELECT accounts.id, accounts.balance
  FROM accounts
  CROSS JOIN input
  WHERE accounts.id = input.accountId
`;

export function getAccountQuery({ accountId }) {
  return { text: getAccountSql.replace(":accountId", "$1"), values: [accountId] };
}
