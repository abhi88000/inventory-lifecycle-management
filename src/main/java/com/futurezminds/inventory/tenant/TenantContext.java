package com.futurezminds.inventory.tenant;

// Request-scoped tenant storage using ThreadLocal.
// Set by TenantFilter at the start of each request, cleared after.
// When auth is added, tenant should be derived from the authenticated principal instead of a header.
public class TenantContext {
    private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();

    public static void setTenantId(String tenantId) {
        currentTenant.set(tenantId);
    }

    public static String getTenantId() {
        return currentTenant.get();
    }

    public static void clear() {
        currentTenant.remove();
    }
}
