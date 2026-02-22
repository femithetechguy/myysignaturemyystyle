'use client'

import { getAppConfig, getContent, getGallery, getCareers } from '@/lib/config'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { FiInstagram } from 'react-icons/fi'
import Gallery from '@/components/Gallery'

export default function Home() {
  const appConfig = getAppConfig()
  const [services, setServices] = useState([])
  const business = appConfig.business
  const content = getContent()
  const gallery = getGallery()
  const careers = getCareers()
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [navBackground, setNavBackground] = useState('dark')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [messageType, setMessageType] = useState('inquiry')
  const [selectedService, setSelectedService] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedCategory, setSelectedCategory] = useState('Cuts')
  const [selectedBookingCategory, setSelectedBookingCategory] = useState('')
  const [selectedBookingService, setSelectedBookingService] = useState<{ id: string; name: string; price: number } | null>(null)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [bookingName, setBookingName] = useState('')
  const [bookingContact, setBookingContact] = useState('')
  const [bookingEmail, setBookingEmail] = useState('')
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [bookingReference, setBookingReference] = useState('')
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)
  const [applicationData, setApplicationData] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    employment_type: '',
    license_number: '',
    years_experience: '',
    specialties: '',
    portfolio_url: '',
    certifications: '',
    availability: '',
    why_join: '',
    references: ''
  })
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)

      // Detect background color based on scroll position
      const heroHeight = window.innerHeight
      const scrollPos = window.scrollY

      // Hero section (dark) - 0 to ~100vh
      if (scrollPos < heroHeight) {
        setNavBackground('dark')
      }
      // Services section (white) - ~100vh to ~200vh
      else if (scrollPos < heroHeight * 2.5) {
        setNavBackground('light')
      }
      // About (white)
      else if (scrollPos < heroHeight * 4) {
        setNavBackground('light')
      }
      // CTA & Footer (dark)
      else {
        setNavBackground('dark')
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch services from database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        if (response.ok) {
          const data = await response.json()
          setServices(data)
        } else {
          console.error('Failed to fetch services')
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }

    fetchServices()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMessageClick = () => {
    setShowModal(true)
  }

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate form fields
    const errors: { [key: string]: string } = {}
    
    if (!name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (!contact.trim()) {
      errors.contact = 'Email or phone is required'
    } else if (!/^\S+@\S+\.\S+$/.test(contact) && !/^[\d\s()\-+]+$/.test(contact)) {
      errors.contact = 'Please enter a valid email or phone number'
    }
    
    if (!message.trim()) {
      errors.message = 'Message is required'
    }
    
    if (messageType === 'booking' && !selectedService) {
      errors.service = 'Please select a service'
    }
    
    setFormErrors(errors)
    
    // Only submit if no errors
    if (Object.keys(errors).length === 0) {
      setSubmitted(true)
      setTimeout(() => {
        setShowModal(false)
        setName('')
        setContact('')
        setMessage('')
        setMessageType('inquiry')
        setSelectedService('')
        setSubmitted(false)
        setFormErrors({})
      }, 2000)
    }
  }

  const handleScheduleClick = () => {
    setShowBookingModal(true)
    setSelectedDate(new Date())
    setSelectedBookingCategory(getCategories()[0] || 'Cuts')
    setFormErrors({})
    setBookingName('')
    setBookingContact('')
    setBookingEmail('')
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const days = []

    // Previous month's trailing days
    const prevMonthDays = getDaysInMonth(currentMonth - 1, currentMonth === 0 ? currentYear - 1 : currentYear)
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentMonth === 0 ? currentYear - 1 : currentYear, currentMonth === 0 ? 11 : currentMonth - 1, prevMonthDays - i),
        isCurrentMonth: false
      })
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true
      })
    }

    // Next month's leading days
    const totalCells = Math.ceil((days.length) / 7) * 7
    for (let i = 1; i <= totalCells - days.length; i++) {
      days.push({
        date: new Date(currentMonth === 11 ? currentYear + 1 : currentYear, currentMonth === 11 ? 0 : currentMonth + 1, i),
        isCurrentMonth: false
      })
    }

    return days
  }

  const getCategories = () => {
    const categories = Array.from(new Set(services.map(s => s.category)))
    return categories.sort()
  }

  const getServicesByCategory = (category: string) => {
    return services.filter(s => s.category === category)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <header className={`fixed top-0 w-full px-4 sm:px-8 md:px-16 py-5 sm:py-6 md:py-6 flex justify-center md:justify-center items-center z-50 transition-all duration-300 ${
        showMobileMenu
          ? 'bg-transparent backdrop-blur-0'
          : navBackground === 'dark' 
          ? 'bg-black/30 backdrop-blur-md' 
          : navBackground === 'secondary'
          ? 'bg-black/50 backdrop-blur-md'
          : 'bg-white/95 backdrop-blur-sm'
      }`}>
        {/* Brand Logo - Mobile Only */}
        <button 
          onClick={() => {
            // Close booking modal and return home
            if (showBookingModal) {
              setShowBookingModal(false)
              setBookingName('')
              setBookingEmail('')
              setBookingContact('')
              setSelectedBookingService(null)
              setSelectedDate(null)
              setFormErrors({})
            }
            // Always scroll to home
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="absolute left-4 sm:left-8 md:hidden hover:opacity-80 transition-opacity"
        >
          <Image src="/assets/images/others/logo_trans.png" alt="Logo" width={80} height={80} className="h-20 w-auto" />
        </button>

        {/* Brand Logo - Desktop */}
        <button 
          onClick={() => {
            // Close booking modal and return home
            if (showBookingModal) {
              setShowBookingModal(false)
              setBookingName('')
              setBookingEmail('')
              setBookingContact('')
              setSelectedBookingService(null)
              setSelectedDate(null)
              setFormErrors({})
            }
            // Always scroll to home
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="hidden md:block absolute left-8 hover:opacity-80 transition-opacity"
        >
          <Image src="/assets/images/others/logo_trans.png" alt="Logo" width={112} height={112} className="h-28 w-auto" />
        </button>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden md:flex gap-8 lg:gap-20 justify-center">
          {content.navigation.links.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className={`transition-all duration-300 text-sm lg:text-base uppercase hover:scale-110 font-bold tracking-wide ${
                navBackground === 'dark'
                  ? 'text-white hover:text-accent-light'
                  : navBackground === 'secondary'
                  ? 'text-white hover:text-accent-light'
                  : 'text-white hover:text-accent'
              }`}
              style={{textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.6)'}}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile Menu Button - Right Side */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={`absolute right-4 sm:right-8 md:hidden transition-colors duration-300 ${
            navBackground === 'dark'
              ? 'text-white hover:text-white/80'
              : navBackground === 'secondary'
              ? 'text-white hover:text-white/80'
              : 'text-primary hover:text-primary/80'
          }`}
          style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            {showMobileMenu ? (
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            ) : (
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Navigation Dropdown */}
      {showMobileMenu && (
        <div className="fixed top-0 left-0 right-0 bg-black/60 z-40 md:hidden animate-fade-in-down pt-20">
          <nav className="flex flex-col gap-0 py-0">
            {content.navigation.links.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                onClick={() => setShowMobileMenu(false)}
                className="px-6 py-4 text-white hover:bg-white/15 transition-all duration-300 uppercase text-base font-bold tracking-wider border-b border-white/20 last:border-b-0 text-right"
                style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-primary">
        {/* Background Image */}
        <Image
          src="/assets/images/others/landing.png"
          alt="Myy Signature Hair Salon"
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          quality={85}
        />
        
        {/* Dark overlay for text readability - Enhanced for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/40 z-10"></div>
        
        {/* Content */}
        <div className="relative z-20 text-center max-w-4xl px-4 sm:px-6">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light mb-2 sm:mb-3 tracking-widest text-white uppercase animate-fade-in-down drop-shadow-lg">{content.hero.title}</h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-wider mb-8 sm:mb-10 md:mb-12 text-secondary uppercase animate-fade-in-up drop-shadow-md">{content.hero.subtitle}</h2>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <button 
              onClick={() => setShowBookingModal(true)}
              className="inline-block bg-accent hover:bg-transparent text-white hover:text-accent px-10 sm:px-14 md:px-16 py-3 sm:py-4 md:py-5 rounded font-light uppercase tracking-widest text-sm sm:text-base md:text-lg transition-all duration-300 border-2 border-accent animate-fade-in hover:scale-110 hover:shadow-2xl hover:drop-shadow-lg active:scale-95 shadow-lg"
            >
              {content.hero.cta_button}
            </button>
            <a 
              href="#careers"
              className="inline-block bg-transparent hover:bg-secondary text-white hover:text-primary px-10 sm:px-14 md:px-16 py-3 sm:py-4 md:py-5 rounded font-light uppercase tracking-widest text-sm sm:text-base md:text-lg transition-all duration-300 border-2 border-secondary animate-fade-in hover:scale-110 hover:shadow-2xl hover:drop-shadow-lg active:scale-95 shadow-lg"
            >
              JOIN OUR STYLISTS
            </a>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="container-custom py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Services Section */}
      <section id="services" className="py-16 sm:py-20 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-primary animate-fade-in-up">{content.services_section.title}</h2>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-12">
            {getCategories().map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                  selectedCategory === category
                    ? 'bg-accent text-white shadow-lg scale-105'
                    : 'bg-secondary/20 text-primary hover:bg-secondary/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {getServicesByCategory(selectedCategory).map((service, index) => (
              <div key={service.id} className="card hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-primary flex-1">{service.name}</h3>
                  <span className="ml-2 px-2 py-1 bg-accent/20 text-accent text-xs font-bold rounded">{service.category}</span>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-4">{service.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-accent">${service.price}</span>
                  <span className="text-xs sm:text-sm text-gray-500">{service.duration} min</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedBookingService({ id: service.id, name: service.name, price: service.price })
                    setSelectedBookingCategory(service.category)
                    setShowBookingModal(true)
                    setSelectedDate(new Date())
                  }}
                  className="w-full bg-accent hover:bg-accent-light text-white font-bold py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base"
                >
                  Schedule Appointment
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="container-custom py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Gallery Section */}
      <section id="gallery" className="bg-white">
        <Gallery items={gallery?.items || []} instagramUrl={business.social.instagram} posts={gallery?.instagram_posts || []} />
      </section>

      {/* Section Divider */}
      <div className="container-custom py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Booking Section */}
      <section id="book" className="py-16 sm:py-20 bg-white">
        <div className="container-custom">
          {/* Booking CTA */}
          <div className="mb-12 sm:mb-16 text-center bg-secondary/10 border border-accent/30 rounded-lg p-8 sm:p-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-4">{content.reviews_section.cta_title}</h3>
            <p className="text-primary/80 mb-6 text-base sm:text-lg">{content.reviews_section.cta_subtitle}</p>
            <button onClick={handleScheduleClick} className="btn-accent text-sm sm:text-base hover:scale-105 active:scale-95">{content.reviews_section.cta_button}</button>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary animate-fade-in-down">{content.reviews_section.title}</h2>
            <p className="text-base sm:text-lg text-primary/80 animate-fade-in-up">{content.reviews_section.subtitle}</p>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {content.reviews_section.reviews.map((review, index) => (
              <div 
                key={index}
                className="bg-secondary/10 border border-accent/20 rounded-lg p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up hover:border-accent"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-primary/80 mb-4 italic text-sm sm:text-base">&quot;{review.text}&quot;</p>

                {/* Author */}
                <p className="text-primary font-semibold">- {review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="container-custom py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Careers Section */}
      <section id="careers" className="py-16 sm:py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">{careers.tagline}</h2>
            <p className="text-lg text-primary/80 max-w-2xl mx-auto">{careers.introduction}</p>
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-8">Open Positions</h3>
            <div className="space-y-6 max-w-4xl mx-auto">
              {careers.open_positions.map((position) => (
                <div
                  key={position.id}
                  className="bg-white border border-accent/20 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-accent"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="mb-4 sm:mb-0">
                      <h4 className="text-xl font-bold text-primary mb-2">{position.title}</h4>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-3 py-1 bg-accent/10 text-accent rounded-full font-medium">{position.type}</span>
                        <span className="px-3 py-1 bg-secondary/20 text-primary rounded-full">📍 {position.location}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPosition(position.title)
                        setApplicationData({ ...applicationData, position: position.title })
                        setShowApplicationModal(true)
                      }}
                      className="btn-accent text-sm whitespace-nowrap"
                    >
                      JOIN OUR STYLISTS
                    </button>
                  </div>
                  <p className="text-primary/80 text-sm mb-4">{position.description}</p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-bold text-primary text-sm mb-2">Key Requirements:</h5>
                      <ul className="space-y-1 text-xs text-primary/80">
                        {position.requirements.slice(0, 3).map((req, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-accent mr-2">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-bold text-primary text-sm mb-2">Responsibilities:</h5>
                      <ul className="space-y-1 text-xs text-primary/80">
                        {position.responsibilities.slice(0, 3).map((resp, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-accent mr-2">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {careers.benefits.map((benefit, index) => (
              <div
                key={benefit.id}
                className="bg-white border border-accent/20 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-accent animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-primary mb-3">{benefit.title}</h3>
                <p className="text-primary/80 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Team Culture */}
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-primary mb-6">{careers.team_culture.title}</h3>
            <p className="text-primary/80 mb-8">{careers.team_culture.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {careers.team_culture.values.slice(0, 4).map((value, index) => (
                <div key={index} className="bg-white border border-accent/20 rounded-lg p-4 text-center hover:shadow-lg transition-all duration-300">
                  <h4 className="font-bold text-primary mb-2 text-sm">{value.title}</h4>
                  <p className="text-primary/70 text-xs">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="container-custom py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="animate-slide-in-left">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-primary">{content.about_section.title}</h2>
              <p className="text-base sm:text-lg text-primary mb-4">
                {appConfig.app.description}
              </p>
              <p className="text-sm sm:text-base text-primary/80 mb-6">
                {content.about_section.location_text.replace('{ADDRESS}', business.address)}
              </p>
              <div className="space-y-2 text-sm sm:text-base">
                <p className="text-primary"><strong>Phone:</strong> {business.contact.phone}</p>
                <p className="text-primary"><strong>Email:</strong> {business.contact.email}</p>
                <p className="text-primary"><strong>Location:</strong> {business.county}, {business.state}</p>
              </div>
            </div>
            <div className="bg-secondary rounded-lg p-6 sm:p-8 text-center border border-accent/30 animate-slide-in-right hover:shadow-lg transition-all duration-300">
              <p className="text-3xl sm:text-5xl font-bold text-accent mb-2">{content.about_section.stat_1_value}</p>
              <p className="text-sm sm:text-base text-primary font-medium">{content.about_section.stat_1_label}</p>
              <hr className="my-4 sm:my-6 border-accent/50" />
              <p className="text-3xl sm:text-5xl font-bold text-accent mb-2">{content.about_section.stat_2_value}</p>
              <p className="text-sm sm:text-base text-primary font-medium">{content.about_section.stat_2_label}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="container-custom py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary text-center mb-4 animate-fade-in-up">{content.footer.sections.contact.title}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 mt-12">
              {/* Contact Information */}
              <div className="flex flex-col justify-center animate-fade-in-up">
                <div className="mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">Visit Us</h3>
                  <p className="text-sm sm:text-base text-primary/80">{business.address}</p>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">Call Us</h3>
                  <a href={`tel:${business.contact.phone}`} className="text-sm sm:text-base text-accent hover:text-accent/80 transition-colors duration-300">
                    {business.contact.phone}
                  </a>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">Email Us</h3>
                  <a href={`mailto:${business.contact.email}`} className="text-sm sm:text-base text-accent hover:text-accent/80 transition-colors duration-300">
                    {business.contact.email}
                  </a>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">{content.footer.sections.hours.title}</h3>
                  <p className="text-xs sm:text-sm text-primary/80 mb-1">{content.footer.sections.hours.mon_fri}</p>
                  <p className="text-xs sm:text-sm text-primary/80 mb-1">{content.footer.sections.hours.saturday}</p>
                  <p className="text-xs sm:text-sm text-primary/80">{content.footer.sections.hours.sunday}</p>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">{content.footer.sections.follow.title}</h3>
                  <div className="flex gap-4">
                    {business.social.instagram && (
                      <a 
                        href={business.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary/70 hover:text-accent transition-colors duration-300"
                        aria-label="Instagram"
                      >
                        <FiInstagram className="w-6 h-6" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="flex flex-col justify-center animate-fade-in-up">
                <h3 className="text-lg sm:text-xl font-bold text-primary mb-6">Send us a Message</h3>
                <button 
                  type="button"
                  onClick={handleMessageClick}
                  className="btn-accent text-sm sm:text-base hover:scale-105 active:scale-95 shadow-lg font-semibold w-full"
                >
                  Leave A Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-secondary py-12 sm:py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="animate-fade-in-up text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-bold mb-4">{content.footer.sections.navigation.title}</h3>
              <ul className="space-y-2">
                {content.footer.sections.navigation.links.map((link) => (
                  <li key={link.href}>
                    <a 
                      href={link.href}
                      className="text-xs sm:text-sm text-secondary/80 hover:text-accent transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="animate-fade-in-up text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-bold mb-4">{content.footer.sections.contact.title}</h3>
              <p className="text-xs sm:text-sm text-secondary/90">{business.address}</p>
              <p className="text-xs sm:text-sm text-secondary/90 mt-2">{business.contact.phone}</p>
              <p className="text-xs sm:text-sm text-secondary/90">{business.contact.email}</p>
            </div>
            <div className="animate-fade-in-up text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-bold mb-4">{content.footer.sections.hours.title}</h3>
              <p className="text-xs sm:text-sm text-secondary/90">{content.footer.sections.hours.mon_fri}</p>
              <p className="text-xs sm:text-sm text-secondary/90">{content.footer.sections.hours.saturday}</p>
              <p className="text-xs sm:text-sm text-secondary/90">{content.footer.sections.hours.sunday}</p>
            </div>
            <div className="animate-fade-in-up text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-bold mb-4">{content.footer.sections.follow.title}</h3>
              <div className="flex gap-4 justify-center sm:justify-start">
                {business.social.instagram && (
                  <a 
                    href={business.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary/70 hover:text-accent transition-colors duration-300"
                    aria-label="Instagram"
                  >
                    <FiInstagram className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <hr className="border-secondary/30 mb-6" />
          <div className="text-center text-secondary/70 text-xs sm:text-sm">
            <p>{content.footer.copyright.replace('{APP_NAME}', appConfig.app.name)}</p>
            <p className="text-xs mt-2">
              <a 
                href={content.footer.developed_by_link || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors duration-300"
              >
                {content.footer.developed_by}
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Icon Button */}
      <button
        onClick={handleMessageClick}
        className="fixed bottom-8 right-8 w-14 h-14 bg-accent hover:bg-accent-light text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 z-50 animate-fade-in drop-shadow-lg"
        aria-label="Open message"
      >
        <svg
          className="w-7 h-7"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </button>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-8 w-12 h-12 bg-accent hover:bg-accent text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 z-40 animate-fade-in"
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}

      {/* Message Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-primary text-white p-6 flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold">{content.message_modal?.title || 'Send us a Message'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:opacity-70 transition-opacity"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            {!submitted ? (
              <form onSubmit={handleSubmitMessage} className="p-6 space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    {content.message_modal?.fields?.name || 'Name'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition text-primary placeholder-gray-400 ${
                      formErrors.name
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-secondary/30 focus:border-accent focus:ring-accent/20'
                    }`}
                    placeholder="Your name"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                {/* Contact Input */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    {content.message_modal?.fields?.contact || 'Email or Phone'}
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition text-primary placeholder-gray-400 ${
                      formErrors.contact
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-secondary/30 focus:border-accent focus:ring-accent/20'
                    }`}
                    placeholder="your@email.com or (123) 456-7890"
                  />
                  {formErrors.contact && <p className="text-red-500 text-xs mt-1">{formErrors.contact}</p>}
                </div>

                {/* Message Type Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    {content.message_modal?.fields?.message_type || 'Message Type'}
                  </label>
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-white text-primary font-medium"
                  >
                    {content.message_types?.map((type) => (
                      <option key={type.id} value={type.id} className="text-primary font-medium">
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conditional Service Dropdown */}
                {messageType === 'booking' && (
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      {content.message_modal?.fields?.service || 'Service'}
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white text-primary font-medium transition ${
                        formErrors.service
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-secondary/30 focus:border-accent focus:ring-accent/20'
                      }`}
                    >
                      <option value="" className="text-secondary">Select a service</option>
                      {services?.map((service) => (
                        <option key={service.id} value={service.name} className="text-primary font-medium">
                          {service.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.service && <p className="text-red-500 text-xs mt-1">{formErrors.service}</p>}
                  </div>
                )}

                {/* Message Textarea */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    {content.message_modal?.fields?.message || 'Message'}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none transition text-primary placeholder-gray-400 ${
                      formErrors.message
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-secondary/30 focus:border-accent focus:ring-accent/20'
                    }`}
                    placeholder={content.message_modal?.fields?.message_placeholder || 'Tell us more...'}
                  />
                  {formErrors.message && <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent-light text-white font-bold py-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                >
                  {content.message_modal?.submit_button || 'Send Message'}
                </button>
              </form>
            ) : (
              /* Success Message */
              <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                <svg className="w-16 h-16 text-accent mb-4 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <h3 className="text-xl font-bold text-primary mb-2">
                  {content.message_modal?.success_title || 'Message Sent!'}
                </h3>
                <p className="text-center text-secondary">
                  {content.message_modal?.success_message || 'Thank you for your message. We\'ll get back to you soon!'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in-down">
            {/* Modal Header */}
            <div className="sticky top-0 bg-primary text-secondary p-6 flex justify-between items-center border-b border-accent/20">
              <h2 className="text-2xl font-bold">{content.reviews_section.cta_button}</h2>
              <button
                onClick={() => {
                  setShowBookingModal(false)
                  setBookingName('')
                  setBookingEmail('')
                  setBookingContact('')
                  setSelectedBookingService(null)
                  setSelectedDate(null)
                  setFormErrors({})
                  // Scroll to home
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="text-secondary/70 hover:text-secondary transition-colors text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePrevMonth}
                  className="px-4 py-2 bg-secondary/20 hover:bg-secondary/30 text-primary rounded transition-colors"
                >
                  ←
                </button>
                <h3 className="text-xl font-bold text-primary">
                  {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="px-4 py-2 bg-secondary/20 hover:bg-secondary/30 text-primary rounded transition-colors"
                >
                  →
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="space-y-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-bold text-primary/60">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                  {generateCalendarDays().map((dayObj, idx) => {
                    const isCurrentMonth = dayObj.isCurrentMonth
                    const isTodayDate = isToday(dayObj.date)
                    const isPast = isPastDate(dayObj.date)
                    const isSelected = selectedDate && dayObj.date.toDateString() === selectedDate.toDateString()

                    return (
                      <button
                        key={idx}
                        onClick={() => !isPast && setSelectedDate(new Date(dayObj.date))}
                        disabled={isPast}
                        className={`
                          aspect-square rounded-lg font-semibold text-sm transition-all duration-200
                          ${!isCurrentMonth ? 'text-primary/30 bg-transparent cursor-default' : ''}
                          ${isTodayDate ? 'bg-accent text-white ring-2 ring-accent ring-offset-1' : ''}
                          ${isSelected && !isTodayDate ? 'bg-primary text-white ring-2 ring-primary ring-offset-1' : ''}
                          ${isCurrentMonth && !isTodayDate && !isSelected && !isPast ? 'bg-secondary/20 hover:bg-secondary/40 text-primary cursor-pointer' : ''}
                          ${isCurrentMonth && !isTodayDate && !isSelected && !isPast ? 'hover:shadow-md' : ''}
                          ${isPast && isCurrentMonth ? 'text-primary/40 bg-secondary/10 cursor-not-allowed' : ''}
                        `}
                      >
                        {dayObj.date.getDate()}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Selected Date Display */}
              {selectedDate && (
                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
                  <p className="text-sm text-primary/70 mb-1">Selected Date:</p>
                  <p className="text-lg font-bold text-primary">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}

              {/* Customer Information */}
              <div className="space-y-4 border-b border-secondary/20 pb-6">
                <h3 className="text-lg font-bold text-primary">Your Information</h3>
                
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Full Name</label>
                  <input
                    type="text"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition text-primary placeholder-gray-400 ${
                      formErrors.bookingName
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-secondary/30 focus:border-accent focus:ring-accent/20'
                    }`}
                    placeholder="John Doe"
                  />
                  {formErrors.bookingName && <p className="text-red-500 text-xs mt-1">{formErrors.bookingName}</p>}
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Email</label>
                  <input
                    type="email"
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition text-primary placeholder-gray-400 ${
                      formErrors.bookingEmail
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-secondary/30 focus:border-accent focus:ring-accent/20'
                    }`}
                    placeholder="john@example.com"
                  />
                  {formErrors.bookingEmail && <p className="text-red-500 text-xs mt-1">{formErrors.bookingEmail}</p>}
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={bookingContact}
                    onChange={(e) => setBookingContact(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition text-primary placeholder-gray-400 ${
                      formErrors.bookingContact
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-secondary/30 focus:border-accent focus:ring-accent/20'
                    }`}
                    placeholder="(123) 456-7890"
                  />
                  {formErrors.bookingContact && <p className="text-red-500 text-xs mt-1">{formErrors.bookingContact}</p>}
                </div>
              </div>

              {/* Service Category Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-primary">Select Service Category:</label>
                <select
                  value={selectedBookingCategory}
                  onChange={(e) => setSelectedBookingCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-secondary/30 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-white text-primary font-medium"
                >
                  {getCategories().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Services in Selected Category */}
              {selectedBookingCategory && (
                <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4">
                  <p className="text-sm font-bold text-primary mb-3">Services in {selectedBookingCategory}:</p>
                  <div className="space-y-2">
                    {getServicesByCategory(selectedBookingCategory).map((service) => (
                      <div key={service.id} className="flex justify-between items-center text-xs sm:text-sm py-2 px-2 rounded hover:bg-secondary/10 transition">
                        <div className="flex-1">
                          <p className="text-primary font-medium">{service.name}</p>
                          <p className="text-accent font-semibold">${service.price}</p>
                        </div>
                        <button
                          onClick={() => setSelectedBookingService({ id: service.id, name: service.name, price: service.price })}
                          className={`ml-2 px-3 py-1 rounded text-xs sm:text-sm font-bold transition ${
                            selectedBookingService?.id === service.id
                              ? 'bg-accent text-white'
                              : 'bg-secondary/20 text-primary hover:bg-accent hover:text-white'
                          }`}
                        >
                          {selectedBookingService?.id === service.id ? '✓ Selected' : 'Book'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Service Display */}
              {selectedBookingService && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                  <p className="text-xs text-primary/70 mb-1">Selected Service:</p>
                  <p className="text-sm font-bold text-accent">{selectedBookingService.name}</p>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={() => {
                  // Validate all required fields
                  const errors: { [key: string]: string } = {}
                  
                  if (!bookingName.trim()) {
                    errors.bookingName = 'Name is required'
                  }
                  
                  if (!bookingEmail.trim()) {
                    errors.bookingEmail = 'Email is required'
                  } else if (!/^\S+@\S+\.\S+$/.test(bookingEmail)) {
                    errors.bookingEmail = 'Please enter a valid email'
                  }
                  
                  if (!bookingContact.trim()) {
                    errors.bookingContact = 'Phone number is required'
                  } else if (!/^[\d\s()\-+]+$/.test(bookingContact)) {
                    errors.bookingContact = 'Please enter a valid phone number'
                  }
                  
                  setFormErrors(errors)
                  
                  if (selectedDate && selectedBookingService && Object.keys(errors).length === 0) {
                    // Show confirmation modal
                    setShowConfirmationModal(true)
                  }
                }}
                disabled={!selectedDate || !selectedBookingService}
                className="w-full bg-accent hover:bg-accent-light disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
              >
                {selectedBookingService ? 'Confirm Booking' : 'Select a Service to Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {showConfirmationModal && selectedDate && selectedBookingService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-fade-in-down">
            {/* Modal Header */}
            <div className="bg-primary text-secondary p-6 border-b border-accent/20">
              <h2 className="text-2xl font-bold">Confirm Your Booking</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Booking Summary */}
              <div className="space-y-4">
                {/* Date */}
                <div className="pb-4 border-b border-secondary/20">
                  <p className="text-xs text-primary/60 font-semibold mb-1">APPOINTMENT DATE</p>
                  <p className="text-lg font-bold text-primary">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                {/* Service */}
                <div className="pb-4 border-b border-secondary/20">
                  <p className="text-xs text-primary/60 font-semibold mb-1">SERVICE</p>
                  <p className="text-lg font-bold text-primary">{selectedBookingService.name}</p>
                  <p className="text-sm text-accent font-semibold mt-1">${selectedBookingService.price}</p>
                </div>

                {/* Customer Info */}
                <div className="pb-4 border-b border-secondary/20">
                  <p className="text-xs text-primary/60 font-semibold mb-2">YOUR INFORMATION</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-primary/60">Name</p>
                      <p className="text-sm font-semibold text-primary">{bookingName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary/60">Email</p>
                      <p className="text-sm font-semibold text-primary">{bookingEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary/60">Phone</p>
                      <p className="text-sm font-semibold text-primary">{bookingContact}</p>
                    </div>
                  </div>
                </div>

                {/* Salon Contact Info */}
                <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                  <p className="text-xs text-primary/60 font-semibold mb-3">SALON LOCATION</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-primary/60">Address</p>
                      <p className="text-sm font-semibold text-primary">{business.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary/60">Phone</p>
                      <p className="text-sm font-semibold text-accent">{business.contact.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="flex-1 bg-secondary/20 hover:bg-secondary/30 text-primary font-bold py-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    // Generate booking reference number
                    const refNumber = 'BK' + Date.now().toString().slice(-8)
                    setBookingReference(refNumber)
                    
                    // Close confirmation modal and show success modal
                    setShowConfirmationModal(false)
                    setShowSuccessModal(true)
                    
                    // Auto-close success modal after 5 seconds
                    setTimeout(() => {
                      setShowSuccessModal(false)
                      setShowBookingModal(false)
                      // Reset form
                      setBookingName('')
                      setBookingEmail('')
                      setBookingContact('')
                      setSelectedBookingService(null)
                      setSelectedDate(null)
                      // Scroll to home
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }, 5000)
                  }}
                  className="flex-1 bg-accent hover:bg-accent-light text-white font-bold py-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                >
                  Complete Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-fade-in-down">
            {/* Modal Body */}
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
              {/* Success Checkmark */}
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-12 h-12 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>

              {/* Success Message */}
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2">Booking Confirmed!</h2>
                <p className="text-primary/70 text-sm">Your appointment has been successfully booked.</p>
              </div>

              {/* Booking Reference */}
              <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 w-full">
                <p className="text-xs text-primary/60 font-semibold mb-1">BOOKING REFERENCE</p>
                <p className="text-2xl font-bold text-accent font-mono">{bookingReference}</p>
              </div>

              {/* Confirmation Details */}
              <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4 w-full text-left space-y-3">
                <p className="text-sm text-primary/70">
                  <span className="font-semibold text-primary">Confirmation email:</span> Sent to {bookingEmail}
                </p>
                <p className="text-sm text-primary/70">
                  <span className="font-semibold text-primary">Appointment:</span> {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-sm text-primary/70">
                  <span className="font-semibold text-primary">Service:</span> {selectedBookingService?.name}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  setShowBookingModal(false)
                  // Reset form
                  setBookingName('')
                  setBookingEmail('')
                  setBookingContact('')
                  setSelectedBookingService(null)
                  setSelectedDate(null)
                  // Scroll to home
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="w-full bg-accent hover:bg-accent-light text-white font-bold py-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Done
              </button>

              {/* Auto-close Message */}
              <p className="text-xs text-primary/50">This window will close automatically in 5 seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* Careers Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-accent/20 p-6 flex justify-between items-center z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-primary">Apply for {selectedPosition}</h2>
              <button
                onClick={() => {
                  setShowApplicationModal(false)
                  setFormErrors({})
                  setApplicationSubmitted(false)
                }}
                className="text-primary/60 hover:text-primary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {applicationSubmitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">Application Submitted!</h3>
                <p className="text-primary/80">Thank you for your interest. We'll review your application and get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault()
                
                // Basic validation
                const errors: { [key: string]: string } = {}
                if (!applicationData.full_name.trim()) errors.full_name = 'Name is required'
                if (!applicationData.email.trim()) {
                  errors.email = 'Email is required'
                } else if (!/^\S+@\S+\.\S+$/.test(applicationData.email)) {
                  errors.email = 'Invalid email format'
                }
                if (!applicationData.phone.trim()) errors.phone = 'Phone is required'
                if (!applicationData.employment_type) errors.employment_type = 'Employment type is required'
                if (!applicationData.license_number.trim()) errors.license_number = 'License number is required'
                if (!applicationData.years_experience.trim()) errors.years_experience = 'Experience is required'
                if (!applicationData.specialties.trim()) errors.specialties = 'Specialties are required'

                setFormErrors(errors)
                if (Object.keys(errors).length === 0) {
                  // Submit application
                  console.log('Application submitted:', applicationData)
                  setApplicationSubmitted(true)
                  setTimeout(() => {
                    setShowApplicationModal(false)
                    setApplicationSubmitted(false)
                    setApplicationData({
                      full_name: '',
                      email: '',
                      phone: '',
                      position: '',
                      employment_type: '',
                      license_number: '',
                      years_experience: '',
                      specialties: '',
                      portfolio_url: '',
                      certifications: '',
                      availability: '',
                      why_join: '',
                      references: ''
                    })
                  }, 3000)
                }
              }} className="p-6 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={applicationData.full_name}
                    onChange={(e) => {
                      setApplicationData({ ...applicationData, full_name: e.target.value })
                      if (formErrors.full_name) setFormErrors({ ...formErrors, full_name: '' })
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${formErrors.full_name ? 'border-red-500' : 'border-accent/30'}`}
                    placeholder="Your full name"
                  />
                  {formErrors.full_name && <p className="text-red-500 text-sm mt-1">{formErrors.full_name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={applicationData.email}
                    onChange={(e) => {
                      setApplicationData({ ...applicationData, email: e.target.value })
                      if (formErrors.email) setFormErrors({ ...formErrors, email: '' })
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${formErrors.email ? 'border-red-500' : 'border-accent/30'}`}
                    placeholder="your.email@example.com"
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={applicationData.phone}
                    onChange={(e) => {
                      setApplicationData({ ...applicationData, phone: e.target.value })
                      if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' })
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${formErrors.phone ? 'border-red-500' : 'border-accent/30'}`}
                    placeholder="(555) 123-4567"
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                </div>

                {/* Employment Type */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Preferred Employment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="employment_type"
                    value={applicationData.employment_type}
                    onChange={(e) => {
                      setApplicationData({ ...applicationData, employment_type: e.target.value })
                      if (formErrors.employment_type) setFormErrors({ ...formErrors, employment_type: '' })
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${formErrors.employment_type ? 'border-red-500' : 'border-accent/30'}`}
                  >
                    <option value="">Select type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                  {formErrors.employment_type && <p className="text-red-500 text-sm mt-1">{formErrors.employment_type}</p>}
                </div>

                {/* License Number */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Georgia Cosmetology License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    value={applicationData.license_number}
                    onChange={(e) => {
                      setApplicationData({ ...applicationData, license_number: e.target.value })
                      if (formErrors.license_number) setFormErrors({ ...formErrors, license_number: '' })
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${formErrors.license_number ? 'border-red-500' : 'border-accent/30'}`}
                    placeholder="GA-COS-XXXXXX"
                  />
                  {formErrors.license_number && <p className="text-red-500 text-sm mt-1">{formErrors.license_number}</p>}
                </div>

                {/* Years Experience */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Years of Professional Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="years_experience"
                    value={applicationData.years_experience}
                    onChange={(e) => {
                      setApplicationData({ ...applicationData, years_experience: e.target.value })
                      if (formErrors.years_experience) setFormErrors({ ...formErrors, years_experience: '' })
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${formErrors.years_experience ? 'border-red-500' : 'border-accent/30'}`}
                    placeholder="5"
                    min="0"
                  />
                  {formErrors.years_experience && <p className="text-red-500 text-sm mt-1">{formErrors.years_experience}</p>}
                </div>

                {/* Specialties */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Specialties / Areas of Expertise <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="specialties"
                    value={applicationData.specialties}
                    onChange={(e) => {
                      setApplicationData({ ...applicationData, specialties: e.target.value })
                      if (formErrors.specialties) setFormErrors({ ...formErrors, specialties: '' })
                    }}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${formErrors.specialties ? 'border-red-500' : 'border-accent/30'}`}
                    placeholder="e.g., Balayage, Box Braids, Natural Hair, Color Corrections..."
                  />
                  {formErrors.specialties && <p className="text-red-500 text-sm mt-1">{formErrors.specialties}</p>}
                </div>

                {/* Portfolio URL */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Portfolio URL (Instagram, Website, etc.)
                  </label>
                  <input
                    type="url"
                    name="portfolio_url"
                    value={applicationData.portfolio_url}
                    onChange={(e) => setApplicationData({ ...applicationData, portfolio_url: e.target.value })}
                    className="w-full px-4 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="https://instagram.com/yourportfolio"
                  />
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Certifications & Education
                  </label>
                  <textarea
                    name="certifications"
                    value={applicationData.certifications}
                    onChange={(e) => setApplicationData({ ...applicationData, certifications: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="List your cosmetology school, advanced certifications, workshops, etc."
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Availability
                  </label>
                  <textarea
                    name="availability"
                    value={applicationData.availability}
                    onChange={(e) => setApplicationData({ ...applicationData, availability: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="When can you start? What days/hours are you available?"
                  />
                </div>

                {/* Why Join */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Why do you want to join our team?
                  </label>
                  <textarea
                    name="why_join"
                    value={applicationData.why_join}
                    onChange={(e) => setApplicationData({ ...applicationData, why_join: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Tell us what excites you about this opportunity..."
                  />
                </div>

                {/* References */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Professional References
                  </label>
                  <textarea
                    name="references"
                    value={applicationData.references}
                    onChange={(e) => setApplicationData({ ...applicationData, references: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Name, Title, Phone/Email (2-3 references)"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplicationModal(false)
                      setFormErrors({})
                    }}
                    className="flex-1 px-6 py-3 border border-accent/30 text-primary rounded-lg hover:bg-secondary/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-accent"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
