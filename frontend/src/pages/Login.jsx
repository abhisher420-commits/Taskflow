import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">Sign in to your TaskFlow account</p>

          <form onSubmit={handleSubmit} className="auth-form-fields">
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
                placeholder="••••••••"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                required 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="custom-checkbox-wrapper">
                <input type="checkbox" className="custom-checkbox-input" />
                <div className="custom-checkbox-box">
                  <Check size={14} color="#FFFFFF" className="custom-checkbox-icon" strokeWidth={3} />
                </div>
                <span className="custom-checkbox-label">Remember me</span>
              </label>
              <a href="#" style={{ fontSize: '14px', color: '#64748B', textDecoration: 'none' }}>Forgot password?</a>
            </div>

            {error && <p style={{ fontSize: '14px', color: '#EF4444', marginTop: '-16px' }}>{error}</p>}

            <button type="submit" className="btn-brutal" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '16px', color: '#64748B' }}>
            Don't have an account? <Link to="/register" style={{ color: '#000000', fontWeight: '700', textDecoration: 'none', marginLeft: '4px', borderBottom: '2px solid transparent', transition: 'border-color 0.2s' }} onMouseOver={(e) => e.target.style.borderBottomColor = '#000000'} onMouseOut={(e) => e.target.style.borderBottomColor = 'transparent'}>Sign Up</Link>
          </div>
          
          <div style={{marginTop: '40px', padding: '16px', background: '#F1F5F9', borderRadius: '8px'}}>
            <p style={{fontSize: '12px', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600'}}>Demo Note</p>
            <p style={{fontSize: '14px', color: '#111827'}}>Register first — the first account created automatically becomes the <strong>Admin</strong>!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
