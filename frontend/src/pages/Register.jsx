import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.token, res.data.user);
      toast.success(`Account created! You are ${res.data.user.role === 'admin' ? 'an Admin 🎉' : 'a Member'}`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-split-layout">
      {/* Left: Visual Branding */}
      <div className="auth-visual">
        <div className="shape-purple shape-anim">
          <div className="shape-eye" style={{ top: '30%', left: '25%' }}></div>
          <div className="shape-eye" style={{ top: '30%', right: '25%' }}></div>
          <div className="shape-mouth" style={{ top: '50%', left: 'calc(50% - 12px)' }}></div>
        </div>
        
        <div className="shape-black shape-anim">
          <div className="shape-eye" style={{ top: '40%', left: '30%' }}></div>
          <div className="shape-eye" style={{ top: '40%', right: '30%' }}></div>
          <div className="shape-mouth" style={{ top: '60%', left: 'calc(50% - 12px)', borderBottom: '3px solid #8B5CF6' }}></div>
        </div>
        
        <div className="shape-orange shape-anim">
          <div className="shape-eye" style={{ top: '40%', left: '30%' }}></div>
          <div className="shape-eye" style={{ top: '40%', right: '30%' }}></div>
        </div>

        <div className="shape-yellow shape-anim">
          <div className="shape-eye" style={{ top: '35%', left: '35%' }}></div>
          <div className="shape-eye" style={{ top: '35%', right: '35%' }}></div>
          <div className="shape-mouth" style={{ top: '55%', left: 'calc(50% - 12px)', borderBottom: '3px solid #111827' }}></div>
        </div>
      </div>

      {/* Right: Authentication Form */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper fade-in">
          <h1 className="auth-heading">Create account</h1>
          <p className="auth-subheading">Join TaskFlow and start collaborating</p>

          <form onSubmit={handleSubmit} className="auth-form-fields">
            <div className="minimal-input-wrapper">
              <label className="minimal-input-label">Full Name</label>
              <input 
                className="minimal-input" 
                type="text" 
                placeholder="John Doe"
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                required 
              />
            </div>

            <div className="minimal-input-wrapper">
              <label className="minimal-input-label">Email</label>
              <input 
                className="minimal-input" 
                type="email" 
                placeholder="you@example.com"
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                required 
              />
            </div>

            <div className="minimal-input-wrapper">
              <label className="minimal-input-label">Password</label>
              <input 
                className="minimal-input" 
                type="password" 
                placeholder="Min 6 characters"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                required 
              />
            </div>

            <div className="minimal-input-wrapper">
              <label className="minimal-input-label">Role</label>
              <select 
                className="minimal-input" 
                style={{ appearance: 'none', cursor: 'pointer' }}
                value={form.role} 
                onChange={e => setForm({...form, role: e.target.value})}
              >
                <option value="member">Member</option>
                <option value="admin">Admin (first user only)</option>
              </select>
            </div>

            {error && <p style={{ fontSize: '14px', color: '#EF4444', marginTop: '-16px' }}>{error}</p>}

            <button type="submit" className="btn-brutal" disabled={loading}>
              {loading ? 'Creating…' : 'Sign Up'}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '16px', color: '#64748B' }}>
            Already have an account? <Link to="/login" style={{ color: '#000000', fontWeight: '700', textDecoration: 'none', marginLeft: '4px', borderBottom: '2px solid transparent', transition: 'border-color 0.2s' }} onMouseOver={(e) => e.target.style.borderBottomColor = '#000000'} onMouseOut={(e) => e.target.style.borderBottomColor = 'transparent'}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
