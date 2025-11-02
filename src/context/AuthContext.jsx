// Context para manejar la autenticación de usuarios
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Verificar si hay una sesión activa al cargar
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Función para registrar un nuevo usuario
  const signUp = async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('SignUp error:', error)
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Función para iniciar sesión
  const signIn = async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('SignIn error:', error)
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } catch (error) {
      console.error('SignOut error:', error)
      setError(error.message)
    }
  }

  // Función para resetear contraseña
  const resetPassword = async (email) => {
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Función para actualizar contraseña
  const updatePassword = async (newPassword) => {
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Update password error:', error)
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
