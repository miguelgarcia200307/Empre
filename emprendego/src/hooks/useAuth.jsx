import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState(null) // 'admin' | 'emprendedor' | null
  const [initializing, setInitializing] = useState(true) // Solo carga inicial (bootstrap)
  const [authActionLoading, setAuthActionLoading] = useState(false) // Loading de acciones (signUp/signIn)

  useEffect(() => {
    let mounted = true
    let timeoutId = null

    // Verificar sesión actual
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }
        
        if (mounted) {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // Esperar el perfil para obtener el rol antes de terminar loading
            await fetchProfile(session.user.id)
          }
          
          setInitializing(false)
          if (timeoutId) clearTimeout(timeoutId)
        }
      } catch (error) {
        console.error('Error checking session:', error)
        if (mounted) {
          setInitializing(false)
        }
      }
    }

    // Timeout de seguridad - máximo 5 segundos de carga
    timeoutId = setTimeout(() => {
      if (mounted && initializing) {
        console.warn('Auth timeout - forzando estado de carga')
        setInitializing(false)
      }
    }, 5000)

    checkSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            fetchProfile(session.user.id)
          } else {
            setProfile(null)
            setRole(null)
          }
        }
      }
    )

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, avatar_url, role, onboarding_completed, created_at, updated_at')
        .eq('id', userId)
        .single()
      
      if (error) {
        // Si hay error 406 o PGRST116, intentar con maybeSingle
        if (error.code === 'PGRST116' || error.message?.includes('JSON')) {
          console.log('Perfil no encontrado, intentando crear...')
          await createProfileIfNotExists(userId)
          return
        }
        // Error 500 o problemas de RLS - intentar crear perfil
        if (error.message?.includes('500') || error.code === '42501') {
          console.log('Error RLS, intentando crear perfil...')
          await createProfileIfNotExists(userId)
          return
        }
        console.error('Error fetching profile:', error)
        // Aún así, establecer rol por defecto para no bloquear
        setRole('emprendedor')
        return
      }
      
      if (!data) {
        // Perfil no existe, crearlo
        await createProfileIfNotExists(userId)
        return
      }
      
      setProfile(data)
      setRole(data.role || 'emprendedor') // Actualizar el rol
    } catch (error) {
      console.error('Error fetching profile:', error)
      // En caso de error, establecer rol por defecto
      setRole('emprendedor')
    }
  }

  const createProfileIfNotExists = async (userId) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: userData.user.email,
          full_name: userData.user.user_metadata?.full_name || '',
          role: 'emprendedor',
        }, { onConflict: 'id' })
        .select()
        .single()

      if (!error && data) {
        setProfile(data)
        setRole(data.role || 'emprendedor')
      }
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  const signUp = async (email, password, metadata = {}) => {
    setAuthActionLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            role: 'emprendedor',
          },
        },
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setAuthActionLoading(false)
    }
  }

  const signIn = async (email, password) => {
    setAuthActionLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setAuthActionLoading(false)
    }
  }

  const signOut = async () => {
    setAuthActionLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
      setRole(null) // Limpiar rol
      localStorage.removeItem('emprendego_store_id')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setAuthActionLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { data: null, error: new Error('No autenticado') }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select('id, email, full_name, phone, avatar_url, role, onboarding_completed, created_at, updated_at')
        .single()
      
      if (error) throw error
      
      setProfile(data)
      if (data.role) setRole(data.role)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    user,
    profile,
    role, // Exponer rol
    initializing, // Solo carga inicial (bootstrap)
    authActionLoading, // Loading de acciones (signUp/signIn/signOut)
    loading: initializing, // Alias para compatibilidad
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: role === 'admin', // Helper para verificar admin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
