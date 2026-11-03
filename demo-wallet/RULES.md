# Business rules

These are the rules a team would type into the Canary room. Each one is one sentence that must always be true. The API enforces them in code, and Canary's job is to catch any pull request that breaks one.

| # | Rule | Where it is enforced |
|---|---|---|
| 1 | A wallet balance can never go below $0. | Withdrawals and charges lock the customer row, then check the balance. |
| 2 | A promo code works once per customer. | Charges lock the promo code row, then check earlier redemptions. |
| 3 | A refund can never be more than the original charge. | Refunds lock the charge row, then check the total already refunded. |
| 4 | Stock can never go below zero. | Charges lock the product row, then check stock. |

All four rules must also hold when many requests arrive at the same moment. Those race conditions are what Canary's Red agent attacks first, and what `test/rules.test.ts` checks.

The database has no CHECK constraints for these rules on purpose. This app is a target: if a pull request removes a check from the code, the rule must really break, so that Canary has something to catch.
