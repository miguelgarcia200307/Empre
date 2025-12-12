import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import {
  Card,
  Button,
  Input,
  Textarea,
  Accordion,
} from '../../components/ui'
import {
  HelpCircle,
  Mail,
  MessageSquare,
  Send,
  FileText,
  Book,
} from 'lucide-react'

const Soporte = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [sending, setSending] = useState(false)
  const [formData, setFormData] = useState({
    asunto: '',
    mensaje: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.asunto || !formData.mensaje) {
      toast.error('Todos los campos son requeridos')
      return
    }

    setSending(true)
    
    // TODO: Enviar a backend/email
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast.success('Mensaje enviado. Te responderemos pronto.')
    setFormData({ asunto: '', mensaje: '' })
    setSending(false)
  }

  const faqs = [
    {
      title: '¿Cómo agrego mi primer producto?',
      content: 'Ve a la sección "Productos" y haz clic en "Nuevo producto". Completa el nombre, precio, descripción opcional y sube una foto. ¡Listo!',
    },
    {
      title: '¿Cómo comparto mi tienda?',
      content: 'En "Enlaces y QR" encontrarás tu enlace único y código QR. Puedes copiarlo, descargarlo o compartirlo directamente en redes sociales.',
    },
    {
      title: '¿Cómo recibo los pedidos?',
      content: 'Cuando un cliente hace clic en "Pedir por WhatsApp", se abre una conversación contigo con el detalle del pedido. Tú manejas el resto como prefieras.',
    },
    {
      title: '¿Puedo personalizar los colores de mi tienda?',
      content: 'Sí, en "Diseño" puedes elegir entre paletas predefinidas o seleccionar colores personalizados para tu tienda.',
    },
    {
      title: '¿Cuáles son los planes disponibles?',
      content: 'Tenemos 4 planes: Gratuito (10 productos), Básico ($10.000/mes, 50 productos + QR), Emprendedor ($15.000/mes, ilimitados + IA + finanzas) y Pro ($20.000/mes, todo + sin marca).',
    },
    {
      title: '¿Puedo cambiar de plan después?',
      content: 'Sí, puedes subir o bajar de plan en cualquier momento desde la sección "Plan y Facturación".',
    },
    {
      title: '¿Cómo funciona el módulo de finanzas?',
      content: 'El módulo de finanzas (disponible desde el Plan Emprendedor) te permite registrar ingresos y gastos, ver gráficos de tu rendimiento y tomar mejores decisiones para tu negocio.',
    },
    {
      title: '¿Mis datos están seguros?',
      content: 'Sí, usamos encriptación y las mejores prácticas de seguridad. Tus datos nunca se comparten con terceros.',
    },
  ]

  const resources = [
    {
      title: 'Guía de inicio rápido',
      description: 'Aprende a configurar tu tienda en 5 minutos',
      icon: Book,
      link: '#',
    },
    {
      title: 'Video tutoriales',
      description: 'Paso a paso en video',
      icon: FileText,
      link: '#',
    },
    {
      title: 'Centro de ayuda',
      description: 'Artículos y guías detalladas',
      icon: HelpCircle,
      link: '#',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Soporte</h1>
        <p className="text-gray-600 mt-1">
          ¿Necesitas ayuda? Estamos aquí para ti
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact form */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-100">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Envíanos un mensaje</h2>
              <p className="text-sm text-gray-500">Responderemos en menos de 24 horas</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Tu email"
              type="email"
              value={user?.email || ''}
              disabled
              icon={Mail}
            />

            <Input
              label="Asunto"
              placeholder="¿En qué podemos ayudarte?"
              value={formData.asunto}
              onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
              required
            />

            <Textarea
              label="Mensaje"
              placeholder="Describe tu problema o pregunta con el mayor detalle posible..."
              value={formData.mensaje}
              onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
              rows={5}
              required
            />

            <Button type="submit" loading={sending} icon={Send} className="w-full">
              Enviar mensaje
            </Button>
          </form>
        </Card>

        {/* Resources */}
        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">Recursos útiles</h2>
            <div className="space-y-3">
              {resources.map((resource) => (
                <a
                  key={resource.title}
                  href={resource.link}
                  className="flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-gray-100">
                    <resource.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{resource.title}</p>
                    <p className="text-sm text-gray-500">{resource.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </Card>

          {/* Contact info */}
          <Card variant="flat">
            <h3 className="font-semibold text-gray-900 mb-4">Otros canales</h3>
            <div className="space-y-3">
              <a
                href="mailto:soporte@emprendego.com"
                className="flex items-center gap-3 text-gray-600 hover:text-blue-600"
              >
                <Mail className="w-5 h-5" />
                <span>soporte@emprendego.com</span>
              </a>
              <a
                href="https://wa.me/573001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-600 hover:text-green-600"
              >
                <MessageSquare className="w-5 h-5" />
                <span>WhatsApp de soporte</span>
              </a>
            </div>
          </Card>
        </div>
      </div>

      {/* FAQs */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-6">Preguntas frecuentes</h2>
        <Accordion items={faqs} />
      </Card>
    </div>
  )
}

export default Soporte
