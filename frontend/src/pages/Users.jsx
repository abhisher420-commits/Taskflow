import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api';
import toast from 'react-hot-toast';
import { Shield, User, Trash2, Users as UsersIcon } from 'lucide-react';

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    usersAPI.getAll()
      .then(res => setUsers(res.data.users))
      .catch(console.error)
      .finally(()=>setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    if (!confirm(`Change role to ${newRole}?`)) return;
    try { await usersAPI.updateRole(id, newRole); toast.success('Role updated'); fetchUsers(); }
    catch(err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    try { await usersAPI.delete(id); toast.success('User deleted'); fetchUsers(); }
    catch(err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner"/></div>;

  const admins = users.filter(u=>u.role==='admin');
  const members = users.filter(u=>u.role==='member');

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} registered user{users.length!==1?'s':''}</p>
        </div>
        <div className="flex gap-3">
          <div className="card card-sm flex items-center gap-2" style={{padding:'10px 16px'}}>
            <Shield size={15} color="var(--accent-light)"/>
            <span style={{fontSize:13}}>{admins.length} Admin{admins.length!==1?'s':''}</span>
          </div>
          <div className="card card-sm flex items-center gap-2" style={{padding:'10px 16px'}}>
            <User size={15} color="var(--purple)"/>
            <span style={{fontSize:13}}>{members.length} Member{members.length!==1?'s':''}</span>
          </div>
        </div>
      </div>
      <div className="page-body">
        {users.length === 0 ? (
          <div className="empty-state">
            <UsersIcon style={{width:48,height:48,margin:'0 auto 16px',opacity:0.3}}/>
            <h3>No users found</h3>
          </div>
        ) : (
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const isSelf = u._id === me?._id;
                    const initials = u.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
                    return (
                      <tr key={u._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar" style={{background:u.avatarColor||'var(--text-primary)', color: 'var(--bg-primary)'}}>{initials}</div>
                            <div>
                              <p style={{fontWeight:600,fontSize:14,color:'var(--text-primary)'}}>{u.name} {isSelf&&<span style={{fontSize:11,color:'var(--text-muted)'}}>(you)</span>}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{color:'var(--text-secondary)',fontSize:13}}>{u.email}</td>
                        <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                        <td style={{color:'var(--text-secondary)',fontSize:13}}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                        </td>
                        <td>
                          {!isSelf ? (
                            <div className="flex gap-2">
                              <button className="btn btn-ghost btn-sm" onClick={()=>changeRole(u._id, u.role)}
                                style={{fontSize:12}}>
                                <Shield size={12}/> Make {u.role==='admin'?'Member':'Admin'}
                              </button>
                              <button className="btn btn-danger btn-sm btn-icon" onClick={()=>deleteUser(u._id)}>
                                <Trash2 size={13}/>
                              </button>
                            </div>
                          ) : (
                            <span style={{fontSize:12,color:'var(--text-muted)'}}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
