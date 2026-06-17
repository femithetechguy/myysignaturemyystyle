-- Update service prices
-- Edit price_min and price_max values below, then run against your Neon DB:
--   psql $DATABASE_URL -f dbquries/update_prices.sql

UPDATE services SET
  price_min = new_prices.price_min,
  price_max = new_prices.price_max
FROM (VALUES
  -- Hair Cut
  ('cut_001',   30.00,  65.00),  -- Hair Trim
  ('cut_002',   30.00,  65.00),  -- Bang / Edge Trim
  ('cut_003',   30.00,  65.00),  -- Adult Haircut
  ('cut_004',   20.00,  30.00),  -- Kids Haircut
  ('cut_005',   15.00,  45.00),  -- Military Haircut
  ('cut_006',   45.00,  65.00),  -- Fade (unchanged)

  -- Chemical Service
  ('chem_001',  95.00, 125.00),  -- Relaxer / Texturizer
  ('chem_002', 120.00, 250.00),  -- Perm
  ('chem_003',  95.00, 145.00),  -- Grey Coverage
  ('chem_004',  95.00,  95.00),  -- Root Touchup
  -- chem_005, chem_006, chem_007 handled separately below (consultation pricing)

  -- Hair Treatment
  ('treat_001', 35.00,  55.00),  -- Deep Conditioning Treatment
  ('treat_002', 35.00,  60.00),  -- Protein Treatment
  ('treat_003', 30.00,  50.00),  -- Oil Treatment
  ('treat_004', 40.00,  65.00),  -- Scalp Treatment
  ('treat_005', 50.00,  85.00),  -- Olaplex / Bond Repair Treatment
  ('treat_006', 50.00,  80.00),  -- Dr C Tuna Hair Treatment

  -- Extensions
  ('ext_001',  175.00, 260.00),  -- Sew-In
  ('ext_002',  200.00, 350.00),  -- Microlinks
  ('ext_003',  150.00, 250.00),  -- Tape In
  ('ext_004',   80.00, 150.00),  -- Wig Installation
  ('ext_005',   75.00, 130.00),  -- Up Do
  ('ext_006',  150.00, 220.00),  -- Pixie Natural Hair / Sew-In
  ('ext_007',   60.00, 100.00),  -- Weave Maintenance
  ('ext_008',   40.00,  75.00),  -- Weave Take Down

  -- Braids
  ('braid_001',  75.00, 280.00), -- Feeding / Fulani / Lemonade Braids
  ('braid_002', 180.00, 350.00), -- Senegalese Twist
  ('braid_003',  95.00, 175.00), -- Crochet
  ('braid_004',  65.00, 200.00), -- Braids Maintenance
  ('braid_005',  45.00, 100.00), -- Braids Take Down

  -- Locs
  ('locs_001',  100.00, 180.00), -- Starter Locs
  ('locs_002',   80.00, 160.00), -- Retwist / Interloc / Styles
  ('locs_003',   65.00, 130.00), -- Loc Maintenance

  -- Natural Hair Styles
  ('nat_001',   75.00, 130.00),  -- Silk Press
  ('nat_002',   80.00, 140.00),  -- Two Strands Twist
  ('nat_003',   65.00, 110.00),  -- Flat Twist
  ('nat_004',   60.00, 100.00),  -- Wash and Go
  ('nat_005',   65.00, 110.00),  -- Wash and Set

  -- Bridal
  ('bridal_001', 100.00, 200.00), -- Bridal Trial
  ('bridal_002', 150.00, 300.00), -- Wedding Day Style

  -- Add On
  ('addon_001',  30.00,  55.00),  -- Shampoo / Hydrate and Trim
  ('addon_002',  25.00,  45.00)   -- Scalp Stimulator

) AS new_prices(service_id, price_min, price_max)
WHERE services.service_id = new_prices.service_id;

-- Consultation-only services (price displayed as "Consultation" on the site)
UPDATE services SET price_min = NULL, price_max = NULL
WHERE service_id IN ('chem_005', 'chem_006', 'chem_007');
-- chem_005 = Single Process Color
-- chem_006 = Double Process Color
-- chem_007 = Partial / Full Highlight
