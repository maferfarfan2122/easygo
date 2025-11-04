import { useEffect } from 'react'

interface SEOHeadProps {
  title: string
  description: string
  keywords?: string
  image?: string
  url?: string
}

export const SEOHead = ({ 
  title, 
  description, 
  keywords = '', 
  image = '/og-image.jpg',
  url = 'https://easygo.com.es'
}: SEOHeadProps) => {
  useEffect(() => {
    // Actualizar título
    document.title = `${title} | Easy Go`
    
    // Actualizar meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    }
    
    // Actualizar keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', keywords)
    }
    
    // Actualizar Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title)
    
    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) ogDescription.setAttribute('content', description)
    
    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage) ogImage.setAttribute('content', `https://easygo.com.es${image}`)
    
    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) ogUrl.setAttribute('content', url)
    
    // Actualizar Twitter Card
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) twitterTitle.setAttribute('content', title)
    
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (twitterDescription) twitterDescription.setAttribute('content', description)
    
    const twitterImage = document.querySelector('meta[name="twitter:image"]')
    if (twitterImage) twitterImage.setAttribute('content', `https://easygo.com.es${image}`)
    
    // Actualizar canonical
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
  }, [title, description, keywords, image, url])

  return null
}
