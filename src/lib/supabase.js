// Configuración del cliente de Supabase
import { createClient } from '@supabase/supabase-js'

// Obtener las credenciales desde las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validar que las credenciales existan
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials are missing!')
  console.log('Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file')
}

// Crear y exportar el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
