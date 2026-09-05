# Existing evidence synthesis

## Q1–Q4 and Q9–Q11

The existing record supports the following bounded answers.

1. Contract 1 is a durable selected-representation boundary; it is not evidence
   that Raw SQL beats other approaches or that all architecture layers are
   forbidden.
2. Contract 2 is an application-ownership boundary. The listed operational
   concerns are Scope-like exclusions from Rules ownership, expressed as a
   durable Contract to prevent framework ownership creep.
3. Contract 3 prohibits runtime input from supplying arbitrary SQL syntax. It
   does not prohibit finite, application-controlled, reviewed structural
   variation.
4. The author's four Default Requirements were feasible in bounded Npgsql and
   node-postgres/PostgreSQL probes; no universality claim follows.
5. The current Scope, Contracts, and Requirements have no direct textual
   contradiction. A known wording risk is reading Contract 1 as a blanket
   architecture prescription despite Contract 2 reserving architecture to the
   application.
6. The text analysis finds no basis to claim a Contract 3 effect on Terra;
   that requires a new isolated comparison.

## Evidence limits

Prior no-separation and subtraction studies cannot answer whether Contract 3
changes unsafe finals, self-repair, or over-blocking because their arms did not
hold all candidate-visible material constant except Contract 3.
