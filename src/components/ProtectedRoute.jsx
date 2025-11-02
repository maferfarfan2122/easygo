// Componente para proteger rutas que requieren autenticación
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Mostrar loading mientras verifica la sesión
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div className="loading-spinner">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, redirigir a signin
  if (!user) {
    return <Navigate to="/signin" replace />
  }

  // Si hay usuario, mostrar el contenido protegido
  return children
}

export default ProtectedRoute
