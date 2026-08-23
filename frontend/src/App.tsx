import React, { useEffect, useMemo, useState } from 'react'
import { fetchLots, createLot, moveLot, fetchHistory, fetchRolls, createRoll } from './api'

type Lot = any

const STAGE_ORDER = ['RECEIVED','CUTTING','STITCHING','WASHING','FINISHING','PACKING','COMPLETED','DISPATCHED']

export default function App(){
  const [tenant, setTenant] = useState<string>(localStorage.getItem('tenant')||'default_tenant')
  const [lots, setLots] = useState<Lot[]>([])
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [rolls, setRolls] = useState<any[]>([])

  useEffect(()=>{ load() }, [])
  useEffect(()=>{ async function l(){ try{ const r = await fetchRolls(); setRolls(r) }catch(e){ console.warn(e) } } l() },[])
  
  async function handleCreateRoll(e:any){
    e.preventDefault()
    const form = new FormData(e.target)
    const payload = { rollNumber: form.get('rollNumber'), fabric: form.get('fabric'), length: Number(form.get('length')||0) }
    try{ await createRoll(payload); const r = await fetchRolls(); setRolls(r) }catch(err:any){ console.error(err); setError(String(err)) }
  }
  useEffect(()=>{ localStorage.setItem('tenant', tenant) }, [tenant])
  async function load(){
    setError(null)
    setLoading(true)
    try{ const data = await fetchLots(); setLots(data) }catch(e:any){ console.error(e); setError(String(e)) }finally{ setLoading(false) }
  }

  async function handleSearch(q:string){
    try{
      if(!q) return await load()
      const { searchLots } = await import('./api')
      const res = await searchLots(q)
      setLots(res)
    }catch(e:any){ console.error(e); setError(String(e)) }
  }

  const stageStats = useMemo(()=>{
    const map: Record<string,{count:number,pcs:number}> = {}
    for(const s of STAGE_ORDER) map[s]={count:0,pcs:0}
    for(const l of lots){
      const name = l.currentStage?.name || 'RECEIVED'
      map[name].count += 1
      map[name].pcs += (l.currentQuantity||0)
    }
    return map
  },[lots])

  async function openLot(lot: Lot){
    setSelectedLot(lot)
    setError(null)
    try{ const h = await fetchHistory(lot.id); setHistory(h) }catch(e:any){ console.error(e); setHistory([]); setError(String(e)) }
  }

  async function handleMove(targetStage: string, qty: number, notes?: string){
    if(!selectedLot) return
    setError(null)
    try{
      await moveLot(selectedLot.id, { toStage: targetStage, quantity: qty, notes })
      await load()
      await openLot(await refreshSelected(selectedLot.id))
      setMoveModalOpen(false)
    }catch(e:any){ console.error(e); setError(String(e)) }
  }

  async function refreshSelected(id:string){
    const all = await fetchLots()
    setLots(all)
    return all.find((x:any)=>x.id===id)
  }

  async function handleCreate(e:any){
    e.preventDefault()
    const form = new FormData(e.target)
    const ratios = {
      "30": Number(form.get('ratio_30')||0),
      "32": Number(form.get('ratio_32')||0),
      "34": Number(form.get('ratio_34')||0),
      "36": Number(form.get('ratio_36')||0),
    }
    const payload = { lotNumber: form.get('lotNumber'), brand: form.get('brand'), pcs: Number(form.get('pcs')||0), fabricator: form.get('fabricator'), initialStage: form.get('initialStage'), sourceRollNumber: form.get('sourceRollNumber'), fitType: form.get('fitType'), sizeRatiosJson: JSON.stringify(ratios) }
    try{ setCreating(true); await createLot(payload); await load(); setCreating(false) }catch(err:any){ console.error(err); setError(String(err)); setCreating(false) }
  }

  return (
    <div className="app container-fluid p-0">
      <header className="header bg-primary text-white p-3">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Production Dashboard</h3>
          <div className="d-flex align-items-center gap-2">
            <input className="form-control d-none d-lg-block" placeholder="Search lot, brand, fabricator" value={query} onChange={e=>setQuery(e.target.value)} style={{width:360}} />
            <button className="btn btn-light" onClick={()=>handleSearch(query)}>Search</button>
            <button className="btn btn-dark" onClick={()=>load()}>Refresh</button>
            <input className="form-control" value={tenant} onChange={e=>setTenant(e.target.value)} style={{width:160}} />
            <div style={{fontSize:12,color:'#e9ecef'}}>tenant</div>
            <a className="btn btn-outline-light ms-2" href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </header>

      <main className="row m-0">
        <div className="col-md-9 p-3">
          <section className="stages mb-3">
            <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:6}}>
              {STAGE_ORDER.map(s=> (
                <div key={s} style={{minWidth:150,flex:'0 0 auto'}}>
                  <div className={`card ${selectedStage===s? 'border-primary':''}`} style={{minHeight:120,cursor:'pointer'}} onClick={()=>{ setSelectedStage(s); setSelectedLot(null) }}>
                    <div className="card-body">
                      <h6 className="card-title">{s}</h6>
                      <p className="card-text mb-0">{stageStats[s].count} lots</p>
                      <p className="card-text"><small className="text-muted">{stageStats[s].pcs} pcs</small></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-3">
            {loading && <div>Loading…</div>}
            {error && <div className="alert alert-danger d-flex justify-content-between align-items-center"><div>{String(error)}</div><div><button className="btn btn-sm btn-light" onClick={()=>{ setError(null); load() }}>Retry</button></div></div>}
            {!loading && !selectedStage && <div>Select a stage to view lots</div>}
            {!loading && selectedStage && (
              <div>
                <h2>{selectedStage}</h2>
                <div className="list-group">
                  {lots.filter(l=> (l.currentStage?.name||'RECEIVED')===selectedStage).map(l=> (
                    <button key={l.id} className="list-group-item list-group-item-action" onClick={()=>openLot(l)}>
                      <div className="d-flex justify-content-between">
                        <div>{l.lotNumber} <div className="text-muted small">{l.brand}</div></div>
                        <div className="fw-bold">{l.currentQuantity} pcs</div>
                      </div>
                    </button>
                  ))}
                  {lots.filter(l=> (l.currentStage?.name||'RECEIVED')===selectedStage).length===0 && <div className="p-4 text-muted">No lots at this stage</div>}
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="col-md-3 p-3">
          <div className="card p-3">
            <h5>Create Roll (for Cutting)</h5>
            <form onSubmit={handleCreateRoll} className="mb-3">
              <input className="form-control mb-2" name="rollNumber" placeholder="Roll Number (R-001)" required />
              <input className="form-control mb-2" name="fabric" placeholder="Fabric" />
              <input className="form-control mb-2" name="length" placeholder="Length (meters)" type="number" step="0.1" defaultValue={100} />
              <button className="btn btn-secondary mb-2" type="submit">Create Roll</button>
            </form>

            <h5>Create Lot</h5>
            <form onSubmit={handleCreate}>
              <input className="form-control mb-2" name="lotNumber" placeholder="Lot Number" required />
              <select className="form-select mb-2" name="sourceRollNumber">
                <option value="">Select roll (optional)</option>
                {rolls.map(r=> <option key={r.id} value={r.rollNumber}>{r.rollNumber} • {r.fabric} • {r.length}m</option>)}
              </select>
              <input className="form-control mb-2" name="brand" placeholder="Brand" />
              <input className="form-control mb-2" name="pcs" placeholder="PCS" type="number" defaultValue={120} />
              <input className="form-control mb-2" name="fabricator" placeholder="Fabricator" />
              <input className="form-control mb-2" name="fitType" placeholder="Fit Type (Slim/Regular)" />
              <div className="mb-2">
                <label className="form-label">Size Ratios (30/32/34/36)</label>
                <div className="d-flex gap-2">
                  <input className="form-control" name="ratio_30" placeholder="30 ratio" defaultValue={1} />
                  <input className="form-control" name="ratio_32" placeholder="32 ratio" defaultValue={2} />
                  <input className="form-control" name="ratio_34" placeholder="34 ratio" defaultValue={1} />
                  <input className="form-control" name="ratio_36" placeholder="36 ratio" defaultValue={1} />
                </div>
              </div>
              <select className="form-select mb-2" name="initialStage">
                {STAGE_ORDER.map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="btn btn-primary" type="submit" disabled={creating}>{creating? 'Creating...':'Create Lot'}</button>
            </form>
          </div>

          {selectedLot && (
            <div className="card mt-3 p-2">
              <h5 className="mb-1">{selectedLot.lotNumber}</h5>
              <div className="small text-muted">Brand: {selectedLot.brand}</div>
              <div className="small">PCS: {selectedLot.currentQuantity}</div>
              <div className="small">Fabricator: {selectedLot.fabricator}</div>
              <hr />
              <div className="d-flex gap-2 mb-2">
                <button className="btn btn-sm btn-outline-primary" onClick={()=>setMoveModalOpen(true)}>Move</button>
                <button className="btn btn-sm btn-outline-secondary" onClick={async ()=>{ await openLot(selectedLot); }}>Refresh</button>
              </div>
              <h6 className="mt-2">History</h6>
              <ul className="small">
                {history.map((h:any)=> (
                  <li key={h.id}>{new Date(h.changedAt).toLocaleString()} • {h.fromStage?.name || '-'} → {h.toStage?.name} • {h.quantity} PCS</li>
                ))}
              </ul>
            </div>
          )}
        </aside>
        {moveModalOpen && selectedLot && (
          <MoveModal lot={selectedLot} onClose={()=>setMoveModalOpen(false)} onConfirm={handleMove} />
        )}
      </main>
    </div>
  )
}

function MoveForm({ current, onMove}:{ current?:string | null, onMove: (to:string, qty:number)=>void }){
  const [to, setTo] = useState('')
  const [qty, setQty] = useState(0)
  return (
    <form onSubmit={(e)=>{ e.preventDefault(); onMove(to, qty) }}>
      <label>To Stage</label>
      <select value={to} onChange={e=>setTo(e.target.value)} required>
        <option value="">Select</option>
        {['CUTTING','STITCHING','WASHING','FINISHING','PACKING','COMPLETED','DISPATCHED'].map(s=> <option key={s} value={s}>{s}</option>)}
      </select>
      <label>Quantity</label>
      <input type="number" value={qty} onChange={e=>setQty(Number(e.target.value))} min={0} />
      <button type="submit">Move</button>
    </form>
  )
}

function MoveModal({ lot, onClose, onConfirm }:{ lot:any, onClose:()=>void, onConfirm:(to:string, qty:number, notes?:string)=>void }){
  const [to, setTo] = useState('')
  const [qty, setQty] = useState(lot.currentQuantity || 0)
  const [notes, setNotes] = useState('')
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Move {lot.lotNumber}</h3>
        <div>Current stage: {lot.currentStage?.name || 'RECEIVED'}</div>
        <label>To Stage</label>
        <select value={to} onChange={e=>setTo(e.target.value)}>
          <option value="">Select</option>
          {['CUTTING','STITCHING','WASHING','FINISHING','PACKING','COMPLETED','DISPATCHED'].map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <label>Quantity</label>
        <input type="number" value={qty} onChange={e=>setQty(Number(e.target.value))} />
        <label>Notes (optional)</label>
        <input value={notes} onChange={e=>setNotes(e.target.value)} />
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button onClick={()=>{ if(!to) return; onConfirm(to, qty, notes) }}>Confirm</button>
          <button onClick={onClose} style={{background:'#999'}}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
