export const texts = {
  navbar: {
    brand: "Easy Go",
    home: "Home",
    tools: "Tools",
    pricing: "Pricing",
    signIn: "Sign In",
    ariaLabels: {
      home: "Navigate to homepage",
      tools: "Explore our AI tools and features",
      pricing: "View pricing plans",
      signIn: "Access your account"
    }
  },
  
  hero: {
    title: "Productivity tools designed for you.",
    subtitle: "Easy Go brings together powerful productivity tools in one beautiful platform. Simple. Intuitive. Powerful.",
    primaryCTA: "Explore Tools",
    secondaryCTA: "Learn More",
    benefits: [
      "Professional-grade tools at your fingertips",
      "Clean, intuitive interface you'll love using",
      "More tools coming soon"
    ],
    description: "Easy Go is your productivity hub. Start with our AI-powered CV builder, and stay tuned for more tools designed to make your work life easier."
  },
  
  tools: {
    heading: "Tools that work as beautifully as they look.",
    intro: "Easy Go is building a suite of productivity tools. Start with what's available today, and discover more as we grow.",
    features: [
      {
        title: "CV Builder",
        subtitle: "Create professional resumes with AI assistance.",
        benefits: [
          "AI-powered content optimization",
          "ATS-friendly templates",
          "Instant PDF export"
        ],
        imageAlt: "Easy Go CV Builder interface",
        available: true,
        badge: "Available Now"
      },
      {
        title: "PDF Optimizer",
        subtitle: "Optimize your CV PDF without AI - 100% Free!",
        benefits: [
          "Replace weak verbs with action verbs",
          "ATS score analysis",
          "No tokens required"
        ],
        imageAlt: "Easy Go PDF Optimizer",
        available: true,
        badge: "New - Free"
      },
      {
        title: "Portfolio Generator",
        subtitle: "Showcase your work in minutes.",
        benefits: [
          "Beautiful responsive designs",
          "Drag-and-drop simplicity",
          "Custom domain support"
        ],
        imageAlt: "Easy Go Portfolio Generator",
        available: false,
        badge: "Coming Soon"
      },
      {
        title: "Email Signature",
        subtitle: "Professional signatures made simple.",
        benefits: [
          "Multiple design templates",
          "Social media integration",
          "Mobile-responsive"
        ],
        imageAlt: "Easy Go Email Signature tool",
        available: false,
        badge: "Coming Soon"
      },
      {
        title: "Link Manager",
        subtitle: "All your links in one beautiful page.",
        benefits: [
          "Unlimited links",
          "Analytics dashboard",
          "Custom branding"
        ],
        imageAlt: "Easy Go Link Manager",
        available: false,
        badge: "Coming Soon"
      },
      {
        title: "QR Code Generator",
        subtitle: "Create custom QR codes instantly.",
        benefits: [
          "High-resolution exports",
          "Custom colors and logos",
          "Track scans and analytics"
        ],
        imageAlt: "Easy Go QR Code Generator",
        available: false,
        badge: "Coming Soon"
      },
      {
        title: "Invoice Creator",
        subtitle: "Professional invoices in seconds.",
        benefits: [
          "Customizable templates",
          "Automatic calculations",
          "Client management"
        ],
        imageAlt: "Easy Go Invoice Creator",
        available: false,
        badge: "Coming Soon"
      }
    ]
  },
  
  pricing: {
    heading: "Simple, transparent pricing",
    intro: "Choose the plan that's right for you. Start with our CV Builder, free forever.",
    plans: [
      {
        name: "Free",
        tagline: "Perfect to get started.",
        price: "$0",
        features: [
          "1 AI-optimized CV per month",
          "Basic templates",
          "PDF export",
          "ATS compatibility check",
          "Community support"
        ],
        bestFor: "Testing the CV Builder or creating your first professional resume.",
        cta: "Start Free"
      },
      {
        name: "Pro",
        tagline: "For professionals.",
        price: "$9/month",
        features: [
          "Unlimited AI CVs",
          "All premium templates",
          "Priority support",
          "Advanced ATS optimization",
          "Cover letter generator",
          "Early access to new tools"
        ],
        bestFor: "Job seekers and professionals who need multiple CVs.",
        cta: "Get Pro",
        popular: true
      },
      {
        name: "Business",
        tagline: "For teams and agencies.",
        price: "$29/month",
        features: [
          "Everything in Pro",
          "Team collaboration (10 users)",
          "Bulk CV creation",
          "API access",
          "White-label option",
          "Dedicated support"
        ],
        bestFor: "Career coaches and recruitment agencies.",
        cta: "Contact Sales"
      }
    ],
    faq: {
      title: "Frequently Asked Questions",
      questions: [
        {
          question: "Can I cancel my subscription anytime?",
          answer: "Yes. Cancel anytime with no fees. Your CVs remain accessible until your billing period ends."
        },
        {
          question: "Is there a free trial?",
          answer: "Pro and Business plans include a 7-day money-back guarantee. Try risk-free."
        },
        {
          question: "How does billing work?",
          answer: "Plans are billed monthly. You can upgrade or cancel from your dashboard."
        }
      ]
    }
  },
  
  signIn: {
    heading: "Welcome back to Easy Go.",
    intro: "Sign in to continue building your websites.",
    emailPlaceholder: "Enter your email address",
    passwordPlaceholder: "Enter your password",
    submitButton: "Sign in",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    successMessage: "Welcome back! Redirecting to your dashboard...",
    errorMessage: "Invalid email or password. Please try again.",
    securityNote: "Your data is encrypted and secure. We never share your information.",
    // New texts for Sign Up
    signUpHeading: "Create your account",
    signUpIntro: "Start building websites with AI in minutes",
    confirmPasswordPlaceholder: "Confirm your password",
    signUpButton: "Create Account",
    signUpSuccess: "Account created! Please check your email to verify your account.",
    passwordMismatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters",
    toggleToSignUp: "Don't have an account? Sign Up",
    toggleToSignIn: "Already have an account? Sign In",
    // Password Reset
    resetPasswordHeading: "Reset your password",
    resetPasswordIntro: "Enter your email to receive a password reset link",
    resetPasswordButton: "Send Reset Link",
    resetPasswordSuccess: "Password reset link sent! Check your email.",
    backToSignIn: "Back to Sign In"
  },
  
  dashboard: {
    heading: "Welcome to Easy Go Dashboard",
    greeting: "Hello",
    accountStatus: "Account Status",
    verified: "Verified",
    notVerified: "Not Verified",
    stats: {
      websites: "AI Websites",
      projects: "Projects",
      templates: "Templates"
    },
    actions: {
      createWebsite: "Create New Website",
      backHome: "Back to Home",
      signOut: "Sign Out"
    },
    gettingStarted: "Getting Started",
    startBuilding: "Start creating your first AI-powered website!"
  },
  
  cta: {
    headline: "Ready to boost your productivity?",
    supporting: "Start with our CV Builder today, and stay tuned for more powerful tools coming soon.",
    primaryCTA: "Start for free",
    secondaryCTA: "Learn more",
    reassurance: [
      "Free to start. Upgrade anytime.",
      "Cancel anytime. No commitments.",
      "Bank-level security."
    ]
  },
  
  footer: {
    about: "Easy Go is a productivity platform that brings together powerful tools in one beautiful interface. Start with our AI-powered CV builder, and discover more tools as we grow.",
    links: {
      about: "About",
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact"
    },
    social: "Follow us on Twitter, LinkedIn, and GitHub.",
    copyright: "© 2025 Easy Go. All rights reserved.",
    tagline: "Built with ❤️ for professionals everywhere."
  }
};
