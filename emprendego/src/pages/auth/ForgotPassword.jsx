import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { Button, Input } from '../../components/ui'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

const ForgotPassword = () => {
  const { resetPassword } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('El email es requerido')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido')
      return
    }

    setLoading(true)
    const { error: resetError } = await resetPassword(email)
    setLoading(false)

    if (resetError) {
      toast.error('Error al enviar el correo. Intenta de nuevo.')
      return
    }

    setSent(true)
    toast.success('Correo enviado exitosamente')
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Revisa tu correo
        </h1>
        <p className="text-gray-600 mb-8">
          Hemos enviado un enlace de recuperación a<br />
          <strong className="text-gray-900">{email}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          ¿No lo ves? Revisa tu carpeta de spam.
        </p>
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/auth/login"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Recuperar contraseña
      </h1>
      <p className="text-gray-600 mb-8">
        Te enviaremos un enlace para restablecer tu contraseña
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email de tu cuenta"
          type="email"
          icon={Mail}
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          autoComplete="email"
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loading}
        >
          Enviar enlace de recuperación
        </Button>
      </form>
    </div>
  )
}

export default ForgotPassword
