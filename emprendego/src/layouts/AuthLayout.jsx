import { Outlet } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 flex-col justify-between">
        <div>
          <BrandLogo size="lg" variant="light" />
        </div>
        
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Tu tienda digital,<br />
            <span className="text-blue-200">lista en minutos.</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            Crea tu catálogo digital, comparte por WhatsApp y empieza a vender hoy mismo. 
            Sin complicaciones, sin código.
          </p>
          
          {/* Features */}
          <div className="mt-8 space-y-4">
            {[
              'Catálogo digital profesional',
              'Ventas por WhatsApp',
              'Código QR personalizado',
              'Panel de administración fácil',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-blue-100">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-blue-200 text-sm">
          © {new Date().getFullYear()} EmprendeGo. Todos los derechos reservados.
        </div>
      </div>
      
      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="mb-8 lg:hidden">
            <BrandLogo size="md" variant="dark" />
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
