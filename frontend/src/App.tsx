import React, { useState } from 'react'
import './app.css'
import Home from './pages/Home'
import RollInventory from './pages/RollInventory'
import Cutting from './pages/Cutting'
import Stitching from './pages/Stitching'
import Washing from './pages/Washing'
import Finishing from './pages/Finishing'
import Warehouse from './pages/Warehouse'

type Page = 'home' | 'rolls' | 'cutting' | 'stitching' | 'washing' | 'finishing' | 'warehouse'

type NavItem = { id: Page; icon: React.ReactNode; label: string }

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 9.5V19h13V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function RollIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 13.5c2.2-4.2 5.1-6.4 8-6.4 4.4 0 8 3.2 8 8.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M5 17.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7.5 9.5V6.5M16.5 9.5V6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function CuttingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M9.5 9.5 15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function StitchingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 15.5c2.1-4.1 4.5-6.1 7.5-6.1 2.1 0 4 1.2 6 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7 17.5c1.6-2.5 3.2-3.8 5-3.8 2 0 3.7 1.2 5.5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8 7.5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function WashingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 15.5c2.2-3 4.5-4.5 7-4.5 2 0 3.7.8 5.5 2.4 2.1 1.8 3.5 3.2 3.5 5.6H4v-3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M7 8.5c0-1.2 1-2.2 2.2-2.2a2.7 2.7 0 0 1 2.6 2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M10 12.5c.9-.7 1.9-.9 3-.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function FinishingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6.5h12v11H6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 10.5h6M9 13.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M5 6.5 3.8 4.5M19 6.5l1.2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function WarehouseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9.5 12 4l8 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 10.5V18h12v-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 18v-4h6v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: <HomeIcon />, label: 'Home' },
  { id: 'rolls', icon: <RollIcon />, label: 'Rolls' },
  { id: 'cutting', icon: <CuttingIcon />, label: 'Cutting' },
  { id: 'stitching', icon: <StitchingIcon />, label: 'Stitching' },
  { id: 'washing', icon: <WashingIcon />, label: 'Washing' },
  { id: 'finishing', icon: <FinishingIcon />, label: 'Finishing' },
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


