import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../api';
import { CheckSquare, Clock, AlertCircle, FolderKanban, Users, TrendingUp, Plus, Activity, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color, iconBg }) => (
  <div className="card stat-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1, color: 'var(--text-primary)' }}>{value ?? '—'}</div>
    </div>
    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
  </div>
);

const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const stats = data?.stats || {};
  const upcomingTasks = data?.upcomingTasks || [];
  const recentActivityTasks = data?.recentActivityTasks || [];

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px' }}>Here is what's happening across your workspace today.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/projects" className="btn btn-primary" style={{ padding: '10px 16px', fontSize: '13px', borderRadius: '6px' }}>
            <Plus size={16} /> New Project
          </Link>
        </div>
      </div>

      <div className="page-body" style={{ paddingTop: '0' }}>
        
        {/* Quick Actions / KPI Row */}
        <div className="stats-grid" style={{ marginBottom: '32px' }}>
          <StatCard icon={CheckSquare} label="Total Tasks" value={stats.totalTasks} color="var(--text-primary)" iconBg="var(--bg-secondary)" />
          <StatCard icon={TrendingUp} label="Completed" value={stats.doneTasks} color="#10B981" iconBg="rgba(16,185,129,0.12)" />
          <StatCard icon={AlertCircle} label="Overdue" value={stats.overdueTasks} color="#EF4444" iconBg="rgba(239,68,68,0.12)" />
          <StatCard icon={FolderKanban} label="Projects" value={stats.totalProjects} color="#8B5CF6" iconBg="rgba(139,92,246,0.12)" />
        </div>

        <div className="grid-2" style={{ gap: '24px' }}>
          
          {/* Left Column: Analytics & Deadlines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Completion Analytics */}
            <div className="card">
              <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '20px' }}>Task Distribution</h3>
              
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800', lineHeight: 1, color: 'var(--text-primary)' }}>{stats.completionRate}%</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#10B981' }}>Completion Rate</span>
              </div>
              
              <div className="progress-bar" style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div className="progress-fill" style={{ width: `${stats.completionRate}%`, background: 'var(--text-primary)', borderRadius: '4px' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.priorities?.high || 0}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>HIGH PRIORITY</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.priorities?.medium || 0}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>MEDIUM PRIORITY</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.priorities?.low || 0}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>LOW PRIORITY</div>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="card" style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Calendar size={18} color="var(--text-primary)" />
                <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Upcoming Deadlines</h3>
              </div>
              
              {upcomingTasks.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No upcoming deadlines.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {upcomingTasks.map(task => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                    return (
                      <div key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{task.title}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{task.project?.name}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: isOverdue ? '#EF4444' : 'var(--text-primary)' }}>
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Recent Activity Feed */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Activity size={18} color="var(--text-primary)" />
              <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Recent Activity</h3>
            </div>
            
            {recentActivityTasks.length === 0 ? (
               <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No recent activity.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {recentActivityTasks.map((task, idx) => (
                  <div key={task._id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                    {/* Timeline Line */}
                    {idx !== recentActivityTasks.length - 1 && (
                      <div style={{ position: 'absolute', left: '15px', top: '32px', bottom: '-24px', width: '2px', background: 'var(--border)' }} />
                    )}
                    
                    {/* User Avatar / Dot */}
                    <div className="avatar sm" style={{ width: '32px', height: '32px', borderRadius: '8px', background: task.assignedTo?.avatarColor || 'var(--text-primary)', color: 'var(--bg-primary)', flexShrink: 0, zIndex: 1, border: '2px solid var(--bg-card)' }}>
                      {task.assignedTo?.name?.[0] || '?'}
                    </div>
                    
                    {/* Activity Content */}
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                        <span style={{ fontWeight: '600' }}>{task.assignedTo?.name || 'Someone'}</span> updated task <span style={{ fontWeight: '600' }}>"{task.title}"</span> in <span style={{ fontWeight: '600' }}>{task.project?.name}</span>.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <span className={`badge badge-${task.status}`}>{task.status}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• {formatDate(task.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
