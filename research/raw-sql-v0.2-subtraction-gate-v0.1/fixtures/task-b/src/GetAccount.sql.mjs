export const getAccountSql = `
  WITH input AS (
    SELECT $1::uuid AS accountId
  )
  SELECT accounts.id, accounts.balance
  FROM accounts
  CROSS JOIN input
  WHERE accounts.id = input.accountId
`;
