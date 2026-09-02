-- Serializes attempts sharing a request ID, including attempts for different items.
SELECT pg_advisory_xact_lock(hashtextextended(CAST(:request_id AS text), 0));
