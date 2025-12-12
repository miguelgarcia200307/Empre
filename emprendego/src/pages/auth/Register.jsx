import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { Button, Input, Modal } from '../../components/ui'
import { Mail, Lock, User, ArrowLeft, CheckCircle2, Send, Inbox, MousePointerClick, LogIn } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const Register = () => {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  
  // Estados para el modal de verificación
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [hasSession, setHasSession] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (loading) return // evita doble submit

    setLoading(true)
    const { data, error } = await signUp(formData.email, formData.password, {
      full_name: formData.name,
    })
    setLoading(false)

    if (error) {
      if (error.message?.includes('already registered')) {
        toast.error('Este email ya está registrado')
      } else {
        toast.error('Error al crear cuenta. Intenta de nuevo.')
      }
      return
    }

    // ✅ Si Supabase entregó sesión (email confirm OFF o auto-login), ir directo a onboarding
    if (data?.session) {
      toast.success('¡Cuenta creada exitosamente!')
      navigate('/onboarding')
      return
    }

    // ❌ Si NO hay sesión, mostrar modal de verificación (NO navegar)
    // Marcar que estamos en flujo de registro para evitar redirección automática
    sessionStorage.setItem('eg_registration_pending', 'true')
    setRegisteredEmail(formData.email)
    setHasSession(false)
    setSuccessModalOpen(true)
    
    // Limpiar contraseñas para evitar confusión
    setFormData((prev) => ({
      ...prev,
      password: '',
      confirmPassword: '',
    }))
  }

  // Reenviar correo de verificación
  const handleResendEmail = async () => {
    if (!registeredEmail) return
    
    setResendLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
      })
      
      if (error) throw error
      toast.success('Te reenviamos el correo. Revisa tu bandeja de entrada.')
    } catch (error) {
      console.error('Error reenviando correo:', error)
      toast.error('No se pudo reenviar. Intenta en unos segundos.')
    } finally {
      setResendLoading(false)
    }
  }

  // Ir al login
  const handleGoToLogin = () => {
    // Limpiar flag de registro pendiente
    sessionStorage.removeItem('eg_registration_pending')
    setSuccessModalOpen(false)
    navigate('/auth/login')
  }

  // Limpiar flag si se cierra el modal
  const handleCloseModal = () => {
    sessionStorage.removeItem('eg_registration_pending')
    setSuccessModalOpen(false)
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
        Crea tu cuenta
      </h1>
      <p className="text-gray-600 mb-8">
        Empieza a vender en minutos, gratis
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nombre completo"
          type="text"
          icon={User}
          placeholder="Juan Pérez"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          autoComplete="name"
        />

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
          placeholder="Mínimo 6 caracteres"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          autoComplete="new-password"
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          icon={Lock}
          placeholder="Repite tu contraseña"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loading}
        >
          Crear cuenta gratis
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Al registrarte aceptas nuestros{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Términos de servicio
          </a>{' '}
          y{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Política de privacidad
          </a>
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link
          to="/auth/login"
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          Inicia sesión
        </Link>
      </p>

      {/* Modal de verificación de email */}
      <Modal
        isOpen={successModalOpen}
        onClose={handleCloseModal}
        title="✅ Cuenta creada correctamente"
        description="Ahora confirma tu correo para activar el acceso."
        size="md"
      >
        <div className="space-y-6">
          {/* Ícono principal */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* Email registrado */}
          <div className="text-center">
            <p className="text-sm text-gray-500">Enviamos un correo a:</p>
            <p className="font-semibold text-gray-900 mt-1">{registeredEmail}</p>
          </div>

          {/* Pasos a seguir */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">Sigue estos pasos:</h4>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Inbox className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Revisa tu bandeja de entrada <span className="text-gray-400">(y Spam/Promociones)</span>
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MousePointerClick className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Abre el correo de <strong>EmprendeGo</strong> y pulsa "Confirmar correo"
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <LogIn className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Vuelve aquí e inicia sesión con tu email y contraseña
                </p>
              </div>
            </div>
          </div>

          {/* Tip de seguridad */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>Nota:</strong> Si intentas iniciar sesión sin confirmar el correo, 
              es normal que el sistema no te deje. Es por seguridad.
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleResendEmail}
              loading={resendLoading}
              className="flex-1 order-2 sm:order-1"
            >
              <Send className="w-4 h-4 mr-2" />
              Reenviar correo
            </Button>
            <Button
              onClick={handleGoToLogin}
              className="flex-1 order-1 sm:order-2"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Ir a iniciar sesión
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Register
