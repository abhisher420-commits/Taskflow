import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, tasksAPI, usersAPI } from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, X, UserPlus, Trash2 } from 'lucide-react';

function TaskModal({ projectId, allMembers, onClose, onSaved }) {
  const [form, setForm] = useState({ title:'', description:'', assignedTo:'', priority:'medium', status:'todo', dueDate:'' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await tasksAPI.create({ ...form, project: projectId, assignedTo: form.assignedTo || undefined, dueDate: form.dueDate || undefined });
      toast.success('Task created!'); onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Task</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16}/></button>
        </div>
        <form onSubmit={submit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Task title" value={form.title}
              onChange={e=>setForm({...form,title:e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" placeholder="Describe the task…"
              value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" value={form.assignedTo} onChange={e=>setForm({...form,assignedTo:e.target.value})}>
                <option value="">Unassigned</option>
                {allMembers.map(m=><option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={form.dueDate}
                onChange={e=>setForm({...form,dueDate:e.target.value})}
                style={{colorScheme:'dark'}} />
            </div>
          </div>
          <div className="modal-footer" style={{padding:0,marginTop:8}}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Adding…':'Add Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const COLS = [
  { key:'todo', label:'To Do', color:'var(--text-muted)' },
  { key:'in-progress', label:'In Progress', color:'var(--warning)' },
  { key:'done', label:'Done', color:'var(--success)' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [addMemberEmail, setAddMemberEmail] = useState('');

  const fetchAll = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        projectsAPI.getOne(id),
        tasksAPI.getAll({ project: id })
      ]);
      setProject(pRes.data.project);
      setTasks(tRes.data.tasks);
    } catch { navigate('/projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAll();
    if (isAdmin) usersAPI.getAll().then(r=>setAllUsers(r.data.users)).catch(()=>{});
  }, [id, isAdmin]);

  const updateStatus = async (taskId, status) => {
    try {
      const res = await tasksAPI.update(taskId, { status });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data.task : t));
      toast.success('Status updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try { await tasksAPI.delete(taskId); setTasks(prev=>prev.filter(t=>t._id!==taskId)); toast.success('Deleted'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const addMember = async () => {
    const found = allUsers.find(u => u.email === addMemberEmail.trim());
    if (!found) return toast.error('User not found');
    try {
      await projectsAPI.addMember(id, found._id);
      toast.success('Member added'); setAddMemberEmail(''); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try { await projectsAPI.removeMember(id, userId); toast.success('Removed'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner"/></div>;
  if (!project) return null;

  const grouped = COLS.reduce((acc,c) => { acc[c.key] = tasks.filter(t=>t.status===c.key); return acc; }, {});
  const allMembers = [project.owner, ...project.members].filter(Boolean);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>navigate('/projects')}><ArrowLeft size={16}/></button>
          <div>
            <div className="flex items-center gap-2">
              <div style={{width:12,height:12,borderRadius:'50%',background:project.color||'var(--accent)'}}/>
              <h1 className="page-title">{project.name}</h1>
              <span className={`badge badge-${project.status}`}>{project.status}</span>
            </div>
            {project.description && <p className="page-subtitle">{project.description}</p>}
          </div>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={()=>setShowTaskModal(true)}><Plus size={16}/> Add Task</button>}
      </div>

      <div className="page-body">
        {/* Members */}
        <div className="card" style={{marginBottom:24}}>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:14}}>Team Members</h3>
          <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom: isAdmin?16:0}}>
            {allMembers.map(m => (
              <div key={m._id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 12px',background:'var(--bg-elevated)',borderRadius:100,border:'1px solid var(--border)'}}>
                <div className="avatar sm" style={{background:m.avatarColor||'#6366f1'}}>{m.name[0]}</div>
                <span style={{fontSize:13,fontWeight:500}}>{m.name}</span>
                <span className={`badge badge-${m._id===project.owner._id?'admin':'member'}`} style={{fontSize:10}}>
                  {m._id===project.owner._id?'owner':'member'}
                </span>
                {isAdmin && m._id !== project.owner._id && (
                  <button onClick={()=>removeMember(m._id)} style={{background:'none',border:'none',color:'var(--danger)',cursor:'pointer',display:'flex',padding:2}}>
                    <X size={12}/>
                  </button>
                )}
              </div>
            ))}
          </div>
          {isAdmin && (
            <div className="flex gap-2" style={{marginTop:8}}>
              <input className="form-input" style={{maxWidth:280}} placeholder="Member email address"
                value={addMemberEmail} onChange={e=>setAddMemberEmail(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&addMember()} />
              <button className="btn btn-ghost" onClick={addMember}><UserPlus size={14}/> Add</button>
            </div>
          )}
        </div>

        {/* Kanban */}
        <div className="kanban-board">
          {COLS.map(col => (
            <div key={col.key} className="kanban-column">
              <div className="kanban-column-header">
                <div className="flex items-center gap-2">
                  <div style={{width:8,height:8,borderRadius:'50%',background:col.color}}/>
                  <span className="kanban-column-title">{col.label}</span>
                </div>
                <span className="kanban-count">{grouped[col.key].length}</span>
              </div>
              <div className="kanban-tasks">
                {grouped[col.key].length === 0 && (
                  <div style={{textAlign:'center',padding:'32px 0',color:'var(--text-muted)',fontSize:13}}>Empty</div>
                )}
                {grouped[col.key].map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate)<new Date() && task.status!=='done';
                  const canEdit = isAdmin || task.assignedTo?._id===user?._id;
                  return (
                    <div key={task._id} className={`task-card priority-${task.priority} ${isOverdue?'overdue':''}`}>
                      <div className="flex items-center justify-between" style={{marginBottom:6}}>
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        {isAdmin && (
                          <button onClick={()=>deleteTask(task._id)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',display:'flex'}} >
                            <Trash2 size={13}/>
                          </button>
                        )}
                      </div>
                      <p className="task-title">{task.title}</p>
                      {task.description && <p className="task-desc">{task.description}</p>}
                      <div className="flex items-center justify-between">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="avatar sm" style={{background:task.assignedTo.avatarColor||'#6366f1'}}>{task.assignedTo.name[0]}</div>
                            <span style={{fontSize:11,color:'var(--text-secondary)'}}>{task.assignedTo.name}</span>
                          </div>
                        ) : <span style={{fontSize:11,color:'var(--text-muted)'}}>Unassigned</span>}
                        {task.dueDate && (
                          <span className={`task-due ${isOverdue?'overdue-text':''}`}>
                            {isOverdue?'⚠ ':''}{new Date(task.dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                          </span>
                        )}
                      </div>
                      {canEdit && (
                        <div className="flex gap-2" style={{marginTop:10}}>
                          {COLS.filter(c=>c.key!==col.key).map(c=>(
                            <button key={c.key} className="btn btn-ghost btn-sm" style={{flex:1,justifyContent:'center',fontSize:11}}
                              onClick={()=>updateStatus(task._id, c.key)}>
                              → {c.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {showTaskModal && (
        <TaskModal projectId={id} allMembers={allMembers}
          onClose={()=>setShowTaskModal(false)}
          onSaved={()=>{setShowTaskModal(false);fetchAll();}} />
      )}
    </div>
  );
}
