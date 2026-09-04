// API client for all backend calls.
// Automatically includes X-Tenant-ID header from localStorage (defaults to "demo").
// Base URL: same-origin /api in production, localhost:8081/api in local dev.

const API_BASE = import.meta.env.VITE_API_BASE || (
  typeof window !== 'undefined'
    ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8081/api'
        : `${window.location.origin}/api`)
    : 'http://localhost:8081/api'
)

function tenantHeader() {
  const t = getTenant()
  return { 'X-Tenant-ID': t }
}

export function setTenant(t: string) {
  const value = (t || 'demo').trim() || 'demo'
  localStorage.setItem('tenant', value)
}

export function getTenant() {
  const saved = localStorage.getItem('tenant')
  const value = (saved || 'demo').trim() || 'demo'
  if (!saved) localStorage.setItem('tenant', value)
  return value
}

export async function fetchLots() {
  const res = await fetch(`${API_BASE}/lots`, { headers: tenantHeader() })
  if (!res.ok) throw new Error('Failed to fetch lots')
  return res.json()
}

export async function searchLots(q: string) {
  const res = await fetch(`${API_BASE}/lots/search?q=${encodeURIComponent(q)}`, { headers: tenantHeader() })
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

export async function createLot(payload: any) {
  const res = await fetch(`${API_BASE}/lots`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...tenantHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Create lot failed')
  return res.json()
}

export async function moveLot(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/lots/${id}/move`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...tenantHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Move lot failed')
  return res.json()
}

export async function fetchHistory(id: string) {
  const res = await fetch(`${API_BASE}/lots/${id}/history`, { headers: tenantHeader() })
  if (!res.ok) throw new Error('Failed to fetch history')
  return res.json()
}

export async function fetchStageHistory(stageName: string) {
  const res = await fetch(`${API_BASE}/lots/history/stage/${stageName}`, { headers: tenantHeader() })
  if (!res.ok) throw new Error('Failed to fetch stage history')
  return res.json()
}

export async function fetchRolls(){
  const res = await fetch(`${API_BASE}/rolls`, { headers: tenantHeader() })
  if (!res.ok) throw new Error('Failed to fetch rolls')
  return res.json()
}

export async function createRoll(payload:any){
  const res = await fetch(`${API_BASE}/rolls`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...tenantHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) { const t = await res.text().catch(()=>''); throw new Error(t || 'Failed to create roll') }
  return res.json()
}

