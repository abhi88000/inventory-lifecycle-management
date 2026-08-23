-- Enable Row Level Security and create tenant isolation policies

-- Enable RLS on important tables
ALTER TABLE IF EXISTS lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lot_stage_history ENABLE ROW LEVEL SECURITY;

-- Policy: only allow rows where tenant_id matches the session setting 'app.tenant'
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_lots') THEN
        CREATE POLICY tenant_isolation_lots ON lots USING (tenant_id = current_setting('app.tenant'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_history') THEN
        CREATE POLICY tenant_isolation_history ON lot_stage_history USING (tenant_id = current_setting('app.tenant'));
    END IF;
END$$;

-- Note: `current_setting('app.tenant')` must be set per session by application (see TenantFilter)
