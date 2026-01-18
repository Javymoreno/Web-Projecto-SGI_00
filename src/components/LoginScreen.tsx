import { useState } from 'react';
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Intentar login con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (authError) {
        setError('Credenciales incorrectas. Si no tienes cuenta, usa "Solicitar Acceso".');
        setLoading(false);
        return;
      }

      if (!authData?.user) {
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
        setLoading(false);
        return;
      }

      // Verificar si el usuario existe en la tabla Users y está aceptado
      const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('Aceptado, Nombre')
        .eq('Mail', loginData.email)
        .maybeSingle();

      if (userError || !userData) {
        setError('Usuario no encontrado en el sistema. Por favor, contacta con jgarcia@inexo.es');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!userData.Aceptado) {
        setError('Tu solicitud de acceso está pendiente de aprobación. Por favor, contacta con jgarcia@inexo.es');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Login exitoso
      onLoginSuccess();
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { data: existingUser } = await supabase
        .from('Users')
        .select('Mail')
        .eq('Mail', registerData.email)
        .maybeSingle();

      if (existingUser) {
        setError('Este correo electrónico ya está registrado');
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
      });

      if (authError) {
        setError(`Error al registrar: ${authError.message}`);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Error al crear el usuario');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('Users')
        .insert({
          Nombre: registerData.nombre,
          Mail: registerData.email,
          Password: '',
          Aceptado: false,
          auth_user_id: authData.user.id,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error al insertar en Users:', insertError);
        setError('Error al completar el registro');
        setLoading(false);
        return;
      }

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        await fetch(`${supabaseUrl}/functions/v1/notificar-solicitud-acceso`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: registerData.nombre,
            email: registerData.email
          })
        });
      } catch (notifyError) {
        console.error('Error al enviar notificación:', notifyError);
      }

      setSuccess('Solicitud de acceso enviada correctamente. Se ha notificado a jgarcia@inexo.es para su aprobación.');
      setRegisterData({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        setIsLogin(true);
        setSuccess(null);
      }, 5000);

    } catch (err) {
      console.error('Error en registro:', err);
      setError('Error al procesar la solicitud. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/logo_grupo_inexo_black.png"
            alt="Grupo INEXO Logo"
            className="h-32 mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-white mb-3">
            Sistema de Gestión de Grupo INEXO
          </h1>
          <h2 className="text-2xl text-slate-300 mb-4">
            Análisis de Estudio Económico
          </h2>
          <p className="text-sm text-slate-400">
            Desarrollado by Javier García
          </p>
          <a
            href="mailto:jgarcia@inexo.es"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            jgarcia@inexo.es
          </a>
        </div>

        <div className="bg-slate-900 rounded-lg shadow-xl p-8 border border-slate-700">
          <div className="flex mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
                isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              } rounded-l-lg`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
                !isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              } rounded-r-lg`}
            >
              Solicitar Acceso
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-900/50 border border-green-600 rounded-lg flex items-start">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-200">{success}</p>
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={registerData.nombre}
                    onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="Juan Pérez García"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-800 border border-slate-600 rounded-lg">
                <p className="text-xs text-slate-400">
                  Tu solicitud será revisada por el administrador. Recibirás una notificación cuando sea aprobada.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando solicitud...' : 'Solicitar Acceso'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              ¿Necesitas ayuda? Contacta con{' '}
              <a
                href="mailto:jgarcia@inexo.es"
                className="text-blue-400 hover:text-blue-300"
              >
                jgarcia@inexo.es
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
