import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { Button, Input } from '../../components/ui'
import { supabase } from '../../lib/supabaseClient'
import { Mail, Lock, ArrowLeft } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const { signIn, user } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Función para verificar rol y redirigir
  const checkRoleAndRedirect = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error al obtener perfil:', error)
        // Por defecto redirigir a panel emprendedor
        navigate('/panel')
        return
      }

      // Redirigir según el rol
      if (profile?.role === 'admin') {
        toast.success('¡Bienvenido, Administrador!')
        navigate('/admin')
      } else {
        toast.success('¡Bienvenido de vuelta!')
        // Si no ha completado onboarding, ir allá
        if (!profile?.onboarding_completed) {
          navigate('/onboarding')
        } else {
          navigate('/panel')
        }
      }
    } catch (err) {
      console.error('Error verificando rol:', err)
      navigate('/panel')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const { data, error } = await signIn(formData.email, formData.password)

    if (error) {
      setLoading(false)
      // Detectar error de email no confirmado
      const errorMsg = error.message?.toLowerCase() || ''
      if (errorMsg.includes('email not confirmed') || errorMsg.includes('not confirmed')) {
        toast.error('Tu correo aún no está verificado. Revisa tu email y confirma tu cuenta.')
      } else if (error.message.includes('Invalid login')) {
        toast.error('Email o contraseña incorrectos')
      } else {
        toast.error('Error al iniciar sesión. Intenta de nuevo.')
      }
      return
    }

    // Verificar rol y redirigir apropiadamente
    if (data?.user) {
      await checkRoleAndRedirect(data.user.id)
    }
    setLoading(false)
  }

  return (
    <div>
      {/* Back to Marketplace link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Iniciar sesión
      </h1>
      <p className="text-gray-600 mb-8">
        Ingresa a tu panel de emprendedor
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="tu@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          label="Contraseña"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Recordarme</span>
          </label>
          <Link
            to="/auth/recuperar"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loading}
        >
          Iniciar sesión
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <Link
          to="/auth/registro"
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          Regístrate gratis
        </Link>
      </p>

      {/* Demo credentials */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          <strong>Da el siguiente paso:</strong> organiza tu negocio y vende de forma más profesional con EmprendeGo.
        </p>
      </div>
    </div>
  )
}

export default Login
