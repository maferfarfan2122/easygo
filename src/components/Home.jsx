// Componente Home - Landing page pública
import { useEffect } from 'react'
import Hero from './Hero'
import Tools from './Tools'
import Pricing from './Pricing'
import CTA from './CTA'
import Footer from './Footer'

const Home = () => {
  // SEO: Actualizar meta tags dinámicamente
  useEffect(() => {
    document.title = 'Easy Go - Crea CVs Profesionales con IA | Generador Inteligente'
    
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Crea currículums profesionales optimizados con IA. Analiza ofertas de trabajo y adapta tu CV automáticamente. Generador de CV inteligente en español.')
    }
  }, [])

  return (
    <>
      {/* SEO: Estructura semántica correcta */}
      <main role="main">
        <Hero />
        <Tools />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  )
}

export default Home
