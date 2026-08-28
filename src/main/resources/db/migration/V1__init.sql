-- Create production stages
CREATE TABLE production_stages (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  sort_order INT
);

-- Lots
CREATE TABLE lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_number VARCHAR(200) NOT NULL UNIQUE,
  brand VARCHAR(200),
  original_quantity INT,
  current_quantity INT,
  fabricator VARCHAR(200),
  source_roll_number VARCHAR(255),
  roll_length double precision,
  size_ratios TEXT,
  size_quantities TEXT,
  fit_type VARCHAR(255),
  washer VARCHAR(255),
  finisher VARCHAR(255),
  current_stage_id BIGINT REFERENCES production_stages(id),
  created_at timestamptz,
  created_by VARCHAR(200),
  updated_at timestamptz,
  updated_by VARCHAR(200)
);

-- History
CREATE TABLE lot_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid NOT NULL REFERENCES lots(id),
  from_stage_id BIGINT REFERENCES production_stages(id),
  to_stage_id BIGINT NOT NULL REFERENCES production_stages(id),
  quantity INT,
  notes TEXT,
  changed_by VARCHAR(200),
  changed_at timestamptz
);

-- Seed initial stages
INSERT INTO production_stages (name, sort_order) VALUES
('RECEIVED', 0),
('CUTTING', 1),
('STITCHING', 2),
('WASHING', 3),
('FINISHING', 4),
('PACKING', 5),
('COMPLETED', 6),
('DISPATCHED', 7)
ON CONFLICT DO NOTHING;

-- Add tenant_id to important tables (for new installations; for existing DB run ALTER TABLE)
ALTER TABLE IF EXISTS lots ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(200) NOT NULL DEFAULT 'default_tenant';
ALTER TABLE IF EXISTS lot_stage_history ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(200) NOT NULL DEFAULT 'default_tenant';

-- Rolls table
CREATE TABLE IF NOT EXISTS rolls (
  id BIGSERIAL PRIMARY KEY,
  roll_number varchar(255) UNIQUE NOT NULL,
  fabric varchar(255),
  length double precision,
  tenant_id varchar(255) NOT NULL DEFAULT 'default_tenant'
);
