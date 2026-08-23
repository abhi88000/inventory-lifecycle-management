-- Seed sample lots and history for demo
INSERT INTO lots (id, lot_number, brand, original_quantity, current_quantity, fabricator, current_stage_id, created_at, created_by)
VALUES
  (gen_random_uuid(), 'A-100', 'ZARA', 120, 120, 'MADAM', (SELECT id FROM production_stages WHERE name='CUTTING' LIMIT 1), now(), 'system'),
  (gen_random_uuid(), 'A-101', 'LEVIS', 200, 200, 'RAGHAV', (SELECT id FROM production_stages WHERE name='STITCHING' LIMIT 1), now(), 'system')
ON CONFLICT DO NOTHING;

-- Add initial history entries
INSERT INTO lot_stage_history (id, lot_id, from_stage_id, to_stage_id, quantity, notes, changed_by, changed_at)
SELECT gen_random_uuid(), l.id, NULL, s.id, l.original_quantity, 'Initial create', 'system', now()
FROM lots l JOIN production_stages s ON s.id = l.current_stage_id
WHERE l.lot_number IN ('A-100','A-101')
ON CONFLICT DO NOTHING;
