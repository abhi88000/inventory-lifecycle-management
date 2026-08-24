-- Seed demo tenant data for production Postgres
INSERT INTO rolls (roll_number, fabric, length, tenant_id)
VALUES
  ('R-001', 'Denim', 102.5, 'demo'),
  ('R-002', 'Cotton', 118.0, 'demo'),
  ('R-003', 'Stretch', 129.5, 'demo'),
  ('R-004', 'Washed Denim', 137.0, 'demo'),
  ('R-005', 'Polyester', 144.5, 'demo'),
  ('R-006', 'Denim', 151.0, 'demo'),
  ('R-007', 'Cotton', 168.0, 'demo'),
  ('R-008', 'Stretch', 177.5, 'demo')
ON CONFLICT (roll_number) DO NOTHING;

INSERT INTO lots (
  id, lot_number, brand, original_quantity, current_quantity, fabricator,
  tenant_id, source_roll_number, roll_length, fit_type,
  size_ratios, size_quantities, current_stage_id, created_at, created_by
)
VALUES
  (gen_random_uuid(), 'LOT-ST-001', 'FutureZ', 180, 180, 'Fabricator 1', 'demo', 'R-001', 120.0, 'Regular', '{"30":1,"32":2,"34":2,"36":1}', '{"30":40,"32":80,"34":80,"36":40}', (SELECT id FROM production_stages WHERE name = 'STITCHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-ST-002', 'BluePeak', 205, 205, 'Fabricator 2', 'demo', 'R-002', 130.0, 'Slim', '{"30":1,"32":2,"34":2,"36":1}', '{"30":40,"32":80,"34":80,"36":40}', (SELECT id FROM production_stages WHERE name = 'STITCHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-ST-003', 'UrbanThread', 230, 230, 'Fabricator 3', 'demo', 'R-003', 140.0, 'Regular', '{"30":1,"32":2,"34":2,"36":1}', '{"30":40,"32":80,"34":80,"36":40}', (SELECT id FROM production_stages WHERE name = 'STITCHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-ST-004', 'Northline', 255, 255, 'Fabricator 1', 'demo', 'R-004', 150.0, 'Slim', '{"30":1,"32":2,"34":2,"36":1}', '{"30":40,"32":80,"34":80,"36":40}', (SELECT id FROM production_stages WHERE name = 'STITCHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-ST-005', 'DenimWorks', 280, 280, 'Fabricator 2', 'demo', 'R-005', 160.0, 'Regular', '{"30":1,"32":2,"34":2,"36":1}', '{"30":40,"32":80,"34":80,"36":40}', (SELECT id FROM production_stages WHERE name = 'STITCHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-001', 'FutureZ', 220, 220, 'Fabricator 1', 'demo', 'R-001', 140.0, 'Regular', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-002', 'BluePeak', 235, 235, 'Fabricator 2', 'demo', 'R-002', 148.0, 'Regular', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-003', 'UrbanThread', 250, 250, 'Fabricator 3', 'demo', 'R-003', 156.0, 'Relaxed', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-004', 'Northline', 265, 265, 'Fabricator 1', 'demo', 'R-004', 164.0, 'Regular', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-005', 'DenimWorks', 280, 280, 'Fabricator 2', 'demo', 'R-005', 172.0, 'Regular', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-006', 'FutureZ', 295, 295, 'Fabricator 3', 'demo', 'R-006', 180.0, 'Relaxed', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-007', 'BluePeak', 310, 310, 'Fabricator 1', 'demo', 'R-007', 188.0, 'Regular', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-008', 'UrbanThread', 325, 325, 'Fabricator 2', 'demo', 'R-008', 196.0, 'Regular', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-009', 'Northline', 340, 340, 'Fabricator 3', 'demo', 'R-001', 204.0, 'Relaxed', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-010', 'DenimWorks', 355, 355, 'Fabricator 1', 'demo', 'R-002', 212.0, 'Regular', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-011', 'FutureZ', 370, 370, 'Fabricator 2', 'demo', 'R-003', 220.0, 'Regular', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-012', 'BluePeak', 385, 385, 'Fabricator 3', 'demo', 'R-004', 228.0, 'Relaxed', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-013', 'UrbanThread', 400, 400, 'Fabricator 1', 'demo', 'R-005', 236.0, 'Regular', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-014', 'Northline', 415, 415, 'Fabricator 2', 'demo', 'R-006', 244.0, 'Regular', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-015', 'DenimWorks', 430, 430, 'Fabricator 3', 'demo', 'R-007', 252.0, 'Relaxed', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-016', 'FutureZ', 445, 445, 'Fabricator 1', 'demo', 'R-008', 260.0, 'Regular', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-017', 'BluePeak', 460, 460, 'Fabricator 2', 'demo', 'R-001', 268.0, 'Regular', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-018', 'UrbanThread', 475, 475, 'Fabricator 3', 'demo', 'R-002', 276.0, 'Relaxed', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-019', 'Northline', 490, 490, 'Fabricator 1', 'demo', 'R-003', 284.0, 'Regular', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder'),
  (gen_random_uuid(), 'LOT-WA-020', 'DenimWorks', 505, 505, 'Fabricator 2', 'demo', 'R-004', 292.0, 'Regular', '{"30":2,"32":3,"34":3,"36":2}', '{"30":60,"32":90,"34":90,"36":60}', (SELECT id FROM production_stages WHERE name = 'WASHING' LIMIT 1), NOW(), 'demo-seeder')
ON CONFLICT (lot_number) DO NOTHING;

INSERT INTO lot_stage_history (id, lot_id, from_stage_id, to_stage_id, quantity, notes, changed_by, changed_at, tenant_id)
SELECT gen_random_uuid(), l.id, NULL, l.current_stage_id, l.original_quantity, 'Initial load', 'demo-seeder', NOW(), l.tenant_id
FROM lots l
WHERE l.lot_number IN ('LOT-ST-001', 'LOT-ST-002', 'LOT-ST-003', 'LOT-ST-004', 'LOT-ST-005', 'LOT-WA-001', 'LOT-WA-002', 'LOT-WA-003', 'LOT-WA-004', 'LOT-WA-005', 'LOT-WA-006', 'LOT-WA-007', 'LOT-WA-008', 'LOT-WA-009', 'LOT-WA-010', 'LOT-WA-011', 'LOT-WA-012', 'LOT-WA-013', 'LOT-WA-014', 'LOT-WA-015', 'LOT-WA-016', 'LOT-WA-017', 'LOT-WA-018', 'LOT-WA-019', 'LOT-WA-020')
ON CONFLICT DO NOTHING;
