package com.futurezminds.inventory.tenant;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class TenantFilter extends OncePerRequestFilter {

    private final JdbcTemplate jdbcTemplate;

    public TenantFilter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // Allow CORS preflight through without tenant check
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String tenant = request.getHeader("X-Tenant-ID");
        if (tenant == null || tenant.isBlank()) {
            tenant = "demo";
        }

        try {
            TenantContext.setTenantId(tenant);
            // set PostgreSQL session config (used by RLS policies)
            try {
                String safe = tenant.replace("'","''");
                jdbcTemplate.execute("SELECT set_config('app.tenant', '" + safe + "', false)");
            } catch (Exception e) {
                // ignore for non-Postgres (H2/demo)
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
