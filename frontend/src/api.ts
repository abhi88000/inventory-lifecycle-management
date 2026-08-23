const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8081/api'
function tenantHeader() {
  const t = localStorage.getItem('tenant') || 'default_tenant'
  return { 'X-Tenant-ID': t }
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

export async function fetchRolls(){
  const res = await fetch(`${API_BASE}/rolls`, { headers: tenantHeader() })
  if (!res.ok) throw new Error('Failed to fetch rolls')
  return res.json()
}

export async function createRoll(payload:any){
  const res = await fetch(`${API_BASE}/rolls`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...tenantHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Failed to create roll')
  return res.json()
}
