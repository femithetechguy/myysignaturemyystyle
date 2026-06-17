-- Backfill customer_id, service_id, staff_id on appointments that were
-- inserted before the booking API was fixed to set FK columns.

-- Link customer_id via email stored in metadata
UPDATE appointments a
SET customer_id = c.id
FROM customers c
WHERE a.customer_id IS NULL
  AND c.email = a.metadata->>'customer_email';

-- Link service_id via service name stored in metadata
UPDATE appointments a
SET service_id = sv.id
FROM services sv
WHERE a.service_id IS NULL
  AND sv.name = a.metadata->>'service_name';

-- Link staff_id via staff name stored in metadata
UPDATE appointments a
SET staff_id = st.id
FROM staff st
WHERE a.staff_id IS NULL
  AND st.name = a.metadata->>'stylist_name';
