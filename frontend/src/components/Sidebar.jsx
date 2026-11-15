import { BarChart3, BriefcaseBusiness, ChevronLeft, Files, LayoutDashboard, Settings, Sparkles, Users } from 'lucide-react'

const links = [
  [LayoutDashboard, 'Overview'],
  [Sparkles, 'New ranking'],
  [Users, 'Candidates'],
  [BriefcaseBusiness, 'Roles'],
  [Files, 'Reports'],
]

export default function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><BarChart3 size={20} /></div>
        {!collapsed && <div><strong>rankwise</strong><span>Candidate intelligence</span></div>}
      </div>
      <nav aria-label="Main navigation">
        <p className="nav-label">Workspace</p>
        {links.map(([Icon, label]) => (
          <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => setActive(label)} title={collapsed ? label : undefined}>
            <Icon size={18} /><span>{label}</span>{label === 'New ranking' && !collapsed && <b>+</b>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-item"><Settings size={18} /><span>Settings</span></button>
        <div className="workspace-user"><span>RT</span>{!collapsed && <div><strong>Recruiting team</strong><small>Free workspace</small></div>}</div>
        <button className="collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar"><ChevronLeft size={17} /></button>
      </div>
    </aside>
  )
}

