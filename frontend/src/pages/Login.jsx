import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login } from '../services/auth.service';
import Alert from '../components/ui/Alert';
import { useTheme } from '../hooks/useTheme';
import logo    from '../assets/logo_bunkers.png';
import bgImage from '../assets/background_bunkers.png';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const setAuth   = useAuthStore((s) => s.setAuth);
  const navigate  = useNavigate();
  const { t, isDark } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      setAuth(res.data.data.token, res.data.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{ background: isDark ? 'rgba(5,13,30,0.55)' : 'rgba(240,244,255,0.50)' }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-8 flex flex-col items-center transition-all duration-300"
        style={t.login}
      >
        <img
          src={logo}
          alt="Bunkers de Refacciones"
          className="h-16 w-auto object-contain mb-6"
          style={{ filter: 'drop-shadow(0 0 16px rgba(59,130,246,0.5))' }}
        />

        <div
          className="w-full h-px mb-6"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)' }}
        />

        <p className="text-xs tracking-widest uppercase mb-6 -mt-2"
           style={{ color: t.textFaint }}>
          Sistema Administrativo · Tamaulipas
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div>
            <label className="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
                   style={{ color: t.textLabel }}>
              Email
            </label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@bunkers.local"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
                   style={{ color: t.textLabel }}>
              Contraseña
            </label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Alert type="error" message={error} />
          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-xs mt-6 text-center" style={{ color: t.textFaint }}>
          Bunkers de Refacciones © 2025
        </p>
      </div>
    </div>
  );
}
