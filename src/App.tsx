import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/Navbar'
import Home from './components/Home'
import SignIn from './components/SignIn'
import Dashboard from './components/Dashboard'
import CVBuilder from './components/CVBuilder'
import PDFOptimizer from './components/PDFOptimizer'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import ConfirmEmail from './components/ConfirmEmail'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tools/cv-builder" 
              element={
                <ProtectedRoute>
                  <CVBuilder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tools/pdf-optimizer" 
              element={
                <ProtectedRoute>
                  <PDFOptimizer />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  )
}

export default App
