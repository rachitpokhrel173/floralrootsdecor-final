-- Backfill invoice.amount_paid / status using the sum of ALL payments for
-- the invoice's booking (not just payments whose invoice_id happened to be
-- set). Existing invoices were computed with the old, narrower logic and
-- are undercounting advance payments recorded before the invoice existed.
-- This is a one-time correction; going forward the app keeps these in sync
-- itself via syncPaymentStatus() in src/actions/payment-actions.ts.

with booking_totals as (
  select booking_id, coalesce(sum(amount), 0) as total_received
  from payments
  group by booking_id
)
update invoices i
set
  amount_paid = bt.total_received,
  status = (case
    when bt.total_received <= 0 then
      case when i.status = 'cancelled' then 'cancelled' else 'sent' end
    when bt.total_received >= i.total then 'paid'
    else 'partial'
  end)::invoice_status
from booking_totals bt
where i.booking_id = bt.booking_id
  and i.amount_paid is distinct from bt.total_received;