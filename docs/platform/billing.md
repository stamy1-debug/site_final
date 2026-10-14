# Billing lifecycle

## Acceptanță curentă — 11 octombrie 2026

Checkout-ul STARTER, plata inițială și abonamentul activ au fost confirmate în Stripe sandbox. Pe 11 octombrie au trecut și testele de anulare programată, plată eșuată, rambursare, replay idempotent și schimbare de plan în Customer Portal. Nu s-au procesat bani reali, iar Stripe live rămâne dezactivat.

Stripe owns card entry, recurring billing, invoices and the Customer Portal. The API accepts a database price UUID, checks the active plan/price server-side and binds the verified Supabase identity to one Stripe customer. No monthly/yearly amounts or paid feature mappings have been invented.

Checkout holds a per-user database lease and durably reserves a request generation before contacting Stripe. Retries reuse that idempotency key, including when Stripe succeeded but database response persistence failed. Existing open sessions are reused; an incompatible price or existing subscription requires the Portal. Uncertain requests beyond the provider idempotency window require manual reconciliation, not a new charge attempt.

## Webhooks

Subscribe the test endpoint `/api/v1/webhooks/stripe` to:
- `checkout.session.completed`
- `customer.subscription.created`, `.updated`, `.deleted`
- `invoice.paid`, `invoice.payment_failed`
- `charge.refunded`

The handler verifies the signature against unmodified bytes, rejects test/live mismatch, retrieves current Stripe objects, takes a customer lease, and calls one transactional SQL routine. The event ledger, subscription/payment state and outbox update atomically. Duplicates do not repeat effects; older subscription snapshots cannot replace newer ones. Financial mappings survive identity deletion with a null user reference; no further email is queued for an erased identity.

Access comes from current database state: active/trial subscriptions, unexpired periods and configured features. Unknown/past_due/unpaid/cancelled states fail closed. A success redirect never grants access. Cancellation scheduled at period end keeps active access until period end. Refunds are recorded; refunding an invoice does not by itself cancel a subscription in Stripe.

## Rezultate de acceptanță sandbox — 11 octombrie 2026

- **Plată eșuată:** o factură de test de 101 RON a primit `card_declined`; evenimentul real `invoice.payment_failed` a fost semnat de Stripe CLI și acceptat de endpointul local cu HTTP 200. Supabase a salvat plata `FAILED`, iar abonamentul a rămas `ACTIVE` cu anulare programată dezactivată. Mesajul `payment_failed` a intrat inițial în outbox; rândul de email de test a fost șters ulterior, deoarece trimiterea automată este intenționat dezactivată.
- **Anulare:** `cancel_at_period_end` a fost activat și apoi dezactivat din Stripe sandbox. Ambele evenimente `customer.subscription.updated` au fost acceptate; starea finală în Supabase este `ACTIVE`, `cancel_at_period_end=false`.
- **Rambursare:** plata sandbox existentă de 350 RON a fost rambursată integral. Stripe a confirmat refund-ul `succeeded`; evenimentul `charge.refunded` a fost acceptat, iar rândul de plată din Supabase a devenit `REFUNDED` cu 350 RON rambursați. Abonamentul a rămas activ, conform comportamentului Stripe.
- **Replay:** același event ID real pentru plata eșuată a fost retrimis de două ori către listenerul local cu semnătură validă; fiecare răspuns a fost HTTP 200 `duplicate`, fără rânduri sau efecte duplicate.
- **Customer Portal:** în configurația Stripe Sandbox sunt permise cele patru prețuri lunare aprobate (Elevul independent 152 RON, Starter 350 RON, Pro 530 RON, Elite 584 RON). Schimbările de cantitate sunt dezactivate; upgrade-ul nu aplică proration/credit și se facturează la următorul ciclu; downgrade-ul și schimbarea la un interval mai lung se amână până la finalul perioadei; trial-urile nu se încheie automat. Schimbarea abonamentului de test Starter → Pro a reușit; Stripe a afișat 530 RON/lună de la 3 noiembrie 2026 și nicio sumă datorată imediat. Abonamentul Stripe are acum prețul Pro. Evenimentul real `evt_1UPMW6Aej18YJ6L8TLnTs4ON` (`customer.subscription.updated`) a fost creat de Portal.
- **Redelivery nativ:** evenimentul `evt_1UPMW6Aej18YJ6L8TLnTs4ON` a fost retrimis din Stripe Sandbox către un endpoint temporar HTTPS. Stripe a înregistrat livrarea `Recovered`, HTTP 200, iar aplicația a răspuns `{"status":"processed"}`. Supabase conține acum evenimentul în `subscription_events`, iar abonamentul `sub_1UMPYWAej18YJ6L8jOITiUiH` este `ACTIVE`, plan `PRO`, cu perioada curentă până la 3 noiembrie 2026. Endpointul și tunelul temporar au fost închise după test; webhookul permanent pentru hosting rămâne de configurat la deployment.
- **Curățare sandbox:** factura eșuată a fost anulată după test, metodele de plată create numai pentru test au fost detașate, facturile de 0 RON și mesajele lor de outbox au fost eliminate. Soldul Stripe a fost readus la 0 RON. Rândul de plată `FAILED` și registrul evenimentelor au fost păstrate ca dovadă.

Replay-ul semnat confirmă idempotency-ul aplicației, iar redelivery-ul nativ confirmă livrarea prin Stripe Dashboard și sincronizarea planului în Supabase. Endpointul folosit pentru test a fost temporar și este șters; configurează endpointul permanent după ce există hosting HTTPS. Catalogul are doar prețuri lunare aprobate; nu au fost furnizate prețuri anuale.

Consimțământul analytics era retras pentru cont la testul financiar. Prin urmare nu s-a produs conversie PostHog pentru evenimentele de billing; funnel-ul checkout–abonament trebuie validat ulterior cu acord analytics activ.

Coupon tables exist but coupons and redemption orchestration are not enabled. Configure business rules and trusted Stripe promotion mappings before activating them. Referral reward fulfillment is likewise pending business rules.

For uncertain checkout/outbox delivery, inspect the stored request/dedupe ID against Stripe/Resend provider records before retrying. Never clear an unresolved reservation merely to bypass a conflict.
