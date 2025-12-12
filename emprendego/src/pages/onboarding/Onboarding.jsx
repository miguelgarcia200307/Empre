import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../hooks/useStore'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabaseClient'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '../../components/ui'
import BrandLogo from '../../components/BrandLogo'
import Step1Datos from './Step1Datos'
import Step2Identidad from './Step2Identidad'
import Step3PrimerProducto from './Step3PrimerProducto'

const steps = [
  { id: 1, name: 'Datos de tu negocio', description: 'Nombre y contacto' },
  { id: 2, name: 'Identidad visual', description: 'Logo y colores' },
  { id: 3, name: 'Tu primer producto', description: 'Opcional' },
]

// Función para subir logo a Supabase Storage
const uploadOnboardingLogo = async (file, storeId) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${storeId}/logo_${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('store-assets')
    .upload(fileName, file, { cacheControl: '3600', upsert: true })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from('store-assets')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

const Onboarding = () => {
  const navigate = useNavigate()
  const { createStore, updateStore } = useStore()
  const { updateProfile } = useAuth()
  const toast = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [storeData, setStoreData] = useState({
    // Step 1
    name: '',
    description: '',
    whatsapp: '',
    slug: '',
    // Step 2
    logo_url: null,
    logoFile: null, // File para subir a Storage
    primary_color: '#2563eb',
    secondary_color: '#7c3aed',
    // Step 3 (producto)
    firstProduct: null,
  })

  const updateData = (data) => {
    setStoreData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    
    // 1) Crear la tienda (sin logo blob - se sube después)
    const { data: createdStore, error } = await createStore({
      name: storeData.name,
      description: storeData.description,
      whatsapp: storeData.whatsapp,
      slug: storeData.slug,
      logo_url: null, // Se actualiza después si hay logoFile
      primary_color: storeData.primary_color,
      secondary_color: storeData.secondary_color,
    })

    if (error || !createdStore) {
      toast.error('Error al crear la tienda. Intenta de nuevo.')
      setLoading(false)
      return
    }

    // 2) Si hay logo, subirlo a Storage y actualizar store.logo_url
    if (storeData.logoFile) {
      try {
        const publicLogoUrl = await uploadOnboardingLogo(storeData.logoFile, createdStore.id)
        const { error: updateErr } = await updateStore({ logo_url: publicLogoUrl })
        if (updateErr) throw updateErr
      } catch (e) {
        console.error('Logo upload error:', e)
        toast.error('La tienda se creó, pero el logo no se pudo subir. Puedes subirlo luego en Diseño.')
        // NO cortar flujo - continúa
      }
    }

    // 3) Marcar onboarding_completed = true en profiles
    const { error: profErr } = await updateProfile({ onboarding_completed: true })
    if (profErr) {
      console.error('Profile update error:', profErr)
      toast.error('La tienda se creó, pero no se pudo finalizar el onboarding. Intenta recargar.')
      setLoading(false)
      return
    }

    // TODO: Si hay primer producto, crearlo también

    toast.success('¡Tu tienda ha sido creada exitosamente!')
    setLoading(false)
    navigate('/panel')
  }

  const handleSkip = async () => {
    await handleFinish()
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Datos data={storeData} onChange={updateData} />
      case 2:
        return <Step2Identidad data={storeData} onChange={updateData} />
      case 3:
        return <Step3PrimerProducto data={storeData} onChange={updateData} />
      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return storeData.name && storeData.whatsapp && storeData.slug
      case 2:
        return true // Opcional
      case 3:
        return true // Opcional
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <BrandLogo size="md" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-medium
                      transition-colors duration-200
                      ${currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{step.name}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                      flex-1 h-1 mx-4 rounded
                      ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                icon={ArrowLeft}
              >
                Atrás
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {currentStep === 3 && (
              <Button
                variant="secondary"
                onClick={handleSkip}
                loading={loading}
              >
                Omitir y finalizar
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                icon={ArrowRight}
                iconPosition="right"
              >
                Continuar
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                loading={loading}
                icon={Check}
                iconPosition="right"
              >
                Crear mi tienda
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
