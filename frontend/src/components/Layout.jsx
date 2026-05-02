import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut, Sun, Moon } from 'lucide-react';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="app-layout">
      <aside className="sidebar" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        <div className="sidebar-logo">
          <div className="logo-icon" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: '8px' }}>⚡</div>
          <span style={{ color: 'var(--text-primary)' }}>TaskFlow</span>
        </div>
        <nav className="sidebar-nav">
          <span className="nav-section-title">Navigation</span>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FolderKanban size={18} /> Projects
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CheckSquare size={18} /> Tasks
          </NavLink>
          {isAdmin && (
            <>
              <span className="nav-section-title" style={{marginTop:12}}>Admin</span>
              <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Users size={18} /> Users
              </NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button className="btn btn-ghost" onClick={toggleTheme} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px' }}>
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
          <div className="user-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
            <div className="avatar sm" style={{ background: user?.avatarColor || 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: '6px' }}>{initials}</div>
            <div className="user-info">
              <div className="user-name truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
              <div className="user-role" style={{ color: 'var(--text-secondary)' }}>{user?.role}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
