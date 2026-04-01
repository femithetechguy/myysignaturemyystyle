'use client'

import { getAppConfig, getContent, getGallery, getCareers, getServices } from '@/lib/config'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { FiInstagram } from 'react-icons/fi'
import { SiZelle, SiCashapp } from 'react-icons/si'
import Gallery from '@/components/Gallery'

export default function Home() {
  const appConfig = getAppConfig()
  const services = getServices()
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
  const [selectedCategory, setSelectedCategory] = useState('Hair Cut')
  const [selectedBookingCategory, setSelectedBookingCategory] = useState('')
  const [selectedBookingService, setSelectedBookingService] = useState<{ id: string; name: string; category: string; price_min: number; price_max: number; duration: number } | null>(null)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [bookingName, setBookingName] = useState('')
  const [bookingContact, setBookingContact] = useState('')
  const [bookingEmail, setBookingEmail] = useState('')
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationStep, setConfirmationStep] = useState<'review' | 'confirmed'>('review')
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
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [copiedZelle, setCopiedZelle] = useState(false)
  const [copiedCashapp, setCopiedCashapp] = useState(false)
  const [copiedRef, setCopiedRef] = useState(false)
  const [bookingToast, setBookingToast] = useState<string | null>(null)

  const showBookingToast = (msg: string) => {
    setBookingToast(msg)
    setTimeout(() => setBookingToast(null), 4000)
  }

  const copyToClipboard = (value: string, type: 'zelle' | 'cashapp') => {
    navigator.clipboard.writeText(value)
    if (type === 'zelle') {
      setCopiedZelle(true)
      setTimeout(() => setCopiedZelle(false), 2000)
    } else {
      setCopiedCashapp(true)
      setTimeout(() => setCopiedCashapp(false), 2000)
    }
  }

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
    setSelectedBookingCategory(getCategories()[0] || 'Hair Cut')
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

  const CATEGORY_ORDER = [
    'Hair Cut', 'Chemical Service', 'Hair Treatment', 'Extensions',
    'Braids', 'Locs', 'Natural Hair Styles', 'Bridal', 'Add On'
  ]

  const getCategories = () => {
    const available = new Set(services.map(s => s.category))
    return CATEGORY_ORDER.filter(c => available.has(c))
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
              setPolicyAccepted(false)
            }
            // Always scroll to home
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="absolute transition-opacity left-4 sm:left-8 md:hidden hover:opacity-80"
        >
          <Image src="/assets/images/others/logo_trans.png" alt="Logo" width={80} height={80} className="w-auto h-20" />
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
              setPolicyAccepted(false)
            }
            // Always scroll to home
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="absolute hidden transition-opacity md:block left-8 hover:opacity-80"
        >
          <Image src="/assets/images/others/logo_trans.png" alt="Logo" width={112} height={112} className="w-auto h-28" />
        </button>

        {/* Desktop Navigation - Centered */}
        <nav className="justify-center hidden gap-8 md:flex lg:gap-20">
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
          className={`absolute right-2 sm:right-6 md:hidden p-2 transition-colors duration-300 ${
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
        <div className="fixed top-0 left-0 right-0 z-40 pt-20 bg-black/60 md:hidden animate-fade-in-down">
          <nav className="flex flex-col gap-0 py-0">
            {content.navigation.links.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                onClick={() => setShowMobileMenu(false)}
                className="px-6 py-4 text-base font-bold tracking-wider text-right text-white uppercase transition-all duration-300 border-b hover:bg-white/15 border-white/20 last:border-b-0"
                style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative flex items-center justify-center w-full h-screen overflow-hidden bg-primary">
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
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/40 to-black/50"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-primary/40"></div>
        
        {/* Content */}
        <div className="relative z-20 max-w-4xl px-4 text-center sm:px-6">
          <h1 className="mb-2 text-4xl font-light tracking-widest text-white uppercase sm:text-5xl md:text-7xl lg:text-8xl sm:mb-3 animate-fade-in-down drop-shadow-lg">{content.hero.title}</h1>
          <h2 className="mb-8 text-xl font-light tracking-wider uppercase sm:text-2xl md:text-3xl lg:text-4xl sm:mb-10 md:mb-12 text-secondary animate-fade-in-up drop-shadow-md">{content.hero.subtitle}</h2>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <button 
              onClick={() => setShowBookingModal(true)}
              className="inline-block px-10 py-3 text-sm font-light tracking-widest text-white uppercase transition-all duration-300 border-2 rounded shadow-lg bg-accent hover:bg-transparent hover:text-accent sm:px-14 md:px-16 sm:py-4 md:py-5 sm:text-base md:text-lg border-accent animate-fade-in hover:scale-110 hover:shadow-2xl hover:drop-shadow-lg active:scale-95"
            >
              {content.hero.cta_button}
            </button>
            <a 
              href="#careers"
              className="inline-block px-10 py-3 text-sm font-light tracking-widest text-white uppercase transition-all duration-300 bg-transparent border-2 rounded shadow-lg hover:bg-secondary hover:text-primary sm:px-14 md:px-16 sm:py-4 md:py-5 sm:text-base md:text-lg border-secondary animate-fade-in hover:scale-110 hover:shadow-2xl hover:drop-shadow-lg active:scale-95"
            >
              JOIN OUR STYLISTS
            </a>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="py-4 container-custom">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white sm:py-20">
        <div className="container-custom">
          <h2 className="mb-12 text-3xl font-bold text-center sm:text-4xl text-primary animate-fade-in-up">{content.services_section.title}</h2>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 sm:gap-3">
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {getServicesByCategory(selectedCategory).map((service, index) => (
              <div key={service.id} className="transition-all duration-300 card hover:shadow-lg hover:scale-105 animate-fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="flex-1 text-lg font-bold sm:text-xl text-primary">{service.name}</h3>
                  <span className="px-2 py-1 ml-2 text-xs font-bold rounded bg-accent/20 text-accent">{service.category}</span>
                </div>
                <p className="mb-4 text-sm text-gray-600 sm:text-base">{service.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold sm:text-2xl text-accent">${service.price_min} – ${service.price_max}</span>
                  <span className="text-xs text-gray-500 sm:text-sm">{service.duration} min</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedBookingService({ id: service.id, name: service.name, category: service.category, price_min: service.price_min, price_max: service.price_max, duration: service.duration })
                    setSelectedBookingCategory(service.category)
                    setShowBookingModal(true)
                    setSelectedDate(new Date())
                  }}
                  className="w-full py-2 text-sm font-bold text-white transition-all duration-300 rounded-lg bg-accent hover:bg-accent-light hover:scale-105 active:scale-95 sm:text-base"
                >
                  Schedule Appointment
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="py-4 container-custom">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Gallery Section */}
      <section id="gallery" className="bg-white">
        <Gallery services={services} instagramUrl={business.social.instagram} />
      </section>

      {/* Section Divider */}
      <div className="py-4 container-custom">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Booking Section */}
      <section id="book" className="py-16 bg-white sm:py-20">
        <div className="container-custom">
          {/* Booking CTA */}
          <div className="p-8 mb-12 text-center border rounded-lg sm:mb-16 bg-secondary/10 border-accent/30 sm:p-10">
            <h3 className="mb-4 text-2xl font-bold sm:text-3xl text-primary">{content.reviews_section.cta_title}</h3>
            <p className="mb-6 text-base text-primary/80 sm:text-lg">{content.reviews_section.cta_subtitle}</p>
            <button onClick={handleScheduleClick} className="text-sm btn-accent sm:text-base hover:scale-105 active:scale-95">{content.reviews_section.cta_button}</button>
          </div>

          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl text-primary animate-fade-in-down">{content.reviews_section.title}</h2>
            <p className="text-base sm:text-lg text-primary/80 animate-fade-in-up">{content.reviews_section.subtitle}</p>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {content.reviews_section.reviews.map((review, index) => (
              <div 
                key={index}
                className="p-6 transition-all duration-300 border rounded-lg bg-secondary/10 border-accent/20 hover:shadow-lg animate-fade-in-up hover:border-accent"
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
                <p className="mb-4 text-sm italic text-primary/80 sm:text-base">&quot;{review.text}&quot;</p>

                {/* Author */}
                <p className="font-semibold text-primary">- {review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="py-4 container-custom">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Careers Section */}
      <section id="careers" className="py-16 bg-white sm:py-20">
        <div className="container-custom">
          <div className="mb-12 text-center animate-fade-in-up">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl text-primary">{careers.tagline}</h2>
            <p className="max-w-2xl mx-auto text-lg text-primary/80">{careers.introduction}</p>
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <h3 className="mb-8 text-2xl font-bold text-center sm:text-3xl text-primary">Open Positions</h3>
            <div className="max-w-4xl mx-auto space-y-6">
              {careers.open_positions.map((position) => (
                <div
                  key={position.id}
                  className="p-6 transition-all duration-300 bg-white border rounded-lg border-accent/20 hover:shadow-lg hover:border-accent"
                >
                  <div className="flex flex-col mb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                      <h4 className="mb-2 text-xl font-bold text-primary">{position.title}</h4>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-3 py-1 font-medium rounded-full bg-accent/10 text-accent">{position.type}</span>
                        <span className="px-3 py-1 rounded-full bg-secondary/20 text-primary">📍 {position.location}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPosition(position.title)
                        setApplicationData({ ...applicationData, position: position.title })
                        setShowApplicationModal(true)
                      }}
                      className="text-sm btn-accent whitespace-nowrap"
                    >
                      JOIN OUR STYLISTS
                    </button>
                  </div>
                  <p className="mb-4 text-sm text-primary/80">{position.description}</p>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <h5 className="mb-2 text-sm font-bold text-primary">Key Requirements:</h5>
                      <ul className="space-y-1 text-xs text-primary/80">
                        {position.requirements.slice(0, 3).map((req, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2 text-accent">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="mb-2 text-sm font-bold text-primary">Responsibilities:</h5>
                      <ul className="space-y-1 text-xs text-primary/80">
                        {position.responsibilities.slice(0, 3).map((resp, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2 text-accent">•</span>
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
          <div className="grid grid-cols-1 gap-6 mb-16 sm:grid-cols-2 md:grid-cols-3">
            {careers.benefits.map((benefit, index) => (
              <div
                key={benefit.id}
                className="p-6 transition-all duration-300 bg-white border rounded-lg border-accent/20 hover:shadow-lg hover:border-accent animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 text-4xl">{benefit.icon}</div>
                <h3 className="mb-3 text-xl font-bold text-primary">{benefit.title}</h3>
                <p className="text-sm text-primary/80">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Team Culture */}
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="mb-6 text-2xl font-bold text-primary">{careers.team_culture.title}</h3>
            <p className="mb-8 text-primary/80">{careers.team_culture.description}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {careers.team_culture.values.slice(0, 4).map((value, index) => (
                <div key={index} className="p-4 text-center transition-all duration-300 bg-white border rounded-lg border-accent/20 hover:shadow-lg">
                  <h4 className="mb-2 text-sm font-bold text-primary">{value.title}</h4>
                  <p className="text-xs text-primary/70">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="py-4 container-custom">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* About Section */}
      <section id="about" className="py-16 bg-white sm:py-20">
        <div className="container-custom">
          <div className="grid items-center grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            <div className="animate-slide-in-left">
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl text-primary">{content.about_section.title}</h2>
              <p className="mb-4 text-base sm:text-lg text-primary">
                {appConfig.app.description}
              </p>
              <p className="mb-6 text-sm sm:text-base text-primary/80">
                {content.about_section.location_text.replace('{ADDRESS}', business.address)}
              </p>
              <div className="space-y-2 text-sm sm:text-base">
                <p className="text-primary"><strong>Phone:</strong> {business.contact.phone}</p>
                <p className="text-primary"><strong>Email:</strong> {business.contact.email}</p>
                <p className="text-primary"><strong>Location:</strong> {business.county}, {business.state}</p>
              </div>
            </div>
            <div className="p-6 text-center transition-all duration-300 border rounded-lg bg-secondary sm:p-8 border-accent/30 animate-slide-in-right hover:shadow-lg">
              <p className="mb-2 text-3xl font-bold sm:text-5xl text-accent">{content.about_section.stat_1_value}</p>
              <p className="text-sm font-medium sm:text-base text-primary">{content.about_section.stat_1_label}</p>
              <hr className="my-4 sm:my-6 border-accent/50" />
              <p className="mb-2 text-3xl font-bold sm:text-5xl text-accent">{content.about_section.stat_2_value}</p>
              <p className="text-sm font-medium sm:text-base text-primary">{content.about_section.stat_2_label}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="py-4 container-custom">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white sm:py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-4 text-3xl font-bold text-center sm:text-4xl text-primary animate-fade-in-up">{content.footer.sections.contact.title}</h2>
            
            <div className="grid grid-cols-1 gap-12 mt-12 md:grid-cols-2 sm:gap-16">
              {/* Contact Information */}
              <div className="flex flex-col justify-center animate-fade-in-up">
                <div className="mb-8">
                  <h3 className="mb-3 text-lg font-bold sm:text-xl text-primary">Visit Us</h3>
                  <p className="text-sm sm:text-base text-primary/80">{business.address}</p>
                </div>
                
                <div className="mb-8">
                  <h3 className="mb-3 text-lg font-bold sm:text-xl text-primary">Call Us</h3>
                  <a href={`tel:${business.contact.phone}`} className="text-sm transition-colors duration-300 sm:text-base text-accent hover:text-accent/80">
                    {business.contact.phone}
                  </a>
                </div>

                <div className="mb-8">
                  <h3 className="mb-3 text-lg font-bold sm:text-xl text-primary">Email Us</h3>
                  <a href={`mailto:${business.contact.email}`} className="text-sm transition-colors duration-300 sm:text-base text-accent hover:text-accent/80">
                    {business.contact.email}
                  </a>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold sm:text-xl text-primary">{content.footer.sections.hours.title}</h3>
                  <p className="mb-1 text-xs sm:text-sm text-primary/80">{content.footer.sections.hours.mon_fri}</p>
                  <p className="mb-1 text-xs sm:text-sm text-primary/80">{content.footer.sections.hours.saturday}</p>
                  <p className="text-xs sm:text-sm text-primary/80">{content.footer.sections.hours.sunday}</p>
                </div>

                <div className="mt-8">
                  <h3 className="mb-3 text-lg font-bold sm:text-xl text-primary">{content.footer.sections.follow.title}</h3>
                  <div className="flex gap-4">
                    {business.social.instagram && (
                      <a 
                        href={business.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors duration-300 text-primary/70 hover:text-accent"
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
                <h3 className="mb-6 text-lg font-bold sm:text-xl text-primary">Send us a Message</h3>
                <button 
                  type="button"
                  onClick={handleMessageClick}
                  className="w-full text-sm font-semibold shadow-lg btn-accent sm:text-base hover:scale-105 active:scale-95"
                >
                  Leave A Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-primary text-secondary sm:py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 md:grid-cols-4 sm:gap-8">
            <div className="text-center animate-fade-in-up sm:text-left">
              <h3 className="mb-4 text-base font-bold sm:text-lg">{content.footer.sections.navigation.title}</h3>
              <ul className="space-y-2">
                {content.footer.sections.navigation.links.map((link) => (
                  <li key={link.href}>
                    <a 
                      href={link.href}
                      className="text-xs transition-colors duration-300 sm:text-sm text-secondary/80 hover:text-accent"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center animate-fade-in-up sm:text-left">
              <h3 className="mb-4 text-base font-bold sm:text-lg">{content.footer.sections.contact.title}</h3>
              <p className="text-xs sm:text-sm text-secondary/90">{business.address}</p>
              <p className="mt-2 text-xs sm:text-sm text-secondary/90">{business.contact.phone}</p>
              <p className="text-xs sm:text-sm text-secondary/90">{business.contact.email}</p>
            </div>
            <div className="text-center animate-fade-in-up sm:text-left">
              <h3 className="mb-4 text-base font-bold sm:text-lg">{content.footer.sections.hours.title}</h3>
              <p className="text-xs sm:text-sm text-secondary/90">{content.footer.sections.hours.mon_fri}</p>
              <p className="text-xs sm:text-sm text-secondary/90">{content.footer.sections.hours.saturday}</p>
              <p className="text-xs sm:text-sm text-secondary/90">{content.footer.sections.hours.sunday}</p>
            </div>
            <div className="text-center animate-fade-in-up sm:text-left">
              <h3 className="mb-4 text-base font-bold sm:text-lg">{content.footer.sections.follow.title}</h3>
              <div className="flex justify-center gap-4 sm:justify-start">
                {business.social.instagram && (
                  <a 
                    href={business.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-300 text-secondary/70 hover:text-accent"
                    aria-label="Instagram"
                  >
                    <FiInstagram className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <hr className="mb-6 border-secondary/30" />
          <div className="text-xs text-center text-secondary/70 sm:text-sm">
            <p>{content.footer.copyright.replace('{APP_NAME}', appConfig.app.name)}</p>
            <p className="mt-2 text-xs">
              <a 
                href={content.footer.developed_by_link || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-colors duration-300 hover:text-accent"
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
        className="fixed z-50 flex items-center justify-center text-white transition-all duration-300 rounded-full shadow-lg bottom-12 right-6 w-14 h-14 bg-accent hover:bg-accent-light hover:scale-110 active:scale-95 animate-fade-in drop-shadow-lg"
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
          className="fixed z-40 flex items-center justify-center w-12 h-12 text-white transition-all duration-300 rounded-full shadow-lg bottom-28 right-6 bg-accent hover:bg-accent hover:scale-110 active:scale-95 animate-fade-in"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md md:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 text-white bg-primary">
              <h2 className="text-xl font-bold">{content.message_modal?.title || 'Send us a Message'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white transition-opacity hover:opacity-70"
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
                  <label className="block mb-2 text-sm font-semibold text-primary">
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
                  {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
                </div>

                {/* Contact Input */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-primary">
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
                  {formErrors.contact && <p className="mt-1 text-xs text-red-500">{formErrors.contact}</p>}
                </div>

                {/* Message Type Dropdown */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-primary">
                    {content.message_modal?.fields?.message_type || 'Message Type'}
                  </label>
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="w-full px-4 py-2 font-medium bg-white border rounded-lg border-secondary/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-primary"
                  >
                    {content.message_types?.map((type) => (
                      <option key={type.id} value={type.id} className="font-medium text-primary">
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conditional Service Dropdown */}
                {messageType === 'booking' && (
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-primary">
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
                        <option key={service.id} value={service.name} className="font-medium text-primary">
                          {service.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.service && <p className="mt-1 text-xs text-red-500">{formErrors.service}</p>}
                  </div>
                )}

                {/* Message Textarea */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-primary">
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
                  {formErrors.message && <p className="mt-1 text-xs text-red-500">{formErrors.message}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 font-bold text-white transition-all duration-300 rounded-lg shadow-lg bg-accent hover:bg-accent-light hover:scale-105 active:scale-95"
                >
                  {content.message_modal?.submit_button || 'Send Message'}
                </button>
              </form>
            ) : (
              /* Success Message */
              <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                <svg className="w-16 h-16 mb-4 text-accent animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <h3 className="mb-2 text-xl font-bold text-primary">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          {/* Toast */}
          {bookingToast && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] max-w-sm w-full mx-4 px-5 py-4 bg-red-600 text-white rounded-xl shadow-2xl flex items-start gap-3 animate-fade-in-down">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <p className="text-sm font-semibold leading-snug">{bookingToast}</p>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-down">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-primary text-secondary border-accent/20">
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
                  setPolicyAccepted(false)
                  // Scroll to home
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="text-2xl font-bold transition-colors text-secondary/70 hover:text-secondary"
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
                  className="px-4 py-2 transition-colors rounded bg-secondary/20 hover:bg-secondary/30 text-primary"
                >
                  ←
                </button>
                <h3 className="text-xl font-bold text-primary">
                  {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="px-4 py-2 transition-colors rounded bg-secondary/20 hover:bg-secondary/30 text-primary"
                >
                  →
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="space-y-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-4 sm:gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-sm font-bold text-center text-primary/60">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
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
                <div className="p-4 border rounded-lg bg-secondary/10 border-secondary/30">
                  <p className="mb-1 text-sm text-primary/70">Selected Date:</p>
                  <p className="text-lg font-bold text-primary">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}

              {/* Customer Information */}
              <div className="pb-6 space-y-4 border-b border-secondary/20">
                <h3 className="text-lg font-bold text-primary">Your Information</h3>
                
                {/* Name Input */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-primary">Full Name</label>
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
                  {formErrors.bookingName && <p className="mt-1 text-xs text-red-500">{formErrors.bookingName}</p>}
                </div>

                {/* Email Input */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-primary">Email</label>
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
                  {formErrors.bookingEmail && <p className="mt-1 text-xs text-red-500">{formErrors.bookingEmail}</p>}
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-primary">Phone Number</label>
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
                  {formErrors.bookingContact && <p className="mt-1 text-xs text-red-500">{formErrors.bookingContact}</p>}
                </div>
              </div>

              {/* Service Category Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-primary">Select Service Category:</label>
                <select
                  value={selectedBookingCategory}
                  onChange={(e) => setSelectedBookingCategory(e.target.value)}
                  className="w-full px-4 py-3 font-medium bg-white border rounded-lg border-secondary/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-primary"
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
                <div className="p-4 border rounded-lg bg-secondary/5 border-secondary/20">
                  <p className="mb-3 text-sm font-bold text-primary">Services in {selectedBookingCategory}:</p>
                  <div className="space-y-2">
                    {getServicesByCategory(selectedBookingCategory).map((service) => {
                      const isSelected = selectedBookingService?.id === service.id
                      return (
                        <div
                          key={service.id}
                          onClick={() => setSelectedBookingService({ id: service.id, name: service.name, category: service.category, price_min: service.price_min, price_max: service.price_max, duration: service.duration })}
                          className={`flex items-center justify-between px-3 py-3 text-xs rounded-lg cursor-pointer transition-all duration-200 sm:text-sm ${
                            isSelected
                              ? 'bg-accent text-white shadow-md scale-[1.02] border-2 border-accent'
                              : 'hover:bg-secondary/10 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex-1">
                            <p className={`font-semibold ${isSelected ? 'text-white' : 'text-primary'}`}>{service.name}</p>
                            <p className={`font-bold text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-accent'}`}>${service.price_min} – ${service.price_max}</p>
                            <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/60' : 'text-primary/50'}`}>⏱ {service.duration} min</p>
                          </div>
                          <div className={`ml-3 flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                            isSelected
                              ? 'bg-white text-accent'
                              : 'bg-secondary/20 text-primary'
                          }`}>
                            {isSelected && <span className="text-sm">✓</span>}
                            {isSelected ? 'Selected' : 'Select'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Selected Service Display */}
              {selectedBookingService && (
                <div className="flex items-center gap-3 p-4 border-2 border-accent rounded-xl bg-accent/10 animate-fade-in-up shadow-sm">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-accent text-white text-base font-bold flex-shrink-0">✓</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary/60 uppercase tracking-wide">Selected Service</p>
                    <p className="text-base font-bold text-accent truncate">{selectedBookingService.name}</p>
                    <p className="text-[10px] text-primary/50 font-medium -mt-0.5">{selectedBookingService.category}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs font-semibold text-primary/70">${selectedBookingService.price_min} – ${selectedBookingService.price_max}</p>
                      <p className="text-[10px] text-primary/50">⏱ {selectedBookingService.duration} min</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Disclaimer */}
              <div className={`p-4 space-y-1 text-xs border-2 rounded-lg bg-amber-50 text-amber-900 transition-all duration-300 ${formErrors.policyAccepted ? 'border-red-400 bg-red-50' : 'border-amber-300'}`}>
                <p className="text-sm font-bold">📋 Booking Policy</p>
                <p>• {content.booking_disclaimer.deposit_note}</p>
                <p>• {content.booking_disclaimer.cancellation_note}</p>
                <p>• {content.booking_disclaimer.late_policy}</p>
                <label className={`flex items-center gap-3 mt-3 cursor-pointer select-none rounded-lg p-3 transition-all duration-200 ${policyAccepted ? 'bg-green-100 border border-green-400' : 'bg-white border-2 border-dashed border-amber-400 hover:border-amber-600'}`}>
                  <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 ${policyAccepted ? 'bg-green-500 border-green-500' : 'bg-white border-amber-500'}`}>
                    {policyAccepted && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={policyAccepted}
                    onChange={(e) => { setPolicyAccepted(e.target.checked); if (e.target.checked) setFormErrors(prev => ({ ...prev, policyAccepted: '' })) }}
                    className="sr-only"
                  />
                  <span className={`font-bold text-sm ${policyAccepted ? 'text-green-800' : 'text-amber-900'}`}>
                    {policyAccepted ? '✓ Policy accepted' : 'I have read and agree to the booking policy above'}
                  </span>
                </label>
              </div>

              {/* Payment Options */}
              <div className="p-4 space-y-3 border rounded-lg bg-green-50 border-green-200">
                <p className="text-sm font-bold text-green-900">💳 Payment Options</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="group flex flex-col items-center p-4 bg-white border-2 border-purple-200 rounded-xl shadow-sm transition-all duration-300 hover:border-purple-400 hover:shadow-purple-100 hover:shadow-md hover:-translate-y-1">
                    <SiZelle className="text-4xl mb-2 text-purple-600 transition-transform duration-300 group-hover:scale-110" />
                    <p className="text-xs font-bold text-purple-700 mb-1">Zelle</p>
                    <p className="text-xs font-semibold text-gray-800 break-all text-center mb-3">{appConfig.integrations.payment_gateway.zelle.zelle_id}</p>
                    <button
                      onClick={() => copyToClipboard(appConfig.integrations.payment_gateway.zelle.zelle_id, 'zelle')}
                      className={`w-full py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                        copiedZelle
                          ? 'bg-purple-600 text-white scale-95'
                          : 'bg-purple-50 text-purple-700 border border-purple-300 hover:bg-purple-100'
                      }`}
                    >
                      {copiedZelle ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="group flex flex-col items-center p-4 bg-white border-2 border-green-200 rounded-xl shadow-sm transition-all duration-300 hover:border-green-400 hover:shadow-green-100 hover:shadow-md hover:-translate-y-1">
                    <SiCashapp className="text-4xl mb-2 text-green-600 transition-transform duration-300 group-hover:scale-110" />
                    <p className="text-xs font-bold text-green-700 mb-1">Cash App</p>
                    <p className="text-xs font-semibold text-gray-800 break-all text-center mb-3">{appConfig.integrations.payment_gateway.cashapp.cashapp_id}</p>
                    <button
                      onClick={() => copyToClipboard(appConfig.integrations.payment_gateway.cashapp.cashapp_id, 'cashapp')}
                      className={`w-full py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                        copiedCashapp
                          ? 'bg-green-600 text-white scale-95'
                          : 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100'
                      }`}
                    >
                      {copiedCashapp ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => {
                  const errors: { [key: string]: string } = {}
                  const missing: string[] = []

                  if (!selectedBookingService) missing.push('a service')
                  if (!selectedDate) missing.push('an appointment date')

                  if (!bookingName.trim()) {
                    errors.bookingName = 'Name is required'
                    missing.push('your name')
                  }
                  if (!bookingEmail.trim()) {
                    errors.bookingEmail = 'Email is required'
                    missing.push('your email')
                  } else if (!/^\S+@\S+\.\S+$/.test(bookingEmail)) {
                    errors.bookingEmail = 'Please enter a valid email'
                    missing.push('a valid email')
                  }
                  if (!bookingContact.trim()) {
                    errors.bookingContact = 'Phone number is required'
                    missing.push('your phone number')
                  } else if (!/^[\d\s()\-+]+$/.test(bookingContact)) {
                    errors.bookingContact = 'Please enter a valid phone number'
                    missing.push('a valid phone number')
                  }
                  if (!policyAccepted) {
                    errors.policyAccepted = 'Please accept the booking policy'
                    missing.push('policy agreement (checkbox below)')
                  }

                  setFormErrors(errors)

                  if (missing.length > 0) {
                    showBookingToast(`Still needed: ${missing.join(', ')}`)
                    return
                  }

                  setShowConfirmationModal(true)
                }}
                disabled={false}
                style={(() => {
                  const steps = [
                    !!selectedBookingService,
                    !!selectedDate,
                    bookingName.trim().length > 0,
                    /^\S+@\S+\.\S+$/.test(bookingEmail),
                    /^[\d\s()\-+]+$/.test(bookingContact) && bookingContact.trim().length > 0,
                    policyAccepted,
                  ]
                  const pct = Math.round((steps.filter(Boolean).length / steps.length) * 100)
                  return {
                    background: `linear-gradient(to right, var(--color-accent, #8B6F5E) ${pct}%, #c8b8b0 ${pct}%)`,
                    transition: 'background 0.4s ease',
                  }
                })()}
                className="relative w-full py-3 font-bold text-white rounded-lg shadow-lg overflow-hidden hover:scale-105 active:scale-95 transition-transform duration-300"
              >
                {(() => {
                  const steps = [
                    !!selectedBookingService,
                    !!selectedDate,
                    bookingName.trim().length > 0,
                    /^\S+@\S+\.\S+$/.test(bookingEmail),
                    /^[\d\s()\-+]+$/.test(bookingContact) && bookingContact.trim().length > 0,
                    policyAccepted,
                  ]
                  const done = steps.filter(Boolean).length
                  const total = steps.length
                  if (done === total) return 'Confirm Booking'
                  return `${done} / ${total} steps complete — tap to see what's missing`
                })()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {showConfirmationModal && selectedDate && selectedBookingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md md:max-w-2xl bg-white rounded-lg shadow-2xl animate-fade-in-down flex flex-col max-h-[90vh]">

            {confirmationStep === 'confirmed' ? (
              /* ── SUCCESS VIEW ── */
              <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center animate-fade-in-up">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-accent/20">
                  <svg className="w-12 h-12 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <div>
                  <h2 className="mb-2 text-2xl font-bold text-primary">Booking Confirmed!</h2>
                  <p className="text-sm text-primary/70">Your appointment has been successfully booked.</p>
                </div>
                <div className="w-full p-4 border rounded-lg bg-secondary/10 border-secondary/20">
                  <p className="mb-1 text-xs font-semibold text-primary/60">BOOKING REFERENCE</p>
                  <p className="font-mono text-2xl font-bold text-accent">{bookingReference}</p>
                </div>
                <div className="w-full p-4 space-y-3 text-left border rounded-lg bg-secondary/5 border-secondary/20">
                  <p className="text-sm text-primary/70"><span className="font-semibold text-primary">Confirmation email:</span> Sent to {bookingEmail}</p>
                  <p className="text-sm text-primary/70"><span className="font-semibold text-primary">Appointment:</span> {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  <p className="text-sm text-primary/70"><span className="font-semibold text-primary">Service:</span> {selectedBookingService.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowConfirmationModal(false)
                    setShowBookingModal(false)
                    setConfirmationStep('review')
                    setBookingName(''); setBookingEmail(''); setBookingContact('')
                    setSelectedBookingService(null); setSelectedDate(null); setPolicyAccepted(false)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-full py-3 font-bold text-white transition-all duration-300 rounded-lg bg-accent hover:bg-accent-light hover:scale-105 active:scale-95"
                >
                  Done
                </button>
                <p className="text-xs text-primary/50">This window will close automatically in 5 seconds</p>
              </div>
            ) : (
              /* ── REVIEW VIEW ── */
              <>
            {/* Modal Header */}
            <div className="p-6 border-b bg-primary text-secondary border-accent/20 flex-shrink-0">
              <h2 className="text-2xl font-bold">Confirm Your Booking</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Booking Summary — top row: Date + Service side by side on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div className="p-4 rounded-lg border border-secondary/20 bg-secondary/5">
                  <p className="mb-1 text-xs font-semibold text-primary/60">APPOINTMENT DATE</p>
                  <p className="text-base font-bold text-primary">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                {/* Service */}
                <div className="p-4 rounded-lg border border-secondary/20 bg-secondary/5">
                  <p className="mb-1 text-xs font-semibold text-primary/60">SERVICE</p>
                  <p className="text-base font-bold text-primary">{selectedBookingService.name}</p>
                  <p className="text-xs text-primary/50 font-medium">{selectedBookingService.category}</p>
                  <p className="mt-1 text-sm font-semibold text-accent">${selectedBookingService.price_min} – ${selectedBookingService.price_max}</p>
                  <p className="text-xs text-primary/50 mt-0.5">⏱ {selectedBookingService.duration} min</p>
                </div>
              </div>

              {/* Bottom row: Your Info + Salon Location side by side on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Info */}
                <div className="p-4 rounded-lg border border-secondary/20 bg-secondary/5">
                  <p className="mb-2 text-xs font-semibold text-primary/60">YOUR INFORMATION</p>
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
                <div className="p-4 rounded-lg border border-secondary/20 bg-secondary/10">
                  <p className="mb-3 text-xs font-semibold text-primary/60">SALON LOCATION</p>
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

              {/* Disclaimer */}
              <div className="p-3 text-xs border rounded-lg bg-amber-50 border-amber-200 text-amber-900">
                <p>{content.booking_disclaimer.confirmation_note}</p>
              </div>

              {/* Payment Options */}
              <div className="p-4 space-y-3 border rounded-lg bg-green-50 border-green-200">
                <p className="text-sm font-bold text-green-900">💳 Send Your Deposit</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="group flex flex-col items-center p-4 bg-white border-2 border-purple-200 rounded-xl shadow-sm transition-all duration-300 hover:border-purple-400 hover:shadow-purple-100 hover:shadow-md hover:-translate-y-1">
                    <SiZelle className="text-4xl mb-2 text-purple-600 transition-transform duration-300 group-hover:scale-110" />
                    <p className="text-xs font-bold text-purple-700 mb-1">Zelle</p>
                    <p className="text-xs font-semibold text-gray-800 break-all text-center mb-3">{appConfig.integrations.payment_gateway.zelle.zelle_id}</p>
                    <button
                      onClick={() => copyToClipboard(appConfig.integrations.payment_gateway.zelle.zelle_id, 'zelle')}
                      className={`w-full py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                        copiedZelle
                          ? 'bg-purple-600 text-white scale-95'
                          : 'bg-purple-50 text-purple-700 border border-purple-300 hover:bg-purple-100'
                      }`}
                    >
                      {copiedZelle ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="group flex flex-col items-center p-4 bg-white border-2 border-green-200 rounded-xl shadow-sm transition-all duration-300 hover:border-green-400 hover:shadow-green-100 hover:shadow-md hover:-translate-y-1">
                    <SiCashapp className="text-4xl mb-2 text-green-600 transition-transform duration-300 group-hover:scale-110" />
                    <p className="text-xs font-bold text-green-700 mb-1">Cash App</p>
                    <p className="text-xs font-semibold text-gray-800 break-all text-center mb-3">{appConfig.integrations.payment_gateway.cashapp.cashapp_id}</p>
                    <button
                      onClick={() => copyToClipboard(appConfig.integrations.payment_gateway.cashapp.cashapp_id, 'cashapp')}
                      className={`w-full py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                        copiedCashapp
                          ? 'bg-green-600 text-white scale-95'
                          : 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100'
                      }`}
                    >
                      {copiedCashapp ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-center text-green-700 font-medium mb-2">Include this reference in your payment memo:</p>
                <button
                  onClick={() => {
                    if (bookingReference) {
                      navigator.clipboard.writeText(bookingReference)
                      setCopiedRef(true)
                      setTimeout(() => setCopiedRef(false), 2000)
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 font-mono font-bold text-sm transition-all duration-200 ${
                    copiedRef
                      ? 'bg-green-600 border-green-600 text-white scale-95'
                      : 'bg-white border-green-400 text-green-800 hover:bg-green-50 hover:border-green-600'
                  }`}
                >
                  <span>{bookingReference || 'Generating...'}</span>
                  <span className="text-xs font-sans font-bold ml-3">{copiedRef ? '✓ Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons - pinned footer */}
            <div className="flex gap-3 p-6 pt-4 border-t border-secondary/20 flex-shrink-0">
                <button
                  onClick={() => { setShowConfirmationModal(false); setConfirmationStep('review') }}
                  className="flex-1 py-3 font-bold transition-all duration-300 rounded-lg bg-secondary/20 hover:bg-secondary/30 text-primary hover:scale-105 active:scale-95"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    const refNumber = 'BK' + Date.now().toString().slice(-8)
                    setBookingReference(refNumber)
                    setConfirmationStep('confirmed')
                    // Auto-close after 5 seconds
                    setTimeout(() => {
                      setShowConfirmationModal(false)
                      setShowBookingModal(false)
                      setConfirmationStep('review')
                      setBookingName('')
                      setBookingEmail('')
                      setBookingContact('')
                      setSelectedBookingService(null)
                      setSelectedDate(null)
                      setPolicyAccepted(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }, 5000)
                  }}
                  className="flex-1 py-3 font-bold text-white transition-all duration-300 rounded-lg shadow-lg bg-accent hover:bg-accent-light hover:scale-105 active:scale-95"
                >
                  Complete Booking
                </button>
              </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Careers Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-accent/20">
              <h2 className="text-xl font-bold sm:text-2xl text-primary">Apply for {selectedPosition}</h2>
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
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-primary">Application Submitted!</h3>
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
                  <label className="block mb-2 text-sm font-medium text-primary">
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
                  {formErrors.full_name && <p className="mt-1 text-sm text-red-500">{formErrors.full_name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-primary">
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
                  {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-primary">
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
                  {formErrors.phone && <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>}
                </div>

                {/* Employment Type */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-primary">
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
                  {formErrors.employment_type && <p className="mt-1 text-sm text-red-500">{formErrors.employment_type}</p>}
                </div>

                {/* License Number */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-primary">
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
                  {formErrors.license_number && <p className="mt-1 text-sm text-red-500">{formErrors.license_number}</p>}
                </div>

                {/* Years Experience */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-primary">
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
                  {formErrors.years_experience && <p className="mt-1 text-sm text-red-500">{formErrors.years_experience}</p>}
                </div>

                {/* Specialties */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-primary">
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
                  {formErrors.specialties && <p className="mt-1 text-sm text-red-500">{formErrors.specialties}</p>}
                </div>

                {/* Portfolio URL */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-primary">
                    Portfolio URL (Instagram, Website, etc.)
                  </label>
                  <input
                    type="url"
                    name="portfolio_url"
                    value={applicationData.portfolio_url}
                    onChange={(e) => setApplicationData({ ...applicationData, portfolio_url: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg border-accent/30 focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="https://instagram.com/yourportfolio"
                  />
                </div>

                {/* Certifications */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-primary">
                    Certifications & Education
                  </label>
                  <textarea
                    name="certifications"
                    value={applicationData.certifications}
                    onChange={(e) => setApplicationData({ ...applicationData, certifications: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg border-accent/30 focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="List your cosmetology school, advanced certifications, workshops, etc."
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-primary">
                    Availability
                  </label>
                  <textarea
                    name="availability"
                    value={applicationData.availability}
                    onChange={(e) => setApplicationData({ ...applicationData, availability: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg border-accent/30 focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="When can you start? What days/hours are you available?"
                  />
                </div>

                {/* Why Join */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-primary">
                    Why do you want to join our team?
                  </label>
                  <textarea
                    name="why_join"
                    value={applicationData.why_join}
                    onChange={(e) => setApplicationData({ ...applicationData, why_join: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg border-accent/30 focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Tell us what excites you about this opportunity..."
                  />
                </div>

                {/* References */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-primary">
                    Professional References
                  </label>
                  <textarea
                    name="references"
                    value={applicationData.references}
                    onChange={(e) => setApplicationData({ ...applicationData, references: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg border-accent/30 focus:ring-2 focus:ring-accent focus:border-transparent"
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
                    className="flex-1 px-6 py-3 transition-colors border rounded-lg border-accent/30 text-primary hover:bg-secondary/10"
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
