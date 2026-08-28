import React, { useState } from 'react'
import './app.css'
import Home from './pages/Home'
import RollInventory from './pages/RollInventory'
import Cutting from './pages/Cutting'
import Stitching from './pages/Stitching'
import Washing from './pages/Washing'
import Finishing from './pages/Finishing'
import Warehouse from './pages/Warehouse'
import { HomeIcon, FabricIcon, ScissorsIcon, NeedleThreadIcon, WashingMachineIcon, IronIcon, WarehouseIcon } from './icons'

type Page = 'home' | 'rolls' | 'cutting' | 'stitching' | 'washing' | 'finishing' | 'warehouse'

type NavItem = { id: Page; icon: React.ReactNode; label: string }

const NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: <HomeIcon />, label: 'Home' },
  { id: 'rolls', icon: <FabricIcon />, label: 'Rolls' },
  { id: 'cutting', icon: <ScissorsIcon />, label: 'Cutting' },
  { id: 'stitching', icon: <NeedleThreadIcon />, label: 'Stitching' },
  { id: 'washing', icon: <WashingMachineIcon />, label: 'Washing' },
  { id: 'finishing', icon: <IronIcon />, label: 'Finishing' },
  { id: 'warehouse', icon: <WarehouseIcon />, label: 'Warehouse' },
]

export default function App() {
  const [page, setPage] = useState<Page>('home')

  return (
    <div className="app-shell">
      {page === 'home'      && <Home onNavigate={p => setPage(p as Page)} />}
      {page === 'rolls'     && <RollInventory />}
      {page === 'cutting'   && <Cutting />}
      {page === 'stitching' && <Stitching />}
      {page === 'washing'   && <Washing />}
      {page === 'finishing' && <Finishing />}
      {page === 'warehouse' && <Warehouse />}

      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => (
          <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}


