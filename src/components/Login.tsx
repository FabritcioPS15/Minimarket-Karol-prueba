// src/components/Login.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, Lock, User } from 'lucide-react';

export function Login() {
  const { dispatch, users } = useApp();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Buscar usuario usando el método findUserByUsername del contexto
      const user = await users.findUserByUsername(credentials.username);
      
      if (user && user.isActive) {
        // VERIFICAR CONTRASEÑA - Ahora se comprueba realmente
        if (user.password === credentials.password) {
          dispatch({ type: 'LOGIN', payload: user });
        } else {
          setError('Contraseña incorrecta');
        }
      } else if (user && !user.isActive) {
        setError('Usuario inactivo. Contacte al administrador.');
      } else {
        setError('Usuario no encontrado');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error al iniciar sesión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoUsername: string) => {
    setLoading(true);
    setError('');

    try {
      const user = await users.findUserByUsername(demoUsername);
      
      if (user && user.isActive) {
        // Para demo, usar la contraseña real del usuario
        setCredentials({ 
          username: demoUsername, 
          password: user.password // Usar la contraseña real
        });
        
        // Esperar un momento para que se actualice el estado
        setTimeout(() => {
          dispatch({ type: 'LOGIN', payload: user });
        }, 100);
      } else {
        setError('Usuario de demostración no configurado correctamente');
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Error al iniciar sesión de demostración');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar cambio rápido de credenciales demo
  const quickDemoLogin = (demoUsername: string, demoPassword: string = 'demo123') => {
    setCredentials({
      username: demoUsername,
      password: demoPassword
    });
    
    // Simular envío automático después de un breve delay
    setTimeout(() => {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(submitEvent);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="bg-blue-600 rounded-full p-3 inline-block mb-4">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Inventario</h1>
            <p className="text-gray-600 mt-2">Accede a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ingresa tu usuario"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ingresa tu contraseña"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center mb-3">Usuarios de demostración:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => quickDemoLogin('admin', 'demo123')}
                disabled={loading}
                className="w-full flex justify-between items-center bg-gray-50 px-3 py-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 text-left"
              >
                <div>
                  <span className="font-medium block">admin</span>
                  <span className="text-xs text-gray-500">Contraseña: demo123</span>
                </div>
                <span className="text-gray-600 bg-blue-100 px-2 py-1 rounded text-xs">Administrador</span>
              </button>
              
              <button
                type="button"
                onClick={() => quickDemoLogin('supervisor', 'demo123')}
                disabled={loading}
                className="w-full flex justify-between items-center bg-gray-50 px-3 py-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 text-left"
              >
                <div>
                  <span className="font-medium block">supervisor</span>
                  <span className="text-xs text-gray-500">Contraseña: demo123</span>
                </div>
                <span className="text-gray-600 bg-green-100 px-2 py-1 rounded text-xs">Supervisor</span>
              </button>
              
              <button
                type="button"
                onClick={() => quickDemoLogin('vendedor', 'demo123')}
                disabled={loading}
                className="w-full flex justify-between items-center bg-gray-50 px-3 py-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 text-left"
              >
                <div>
                  <span className="font-medium block">vendedor</span>
                  <span className="text-xs text-gray-500">Contraseña: demo123</span>
                </div>
                <span className="text-gray-600 bg-yellow-100 px-2 py-1 rounded text-xs">Cajero</span>
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 text-center">
                <strong>Nota:</strong> Estos usuarios deben existir en la base de datos con contraseña 'demo123'
              </p>
            </div>

            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 text-center">
                <strong>¿Primera vez?</strong> Ejecuta en SQL Editor de Supabase:
              </p>
              <code className="text-xs bg-gray-100 p-1 rounded block mt-1 overflow-x-auto">
                INSERT INTO users (username, email, role, is_active, password) VALUES<br/>
                ('admin', 'admin@empresa.com', 'admin', true, 'demo123'),<br/>
                ('supervisor', 'supervisor@empresa.com', 'supervisor', true, 'demo123'),<br/>
                ('vendedor', 'vendedor@empresa.com', 'cashier', true, 'demo123');
              </code>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-center mt-3 text-gray-700">Verificando credenciales...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}