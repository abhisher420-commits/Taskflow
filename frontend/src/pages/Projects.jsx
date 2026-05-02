import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, usersAPI } from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Users, FolderKanban, X } from 'lucide-react';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6'];

function ProjectModal({ onClose, onSaved, allUsers }) {
  const [form, setForm] = useState({ name:'', description:'', status:'active', color: COLORS[0], members:[] });
  const [loading, setLoading] = useState(false);

  const toggleMember = (id) => {
    setForm(f => ({ ...f, members: f.members.includes(id) ? f.members.filter(m=>m!==id) : [...f.members, id] }));
  };

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await projectsAPI.create(form);
      toast.success('Project created!'); onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Project</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16}/></button>
        </div>
        <form onSubmit={submit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" placeholder="e.g. Website Redesign" value={form.name}
              onChange={e=>setForm({...form,name:e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" placeholder="What is this project about?"
              value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{display:'flex',gap:8,paddingTop:8}}>
                {COLORS.map(c=>(
                  <div key={c} onClick={()=>setForm({...form,color:c})} style={{
                    width:28,height:28,borderRadius:'50%',background:c,cursor:'pointer',
                    border: form.color===c ? '3px solid white' : '3px solid transparent',
                    boxSizing:'border-box'
                  }}/>
                ))}
              </div>
            </div>
          </div>
          {allUsers.length > 0 && (
            <div className="form-group">
              <label className="form-label">Add Members</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {allUsers.map(u=>(
                  <div key={u._id} onClick={()=>toggleMember(u._id)} style={{
                    display:'flex',alignItems:'center',gap:6,padding:'6px 12px',
                    borderRadius:100, cursor:'pointer', fontSize:13,
                    background: form.members.includes(u._id) ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                    border: `1px solid ${form.members.includes(u._id) ? 'var(--accent)' : 'var(--border)'}`,
                    color: form.members.includes(u._id) ? 'var(--accent)' : 'var(--text-secondary)'
                  }}>
                    <div className="avatar sm" style={{background:u.avatarColor, color: 'var(--bg-card)'}}>{u.name[0]}</div>
                    {u.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="modal-footer" style={{padding:0,marginTop:8}}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchProjects = () => {
    setLoading(true);
    projectsAPI.getAll()
      .then(res => setProjects(res.data.projects))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
    if (isAdmin) usersAPI.getAll().then(res => setAllUsers(res.data.users)).catch(()=>{});
  }, [isAdmin]);

  const deleteProject = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks?')) return;
    try { await projectsAPI.delete(id); toast.success('Deleted'); fetchProjects(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner"/></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={()=>setShowModal(true)}>
            <Plus size={16}/> New Project
          </button>
        )}
      </div>
      <div className="page-body">
        {projects.length === 0 ? (
          <div className="empty-state">
            <FolderKanban style={{width:48,height:48,margin:'0 auto 16px',opacity:0.3}}/>
            <h3>No projects yet</h3>
            <p>{isAdmin ? 'Create your first project to get started.' : 'You have not been added to any projects.'}</p>
          </div>
        ) : (
          <div className="grid-3">
            {projects.map(p => {
              const pct = p.taskCount > 0 ? Math.round((p.doneCount/p.taskCount)*100) : 0;
              return (
                <div key={p._id} className="card" style={{cursor:'pointer',borderTop:`3px solid ${p.color||'var(--accent)'}`}}
                  onClick={()=>navigate(`/projects/${p._id}`)}>
                  <div className="flex items-center justify-between" style={{marginBottom:12}}>
                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                    {isAdmin && (
                      <button className="btn btn-danger btn-icon btn-sm" onClick={e=>deleteProject(p._id,e)}>
                        <Trash2 size={13}/>
                      </button>
                    )}
                  </div>
                  <h3 style={{fontSize:16,fontWeight:700,marginBottom:6}}>{p.name}</h3>
                  {p.description && <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:16,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.description}</p>}
                  <div style={{marginBottom:16}}>
                    <div className="flex items-center justify-between" style={{marginBottom:6}}>
                      <span style={{fontSize:12,color:'var(--text-muted)'}}>Progress</span>
                      <span style={{fontSize:12,fontWeight:600,color:'var(--accent-light)'}}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width:`${pct}%`,background:p.color||'var(--accent)'}}/>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="avatar-group">
                        {p.members?.slice(0,4).map(m=>(
                          <div key={m._id} className="avatar sm" style={{background:m.avatarColor||'var(--text-primary)', color: 'var(--bg-primary)', border: '2px solid var(--bg-card)'}}>{m.name[0]}</div>
                        ))}
                      </div>
                      {p.members?.length > 4 && <span style={{fontSize:12,color:'var(--text-muted)'}}>+{p.members.length-4}</span>}
                    </div>
                    <span style={{fontSize:12,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:4}}>
                      <Users size={12}/> {p.taskCount} task{p.taskCount!==1?'s':''}
                    </span>
                  </div>
                  {p.overdueCount > 0 && (
                    <div style={{marginTop:12,padding:'6px 10px',background:'rgba(239,68,68,0.08)',borderRadius:8,fontSize:12,color:'var(--danger)'}}>
                      ⚠ {p.overdueCount} overdue task{p.overdueCount>1?'s':''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showModal && <ProjectModal onClose={()=>setShowModal(false)} onSaved={()=>{setShowModal(false);fetchProjects();}} allUsers={allUsers}/>}
    </div>
  );
}
