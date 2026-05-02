import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, projectsAPI, usersAPI } from '../api';
import toast from 'react-hot-toast';
import { Filter, Plus, Trash2, X } from 'lucide-react';

function TaskFormModal({ onClose, onSaved, projects, allUsers }) {
  const [form, setForm] = useState({ title:'', description:'', project:'', assignedTo:'', priority:'medium', status:'todo', dueDate:'' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await tasksAPI.create({ ...form, assignedTo: form.assignedTo||undefined, dueDate: form.dueDate||undefined });
      toast.success('Task created!'); onSaved();
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create Task</h2>
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
            <textarea className="form-input" placeholder="Optional…" value={form.description}
              onChange={e=>setForm({...form,description:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Project *</label>
            <select className="form-select" value={form.project} onChange={e=>setForm({...form,project:e.target.value})} required>
              <option value="">Select project…</option>
              {projects.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
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
                {allUsers.map(u=><option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={form.dueDate}
                onChange={e=>setForm({...form,dueDate:e.target.value})} style={{colorScheme:'dark'}} />
            </div>
          </div>
          <div className="modal-footer" style={{padding:0,marginTop:8}}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Creating…':'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const COLS = [
  {key:'todo',label:'To Do',color:'var(--text-muted)'},
  {key:'in-progress',label:'In Progress',color:'var(--warning)'},
  {key:'done',label:'Done',color:'var(--success)'},
];

export default function Tasks() {
  const { isAdmin, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ project:'', priority:'', status:'' });

  const fetchTasks = () => {
    const params = {};
    if (filters.project) params.project = filters.project;
    if (filters.priority) params.priority = filters.priority;
    if (filters.status) params.status = filters.status;
    setLoading(true);
    tasksAPI.getAll(params)
      .then(res => setTasks(res.data.tasks))
      .catch(console.error)
      .finally(()=>setLoading(false));
  };

  useEffect(() => {
    projectsAPI.getAll().then(r=>setProjects(r.data.projects)).catch(()=>{});
    if (isAdmin) usersAPI.getAll().then(r=>setAllUsers(r.data.users)).catch(()=>{});
  }, [isAdmin]);

  useEffect(() => { fetchTasks(); }, [filters]);

  const updateStatus = async (taskId, status) => {
    try {
      const res = await tasksAPI.update(taskId, { status });
      setTasks(prev=>prev.map(t=>t._id===taskId?res.data.task:t));
      toast.success('Status updated');
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try { await tasksAPI.delete(taskId); setTasks(prev=>prev.filter(t=>t._id!==taskId)); toast.success('Deleted'); }
    catch(err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const grouped = COLS.reduce((acc,c)=>{acc[c.key]=tasks.filter(t=>t.status===c.key);return acc;},{});

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length!==1?'s':''} total</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={()=>setShowModal(true)}><Plus size={16}/> New Task</button>}
      </div>
      <div className="page-body">
        {/* Filters */}
        <div className="flex gap-3" style={{marginBottom:24,flexWrap:'wrap'}}>
          <div className="flex items-center gap-2" style={{color:'var(--text-muted)',fontSize:13}}>
            <Filter size={14}/> Filters:
          </div>
          <select className="form-select" style={{width:'auto',padding:'7px 28px 7px 12px'}}
            value={filters.project} onChange={e=>setFilters({...filters,project:e.target.value})}>
            <option value="">All Projects</option>
            {projects.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <select className="form-select" style={{width:'auto',padding:'7px 28px 7px 12px'}}
            value={filters.priority} onChange={e=>setFilters({...filters,priority:e.target.value})}>
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {(filters.project||filters.priority||filters.status) && (
            <button className="btn btn-ghost btn-sm" onClick={()=>setFilters({project:'',priority:'',status:''})}>
              <X size={12}/> Clear
            </button>
          )}
        </div>

        {loading ? <div className="loading-page"><div className="spinner"/></div> : (
          <div className="kanban-board">
            {COLS.map(col=>(
              <div key={col.key} className="kanban-column">
                <div className="kanban-column-header">
                  <div className="flex items-center gap-2">
                    <div style={{width:8,height:8,borderRadius:'50%',background:col.color}}/>
                    <span className="kanban-column-title">{col.label}</span>
                  </div>
                  <span className="kanban-count">{grouped[col.key].length}</span>
                </div>
                <div className="kanban-tasks">
                  {grouped[col.key].length===0 && (
                    <div style={{textAlign:'center',padding:'32px 0',color:'var(--text-muted)',fontSize:13}}>Empty</div>
                  )}
                  {grouped[col.key].map(task=>{
                    const isOverdue = task.dueDate && new Date(task.dueDate)<new Date() && task.status!=='done';
                    const canEdit = isAdmin || task.assignedTo?._id===user?._id;
                    return (
                      <div key={task._id} className={`task-card priority-${task.priority} ${isOverdue?'overdue':''}`}>
                        <div className="flex items-center justify-between" style={{marginBottom:6}}>
                          <div className="flex gap-2">
                            <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                            {isOverdue&&<span className="badge badge-overdue">Overdue</span>}
                          </div>
                          {isAdmin && <button onClick={()=>deleteTask(task._id)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',display:'flex'}}><Trash2 size={13}/></button>}
                        </div>
                        <p className="task-title">{task.title}</p>
                        {task.description && <p className="task-desc">{task.description}</p>}
                        {task.project && (
                          <p style={{fontSize:11,color:'var(--accent-light)',marginBottom:8}}>📁 {task.project.name}</p>
                        )}
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
                                onClick={()=>updateStatus(task._id,c.key)}>→ {c.label}
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
        )}
      </div>
      {showModal && (
        <TaskFormModal onClose={()=>setShowModal(false)} onSaved={()=>{setShowModal(false);fetchTasks();}}
          projects={projects} allUsers={allUsers} />
      )}
    </div>
  );
}
