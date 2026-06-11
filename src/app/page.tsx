'use client'

import { getAppConfig, getContent, getGallery, getCareers } from '@/lib/config'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { FiInstagram, FiCopy, FiMap, FiShare2, FiMail, FiPhone, FiCode, FiMapPin, FiClock, FiSettings } from 'react-icons/fi'
import { SiZelle, SiCashapp, SiTiktok } from 'react-icons/si'
import Gallery from '@/components/Gallery'

export default function Home() {
  const appConfig = getAppConfig()
  const business = appConfig.business
  const content = getContent()
  const gallery = getGallery()
  const careers = getCareers()
  // DB-backed data — fall back to app.json values until the fetch resolves
  const [services, setServices] = useState<{ id: string; name: string; description: string; duration: number; price_min: number; price_max: number; category: string; images: string[]; staff_ids: string[] }[]>([])
  const [reviews, setReviews] = useState(content.reviews_section.reviews)
  const [stylists, setStylists] = useState<{ id: number; staff_id: string; name: string; title: string; phone: string; bio: string; photo: string; instagram_handle: string; booking_slug: string; specialties: string[]; availability: Record<string, string> }[]>([])
  const [stylistsLoading, setStylistsLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [navBackground, setNavBackground] = useState('dark')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [addressCopied, setAddressCopied] = useState(false)
  const [bookingLinkShared, setBookingLinkShared] = useState(false)
  const [careersLinkShared, setCareersLinkShared] = useState(false)
  const [showShare, setShowShare] = useState(true)
  const [activeReviewIndex, setActiveReviewIndex] = useState(1)
  const [typedReviewText, setTypedReviewText] = useState('')
  const [isTypingReview, setIsTypingReview] = useState(true)
  const [messageType, setMessageType] = useState('inquiry')
  const [selectedService, setSelectedService] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [contactSending, setContactSending] = useState(false)
  const [contactError, setContactError] = useState('')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedBookingStylist, setSelectedBookingStylist] = useState<{ id: number; staff_id: string; name: string; title: string; photo: string; booking_slug: string; specialties: string[]; availability: Record<string, string> | null } | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
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
  const [appAvailDays, setAppAvailDays] = useState<string[]>([])
  const [appAvailStartDate, setAppAvailStartDate] = useState('')
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [showFullPolicy, setShowFullPolicy] = useState(false)
  const [copiedZelle, setCopiedZelle] = useState(false)
  const [copiedCashapp, setCopiedCashapp] = useState(false)
  const [copiedRef, setCopiedRef] = useState(false)
  const [bookingToast, setBookingToast] = useState<string | null>(null)
  const [appToast, setAppToast] = useState<string | null>(null)
  const [sharedPosition, setSharedPosition] = useState<string | null>(null)

  const showBookingToast = (msg: string) => {
    setBookingToast(msg)
    setTimeout(() => setBookingToast(null), 4000)
  }

  const showAppToast = (msg: string) => {
    setAppToast(msg)
    setTimeout(() => setAppToast(null), 4000)
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
      const nearBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 300
      setShowScrollTop(window.scrollY > 300 && !nearBottom)
      setShowShare(!nearBottom)

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

  // Update URL hash as user scrolls between sections (debounced to avoid Chrome throttle)
  useEffect(() => {
    const sectionIds = ['services', 'stylists', 'gallery', 'book', 'careers', 'about', 'contact', 'connect']
    const visibilityMap = new Map<string, number>()
    let timer: ReturnType<typeof setTimeout> | null = null

    const updateHash = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        if (window.scrollY < window.innerHeight * 0.5) {
          history.replaceState(null, '', window.location.pathname)
          return
        }
        let maxId = ''
        let maxRatio = 0
        visibilityMap.forEach((ratio, id) => {
          if (ratio > maxRatio) { maxRatio = ratio; maxId = id }
        })
        if (maxId && maxRatio > 0.1) {
          history.replaceState(null, '', `#${maxId}`)
        }
      }, 150)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => visibilityMap.set(e.target.id, e.intersectionRatio))
        updateHash()
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => {
      if (timer) clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  // On load: handle hash from shared link (e.g. /#book auto-opens modal, others scroll to section)
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const id = hash.slice(1)
    if (id === 'book') {
      // Auto-open booking modal — don't re-push state since URL already has #book
      setTimeout(() => setShowBookingModal(true), 300)
      return
    }
    const el = document.getElementById(id)
    if (!el) return
    const headerHeight = 80
    setTimeout(() => {
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight
      window.scrollTo({ top, behavior: 'smooth' })
    }, 150)
  }, [])

  // Auto-select the only stylist when modal opens (clears when more stylists are added)
  useEffect(() => {
    if (showBookingModal && stylists.length === 1 && !selectedBookingStylist) {
      const s = stylists[0]
      setSelectedBookingStylist({ id: s.id, staff_id: s.staff_id, name: s.name, title: s.title, photo: s.photo, booking_slug: s.booking_slug, specialties: s.specialties, availability: s.availability ?? null })
    }
  }, [showBookingModal, stylists])

  // Fetch services and reviews from DB on mount
  useEffect(() => {
    fetch('/api/services')
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => setServices(data))
      .catch(err => console.error('Failed to load services from DB:', err))

    fetch('/api/reviews')
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => { if (data.length > 0) setReviews(data) })
      .catch(err => console.error('Failed to load reviews from DB:', err))

    fetch('/api/staff')
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => { if (data.length > 0) setStylists(data) })
      .catch(err => console.error('Failed to load stylists from DB:', err))
      .finally(() => setStylistsLoading(false))
  }, [])

  // Typewriter effect for active review
  useEffect(() => {
    const fullText = reviews[activeReviewIndex]?.text ?? ''
    let i = 0
    setTypedReviewText('')
    setIsTypingReview(true)
    const typeInterval = setInterval(() => {
      i++
      if (i <= fullText.length) {
        setTypedReviewText(fullText.slice(0, i))
      } else {
        setIsTypingReview(false)
        clearInterval(typeInterval)
      }
    }, 22)
    return () => clearInterval(typeInterval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeReviewIndex])

  // Auto-rotate reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReviewIndex(prev => (prev + 1) % reviews.length)
    }, 6000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lock body scroll whenever any modal is open
  useEffect(() => {
    const anyOpen = showBookingModal || showApplicationModal || showConfirmationModal
    document.body.style.overflow = anyOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showBookingModal, showApplicationModal, showConfirmationModal])

  // Fetch services from database
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMessageClick = () => {
    setShowModal(true)
  }

  const handleSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setContactError('')

    const errors: { [key: string]: string } = {}
    if (!name.trim()) errors.name = 'Name is required'
    if (!contact.trim()) {
      errors.contact = 'Email or phone is required'
    } else if (!/^\S+@\S+\.\S+$/.test(contact) && !/^[\d\s()\-+]+$/.test(contact)) {
      errors.contact = 'Please enter a valid email or phone number'
    }
    if (!message.trim()) errors.message = 'Message is required'
    if (messageType === 'booking' && !selectedService) errors.service = 'Please select a service'

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setContactSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, message, message_type: messageType, selected_service: selectedService }),
      })
      if (!res.ok) throw new Error('Server error')
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
        setContactError('')
      }, 2500)
    } catch {
      setContactError('Something went wrong. Please try again or call us directly.')
    } finally {
      setContactSending(false)
    }
  }

  const handleShareBookingLink = async () => {
    const url = `${window.location.origin}/book`
    await navigator.clipboard.writeText(url)
    setBookingLinkShared(true)
    setTimeout(() => setBookingLinkShared(false), 2000)
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title: 'Book at Myy Signature Myy Style', text: 'Book your hair appointment online!', url }) } catch { /* cancelled */ }
    }
  }

  const openBookingModal = () => {
    history.pushState(null, '', '#book')
    setShowBookingModal(true)
  }

  const closeBookingModal = () => {
    history.replaceState(null, '', window.location.pathname)
    setShowBookingModal(false)
  }

  const handleScheduleClick = () => {
    openBookingModal()
    setSelectedDate(new Date())
    setSelectedTime(null)
    setSelectedBookingCategory('')
    if (stylists.length !== 1) setSelectedBookingStylist(null)
    setFormErrors({})
    setBookingName('')
    setBookingContact('')
    setBookingEmail('')
  }

  const handleStylistBookClick = (stylist: typeof stylists[number]) => {
    setSelectedBookingStylist({ id: stylist.id, staff_id: stylist.staff_id, name: stylist.name, title: stylist.title, photo: stylist.photo, booking_slug: stylist.booking_slug, specialties: stylist.specialties, availability: stylist.availability ?? null })
    openBookingModal()
    setSelectedDate(new Date())
    setSelectedTime(null)
    setSelectedBookingCategory('')
    setSelectedBookingService(null)
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
    const inCategory = services.filter(s => s.category === category)
    if (!selectedBookingStylist) return inCategory
    // If staff_ids is populated, filter to only services this stylist offers.
    // If a service has no staff_ids set (empty), treat it as available to everyone.
    return inCategory.filter(s => !s.staff_ids?.length || s.staff_ids.includes(selectedBookingStylist.staff_id))
  }

  const getBookingCategories = () => {
    if (!selectedBookingStylist) return getCategories()
    // Only show categories that have at least one service available for this stylist
    return getCategories().filter(c => getServicesByCategory(c).length > 0)
  }

  // ── Availability helpers ──────────────────────────────────────────────────
  const BUSINESS_HOURS: Record<string, string> = {
    sunday: 'closed',
    monday: '09:00-18:00',
    tuesday: '09:00-18:00',
    wednesday: '09:00-18:00',
    thursday: '09:00-18:00',
    friday: '09:00-18:00',
    saturday: '10:00-16:00',
  }

  const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  const getDaySchedule = (date: Date): string => {
    const key = DAY_NAMES[date.getDay()]
    const schedule = selectedBookingStylist?.availability ?? BUSINESS_HOURS
    return (schedule as Record<string, string>)[key] ?? 'closed'
  }

  const generateTimeSlots = (schedule: string, durationMin: number): string[] => {
    if (!schedule || schedule === 'closed' || !schedule.includes('-')) return []
    const [openStr, closeStr] = schedule.split('-')
    const [oh, om] = openStr.split(':').map(Number)
    const [ch, cm] = closeStr.split(':').map(Number)
    const startMin = oh * 60 + (om || 0)
    const endMin = ch * 60 + (cm || 0)
    const dur = durationMin > 0 ? durationMin : 30
    const slots: string[] = []
    for (let t = startMin; t + dur <= endMin; t += dur) {
      const h = Math.floor(t / 60)
      const m = t % 60
      const ampm = h >= 12 ? 'PM' : 'AM'
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
      slots.push(`${h12}:${m.toString().padStart(2, '0')} ${ampm}`)
    }
    return slots
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <header className={`fixed top-0 w-full px-4 md:px-8 py-3 md:py-4 flex justify-between items-center z-50 transition-all duration-300 ${
        showMobileMenu
          ? 'bg-transparent backdrop-blur-0'
          : navBackground === 'dark'
          ? 'bg-black/30 backdrop-blur-md'
          : navBackground === 'secondary'
          ? 'bg-black/50 backdrop-blur-md'
          : 'bg-primary backdrop-blur-md'
      }`}>
        {/* Spacer - Mobile left (mirrors hamburger width for symmetry) */}
        <div className="md:hidden w-9 flex-shrink-0" />

        {/* Brand Logo - Desktop (in-flow, left) */}
        <button
          onClick={() => {
            if (showBookingModal) {
              closeBookingModal()
              setBookingName('')
              setBookingEmail('')
              setBookingContact('')
              setSelectedBookingService(null)
              setSelectedBookingStylist(null)
              setSelectedDate(null)
              setSelectedTime(null)
              setFormErrors({})
              setPolicyAccepted(false)
            }
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="hidden md:block flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <Image src="/assets/images/others/logo-main.svg" alt="Myy Signature Myy Style" width={200} height={60} className="w-auto h-16" unoptimized priority />
        </button>

        {/* Mobile Center Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute left-12 right-12 flex justify-center items-center md:hidden hover:opacity-80 transition-opacity"
        >
          <Image src="/assets/images/others/logo-main.svg" alt="Myy Signature Myy Style" width={200} height={60} className="w-auto h-11" unoptimized priority />
        </button>

        {/* Desktop Navigation - Centered (flex-1 + justify-center keeps it centered between logo and spacer) */}
        <nav className="justify-center hidden flex-1 gap-6 md:flex lg:gap-16">
          {content.navigation.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault()
                const id = link.href.replace('#', '')
                const el = document.getElementById(id)
                if (el) {
                  const headerHeight = document.querySelector('header')?.offsetHeight ?? 80
                  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - headerHeight, behavior: 'smooth' })
                }
              }}
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

        {/* Right spacer - Desktop only, mirrors logo width for symmetry */}
        <div className="hidden md:block flex-shrink-0 w-[200px]" />

        {/* Mobile Menu Button (in-flow, right) */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={`md:hidden p-1 transition-colors duration-300 flex-shrink-0 ${
            navBackground === 'dark' || navBackground === 'secondary'
              ? 'text-white hover:text-white/80'
              : 'text-white hover:text-white/80'
          }`}
          style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}
          aria-label="Toggle menu"
        >
          <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
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
        <div className="fixed top-0 left-0 right-0 z-40 pt-[88px] bg-black/80 md:hidden animate-fade-in-down">
          <nav className="flex flex-col gap-0 py-0">
            {content.navigation.links.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                onClick={(e) => {
                  e.preventDefault()
                  setShowMobileMenu(false)
                  const id = link.href.replace('#', '')
                  setTimeout(() => {
                    const el = document.getElementById(id)
                    if (el) {
                      const headerHeight = document.querySelector('header')?.offsetHeight ?? 80
                      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight
                      window.scrollTo({ top, behavior: 'smooth' })
                    }
                  }, 50)
                }}
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
          src="https://res.cloudinary.com/dvkbgsaaf/image/upload/f_auto,q_auto,w_1920/landing_m6le9k"
          alt="Myy Signature Hair Salon"
          fill
          priority
          unoptimized
          className="object-cover object-center"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/others/landing.png' }}
        />
        
        {/* Dark overlay for text readability - Enhanced for better contrast */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/40 to-black/50"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-primary/40"></div>
        
        {/* Content */}
        <div className="relative z-20 max-w-4xl px-4 text-center sm:px-6">
          <h1 className="mb-2 text-4xl font-light tracking-widest text-white uppercase sm:text-5xl md:text-7xl lg:text-8xl sm:mb-3 animate-fade-in-down drop-shadow-lg">
            <span className="block">{content.hero.title.split(' ').slice(0, 2).join(' ')}</span>
            <span className="block">{content.hero.title.split(' ').slice(2).join(' ')}</span>
          </h1>
          <h2 className="mb-8 text-base font-light tracking-wider uppercase sm:text-2xl md:text-3xl lg:text-4xl sm:mb-10 md:mb-12 text-secondary animate-fade-in-up drop-shadow-md">{content.hero.subtitle}</h2>
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-6">
            <button
              onClick={handleScheduleClick}
              className="px-10 py-4 text-sm font-light tracking-widest text-primary uppercase transition-all duration-300 border-2 rounded shadow-lg bg-accent hover:bg-transparent hover:text-accent sm:px-14 md:px-16 sm:py-4 md:py-5 sm:text-base md:text-lg border-accent animate-fade-in hover:scale-110 hover:shadow-2xl hover:drop-shadow-lg active:scale-95"
            >
              {content.hero.cta_button}
            </button>
            <a
              href="#careers"
              onClick={(e) => { e.preventDefault(); const el = document.getElementById('careers'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }) }}
              className="px-10 py-4 text-sm font-light tracking-widest text-primary uppercase transition-all duration-300 bg-secondary border-2 rounded shadow-lg hover:bg-transparent hover:text-secondary sm:px-14 md:px-16 sm:py-4 md:py-5 sm:text-base md:text-lg border-secondary animate-fade-in hover:scale-110 hover:shadow-2xl hover:drop-shadow-lg active:scale-95"
            >
              {content.hero.cta_button_secondary}
            </a>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="py-2 container-custom">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Services Section */}
      <section id="services" className="py-10 bg-white sm:py-14">
        <div className="container-custom">
          <p className="text-center text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40 mb-2">What We Offer</p>
          <h2 className="mb-6 text-3xl font-bold text-center sm:text-4xl text-primary animate-fade-in-up">{content.services_section.title}</h2>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {getCategories().map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-accent text-primary shadow-sm font-semibold'
                    : 'border border-primary/20 text-primary/60 hover:border-accent/60 hover:text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 sm:gap-5">
            {getServicesByCategory(selectedCategory).map((service, index) => (
              <div
                key={service.id}
                className="flex flex-col overflow-hidden bg-white border border-primary/10 rounded-2xl shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-300 animate-fade-in-up"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div className="h-1 bg-gradient-to-r from-accent/80 to-accent/30" />
                <div className="flex flex-col flex-1 p-3 sm:p-5">
                  <h3 className="mb-1 text-sm font-bold text-primary sm:text-lg sm:mb-1.5">{service.name}</h3>
                  <p className="mb-3 text-xs text-primary/55 leading-relaxed flex-1 sm:text-sm sm:mb-4">{service.description}</p>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-sm font-bold text-accent sm:text-xl">
                      ${Number(service.price_min) % 1 === 0 ? Number(service.price_min) : Number(service.price_min).toFixed(2)} – ${Number(service.price_max) % 1 === 0 ? Number(service.price_max) : Number(service.price_max).toFixed(2)}
                    </span>
                    <span className="flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary/5 text-primary/50 sm:px-2.5 sm:py-1 sm:text-xs sm:gap-1">
                      <FiClock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {service.duration}m
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBookingService({ id: service.id, name: service.name, category: service.category, price_min: service.price_min, price_max: service.price_max, duration: service.duration })
                      setSelectedBookingCategory(service.category)
                      setSelectedDate(new Date())
                      openBookingModal()
                    }}
                    className="w-full py-2 text-xs font-semibold text-primary rounded-xl bg-accent hover:bg-accent/80 transition-all duration-200 hover:scale-[1.02] active:scale-95 sm:py-2.5 sm:text-sm"
                  >
                    {content.hero.cta_button}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="py-2 container-custom">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Stylists Section */}
      <section id="stylists" className="py-10 bg-white sm:py-14">
        <div className="container-custom">
          <p className="text-center text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40 mb-2">Our Team</p>
          <h2 className="mb-2 text-3xl font-bold text-center sm:text-4xl text-primary animate-fade-in-up">Meet Our Stylists</h2>
          <p className="mb-4 text-center text-sm text-primary/60 animate-fade-in-up" style={{ animationDelay: '100ms' }}>Talented professionals ready to bring your vision to life</p>

          {/* Recruiting strip */}
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-3.5 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary/50">We're growing</p>
              <p className="text-sm font-medium text-secondary mt-0.5">Passionate about hair? <span className="text-secondary/60 font-normal">We'd love to have you on the team.</span></p>
            </div>
            <a
              href="#careers"
              onClick={(e) => { e.preventDefault(); const el = document.getElementById('careers'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }) }}
              className="flex-shrink-0 px-6 py-2 text-xs font-semibold tracking-widest text-primary uppercase rounded-lg bg-accent hover:bg-accent/80 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              {content.hero.cta_button_secondary}
            </a>
          </div>

          {stylistsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex flex-col rounded-2xl overflow-hidden border border-amber-100 bg-white shadow-sm animate-pulse">
                  <div className="w-full h-48 bg-amber-100" />
                  <div className="p-5 flex flex-col gap-3">
                    <div className="h-5 w-2/5 rounded bg-amber-100" />
                    <div className="h-3 w-1/3 rounded bg-amber-50" />
                    <div className="space-y-2 mt-1">
                      <div className="h-3 rounded bg-gray-100" />
                      <div className="h-3 rounded bg-gray-100" />
                    </div>
                    <div className="mt-2 h-9 rounded-xl bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : stylists.length === 0 ? (
            <p className="text-center text-sm text-primary/40 py-12">Stylists coming soon — check back shortly.</p>
          ) : stylists.length === 1 ? (
            /* Single stylist — featured horizontal card */
            <div className="group flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md border border-amber-100 bg-white hover:shadow-xl hover:border-amber-300 transition-all duration-300 max-w-3xl mx-auto">
              <div className="relative w-full sm:w-2/5 h-56 sm:h-auto bg-amber-50 overflow-hidden flex-shrink-0">
                {stylists[0].photo ? (
                  <img src={stylists[0].photo} alt={stylists[0].name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                    <span className="text-8xl font-bold text-amber-600/30">{stylists[0].name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1 p-6 gap-3">
                <div>
                  <h3 className="text-2xl font-bold uppercase text-primary tracking-wide">{stylists[0].name}</h3>
                  {stylists[0].title && <p className="text-xs font-semibold text-accent uppercase tracking-widest mt-0.5">{stylists[0].title}</p>}
                </div>
                <p className="text-sm text-primary/70 leading-relaxed flex-1">{stylists[0].bio}</p>
                {stylists[0].specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {stylists[0].specialties.map((s, i) => (
                      <span key={i} className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">{s}</span>
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-1.5 pt-3 border-t border-amber-100">
                  {stylists[0].phone && (
                    <a href={`tel:${stylists[0].phone.replace(/[^0-9]/g, '')}`} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors">
                      <FiPhone className="w-4 h-4 flex-shrink-0" />{stylists[0].phone}
                    </a>
                  )}
                  {stylists[0].instagram_handle && (
                    <a href={`https://instagram.com/${stylists[0].instagram_handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors">
                      <FiInstagram className="w-4 h-4 flex-shrink-0" />@{stylists[0].instagram_handle}
                    </a>
                  )}
                </div>
                {stylists[0].booking_slug && (
                  <button onClick={() => handleStylistBookClick(stylists[0])} className="w-full py-2.5 rounded-xl bg-accent text-primary text-sm font-bold hover:bg-accent/80 hover:scale-[1.02] active:scale-95 transition-all duration-200">
                    {content.hero.cta_button}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Multiple stylists — grid */
            <div className={`grid gap-5 ${stylists.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {stylists.map((stylist, index) => (
                <div
                  key={stylist.id}
                  className="group flex flex-col rounded-2xl overflow-hidden shadow-sm border border-amber-100 bg-white hover:-translate-y-1 hover:shadow-lg hover:border-amber-300 transition-all duration-300"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className="relative w-full h-48 bg-amber-50 overflow-hidden">
                    {stylist.photo ? (
                      <img src={stylist.photo} alt={stylist.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                        <span className="text-6xl font-bold text-amber-600/30">{stylist.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <div>
                      <h3 className="text-lg font-bold uppercase text-primary tracking-wide">{stylist.name}</h3>
                      {stylist.title && <p className="text-xs font-semibold text-accent uppercase tracking-widest mt-0.5">{stylist.title}</p>}
                    </div>
                    <p className="text-sm text-primary/70 leading-relaxed flex-1">{stylist.bio}</p>
                    {stylist.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {stylist.specialties.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">{s}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-amber-100">
                      {stylist.phone && (
                        <a href={`tel:${stylist.phone.replace(/[^0-9]/g, '')}`} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors">
                          <FiPhone className="w-4 h-4 flex-shrink-0" />{stylist.phone}
                        </a>
                      )}
                      {stylist.instagram_handle && (
                        <a href={`https://instagram.com/${stylist.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors">
                          <FiInstagram className="w-4 h-4 flex-shrink-0" />@{stylist.instagram_handle}
                        </a>
                      )}
                    </div>
                    {stylist.booking_slug && (
                      <button onClick={() => handleStylistBookClick(stylist)} className="mt-1 w-full py-2.5 rounded-xl bg-accent text-primary text-sm font-bold hover:bg-accent/80 hover:scale-[1.02] active:scale-95 transition-all duration-200">
                        {content.hero.cta_button}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="bg-white">
        <Gallery instagramUrl={business.social.instagram} />
      </section>

      {/* Section Divider */}
      <div className="py-2 container-custom">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Book / Reviews Section */}
      <section id="book" className="py-10 bg-white sm:py-14">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40 mb-1">{content.reviews_section.subtitle}</p>
              <h2 className="text-2xl font-bold sm:text-3xl text-primary">{content.reviews_section.title}</h2>
            </div>
            <button onClick={handleScheduleClick} className="flex-shrink-0 text-sm btn-accent hover:scale-105 active:scale-95">
              {content.hero.cta_button}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => {
              const isActive = index === activeReviewIndex
              return (
                <div
                  key={index}
                  onClick={() => setActiveReviewIndex(index)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    isActive
                      ? 'bg-secondary/20 border-accent shadow-md'
                      : 'bg-secondary/10 border-transparent hover:border-accent/40 opacity-70 hover:opacity-100'
                  } ${!isActive ? 'hidden md:block' : ''}`}
                >
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-accent/50'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-3 text-sm italic text-primary/80">
                    &quot;{isActive ? typedReviewText : review.text}&quot;
                    {isActive && isTypingReview && <span className="inline-block w-0.5 h-4 ml-0.5 bg-accent align-middle animate-review-cursor" />}
                  </p>
                  <p className={`text-xs font-semibold ${isActive ? 'text-accent' : 'text-primary/60'}`}>— {review.name}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="py-2 container-custom">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Careers Section */}
      <section id="careers" className="py-10 bg-white sm:py-14">
        <div className="container-custom max-w-3xl">
          <div className="mb-8 text-center">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40 mb-2">Work With Us</p>
            <h2 className="mb-2 text-3xl font-bold sm:text-4xl text-primary">{careers.tagline}</h2>
            <p className="text-base text-primary/60 mb-4">{careers.introduction}</p>
            <button
              onClick={async () => {
                const url = `${window.location.origin}/careers`
                await navigator.clipboard.writeText(url)
                setCareersLinkShared(true)
                setTimeout(() => setCareersLinkShared(false), 2000)
                if (typeof navigator.share === 'function') {
                  try { await navigator.share({ title: 'Join Our Team — Myy Signature Myy Style', text: 'We\'re hiring talented stylists! Check out our open positions.', url }) } catch { /* cancelled */ }
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/40 text-xs font-semibold text-accent hover:bg-accent/10 transition-all duration-200"
            >
              <FiShare2 className="w-3.5 h-3.5" />
              {careersLinkShared ? 'Link Copied!' : 'Share Careers Page'}
            </button>
          </div>

          <div className="space-y-4">
            {careers.open_positions.map((position) => (
              <div key={position.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-primary/10 bg-white hover:border-accent/40 hover:shadow-sm transition-all duration-200">
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-primary mb-1">{position.title}</h4>
                  <p className="text-sm text-primary/60 mb-2">{position.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-accent/10 text-accent">{position.type}</span>
                    <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-primary/5 text-primary/60">📍 {position.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPosition(position.title)
                    setApplicationData({ ...applicationData, position: position.title })
                    setShowApplicationModal(true)
                  }}
                  className="flex-shrink-0 text-sm btn-accent whitespace-nowrap hover:scale-105 active:scale-95"
                >
                  {content.hero.cta_button_secondary}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="py-2 container-custom">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* About Section */}
      <section id="about" className="py-10 bg-white sm:py-14">
        <div className="container-custom">
          <div className="grid items-center grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            <div className="animate-slide-in-left">
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl text-primary">{content.about_section.title}</h2>
              <p className="mb-4 text-base sm:text-lg text-primary">
                {appConfig.app.description}
              </p>
              <p className="text-sm sm:text-base text-primary/80">
                {content.about_section.location_text.replace('{ADDRESS}', business.address)}
              </p>
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
      <div className="py-2 container-custom">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      </div>

      {/* Contact Section */}
      <section id="contact" className="py-10 bg-white sm:py-14">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40 mb-2">Get In Touch</p>
            <h2 className="mb-6 text-3xl font-bold text-center sm:text-4xl text-primary animate-fade-in-up">{content.footer.sections.contact.title}</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Left: Contact info cards */}
              <div className="flex flex-col gap-4 animate-fade-in-up">

                {/* Visit Us */}
                <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-primary/[0.04] border border-primary/10">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <FiMapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-1">Visit Us</p>
                    <p className="text-sm sm:text-base text-primary/80 mb-3">{business.address}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(business.address)
                          setAddressCopied(true)
                          setTimeout(() => setAddressCopied(false), 2000)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg border-accent/40 text-primary/70 hover:text-accent hover:border-accent transition-colors duration-200"
                      >
                        <FiCopy className="w-3.5 h-3.5" />
                        {addressCopied ? 'Copied!' : 'Copy'}
                      </button>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg border-accent/40 text-primary/70 hover:text-accent hover:border-accent transition-colors duration-200"
                      >
                        <FiMap className="w-3.5 h-3.5" />
                        Directions
                      </a>
                    </div>
                  </div>
                </div>

                {/* Call + Email side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href={`tel:${business.contact.phone}`}
                    className="group flex flex-col p-4 sm:p-5 rounded-2xl bg-primary/[0.04] border border-primary/10 hover:border-accent/40 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-3 group-hover:bg-accent/30 transition-colors duration-200">
                      <FiPhone className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-1">Call Us</p>
                    <p className="text-sm font-bold text-accent">{business.contact.phone}</p>
                  </a>
                  <a
                    href={`mailto:${business.contact.email}`}
                    className="group flex flex-col p-4 sm:p-5 rounded-2xl bg-primary/[0.04] border border-primary/10 hover:border-accent/40 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-3 group-hover:bg-accent/30 transition-colors duration-200">
                      <FiMail className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-1">Email Us</p>
                    <p className="text-xs font-bold text-accent break-all">{business.contact.email}</p>
                  </a>
                </div>

                {/* Hours + Follow Us side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-primary/[0.04] border border-primary/10">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                      <FiClock className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">{content.footer.sections.hours.title}</p>
                    <p className="text-xs text-primary/70 mb-0.5">{content.footer.sections.hours.monday}</p>
                    <p className="text-xs text-primary/70 mb-0.5">{content.footer.sections.hours.tue_sat}</p>
                    <p className="text-xs text-primary/70">{content.footer.sections.hours.sunday}</p>
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl bg-primary/[0.04] border border-primary/10">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                      <FiShare2 className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">{content.footer.sections.follow.title}</p>
                    <div className="flex flex-col gap-1">
                      {business.social.instagram && (
                        <a href={business.social.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/80 transition-colors duration-200">
                          <FiInstagram className="w-3 h-3" />@myysignaturemyystyle
                        </a>
                      )}
                      {business.social.instagram_braids && (
                        <a href={business.social.instagram_braids} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/80 transition-colors duration-200">
                          <FiInstagram className="w-3 h-3" />@myybraidz
                        </a>
                      )}
                      {business.social.tiktok && (
                        <a href={business.social.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/80 transition-colors duration-200">
                          <SiTiktok className="w-3 h-3" />@okpako84
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Message CTA + storefront image */}
              <div className="flex flex-col gap-4 animate-fade-in-up">
                <div className="p-5 sm:p-6 rounded-2xl bg-primary/[0.04] border border-primary/10">
                  <h3 className="mb-1 text-lg font-bold sm:text-xl text-primary">Send us a Message</h3>
                  <p className="text-sm text-primary/50 mb-4">Have a question or want to book? We&apos;ll get back to you.</p>
                  <button
                    type="button"
                    onClick={handleMessageClick}
                    className="w-full text-sm font-semibold shadow-lg btn-accent sm:text-base hover:scale-105 active:scale-95"
                  >
                    Leave A Message
                  </button>
                </div>
                <div className="flex-1 min-h-[200px]">
                  <Image
                    src="https://res.cloudinary.com/dvkbgsaaf/image/upload/f_auto,q_auto,w_900/out_landing_vnkdxq"
                    alt="Myy Signature storefront"
                    width={800}
                    height={600}
                    unoptimized
                    className="w-full h-full object-cover rounded-2xl"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/others/out_landing.png' }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Connect With Us Section */}
      <section id="connect" className="py-8 sm:py-12 bg-primary">
        <div className="container-custom">
          <div className="flex items-center gap-6 sm:gap-10 md:gap-16 max-w-4xl mx-auto">

            {/* Phone mockup image — always side-by-side, scales with screen */}
            <div className="flex-shrink-0 w-28 sm:w-48 md:w-64 drop-shadow-2xl">
              <Image
                src="/assets/images/others/msms_ig_image.png"
                alt="Myy Signature Myy Style on Instagram"
                width={400}
                height={700}
                className="w-full h-auto rounded-2xl md:rounded-3xl"
              />
            </div>

            {/* Text + links */}
            <div className="flex-1 min-w-0">
              <p className="mb-1 text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-secondary/50">Follow & Reach Us</p>
              <h2 className="mb-3 sm:mb-5 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-widest uppercase text-secondary leading-tight" style={{letterSpacing:'0.1em'}}>
                Connect<br />With Us
              </h2>

              <div className="flex flex-col gap-3 sm:gap-5">
                {/* Instagram */}
                <a
                  href={business.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 sm:gap-4 group"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <FiInstagram className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-sm sm:text-lg font-bold text-secondary group-hover:text-accent transition-colors duration-200 truncate">
                    @myysignaturemyystyle
                  </span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${business.contact.email}`}
                  className="flex items-center gap-3 sm:gap-4 group"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-accent/80 shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <FiMail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <span className="text-sm sm:text-lg font-bold text-secondary group-hover:text-accent transition-colors duration-200 truncate">
                    {business.contact.email}
                  </span>
                </a>

                {/* Phone */}
                <a
                  href={`tel:${business.contact.phone.replace(/[^0-9]/g, '')}`}
                  className="flex items-center gap-3 sm:gap-4 group"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-secondary/20 shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <FiPhone className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                  </div>
                  <span className="text-sm sm:text-lg font-bold text-secondary group-hover:text-accent transition-colors duration-200 truncate">
                    {business.contact.phone}
                  </span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-primary text-secondary sm:py-10">
        <div className="container-custom">
          <div className="flex justify-center mb-6">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:opacity-75 transition-opacity">
              <Image src="/assets/images/others/logo-main.svg" alt="Myy Signature Myy Style" width={240} height={72} className="w-auto h-16 opacity-90" unoptimized />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-5 md:grid-cols-4 sm:gap-8">
            <div className="animate-fade-in-up">
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
            <div className="animate-fade-in-up">
              <h3 className="mb-4 text-base font-bold sm:text-lg">{content.footer.sections.contact.title}</h3>
              <p className="text-xs sm:text-sm text-secondary/90">{business.address}</p>
              <p className="mt-2 text-xs sm:text-sm text-secondary/90">{business.contact.phone}</p>
              <p className="text-xs sm:text-sm text-secondary/90">{business.contact.email}</p>
            </div>
            <div className="animate-fade-in-up">
              <h3 className="mb-4 text-base font-bold sm:text-lg">{content.footer.sections.hours.title}</h3>
              <p className="text-xs sm:text-sm text-secondary/90">{content.footer.sections.hours.monday}</p>
              <p className="text-xs sm:text-sm text-secondary/90">{content.footer.sections.hours.tue_sat}</p>
              <p className="text-xs sm:text-sm text-secondary/90">{content.footer.sections.hours.sunday}</p>
            </div>
            <div className="animate-fade-in-up">
              <h3 className="mb-4 text-base font-bold sm:text-lg">{content.footer.sections.follow.title}</h3>
              <div className="flex justify-start gap-4">
                {business.social.instagram && (
                  <a href={business.social.instagram} target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 text-secondary/70 hover:text-accent" aria-label="Instagram @myysignaturemyystyle">
                    <FiInstagram className="w-6 h-6" />
                  </a>
                )}
                {business.social.instagram_braids && (
                  <a href={business.social.instagram_braids} target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 text-secondary/70 hover:text-accent" aria-label="Instagram @myybraidz">
                    <FiInstagram className="w-6 h-6" />
                  </a>
                )}
                {business.social.tiktok && (
                  <a href={business.social.tiktok} target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 text-secondary/70 hover:text-accent" aria-label="TikTok @okpako84">
                    <SiTiktok className="w-5 h-5" />
                  </a>
                )}
                <a
                  href="/admin"
                  className="transition-colors duration-300 text-secondary/20 hover:text-secondary/60"
                  aria-label="Admin"
                >
                  <FiSettings className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <hr className="mb-6 border-secondary/30" />
          <div className="relative flex justify-center items-center text-xs text-secondary/70 sm:text-sm">
            {/* Scroll to top — left badge */}
            <button
              onClick={scrollToTop}
              className="absolute left-0 transition-transform duration-300 hover:scale-110"
              aria-label="Scroll to top"
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '9px',
                background: 'linear-gradient(145deg, #c4a870, #a89880, #7a6450)',
                boxShadow: 'inset 1px 1px 1px rgba(255,225,160,0.3), inset -1px -1px 1px rgba(0,0,0,0.3), 2px 3px 6px rgba(0,0,0,0.55)',
              }}>
                <svg style={{ width: '18px', height: '18px', strokeWidth: 2.5 }} fill="none" stroke="#2a2420" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </span>
            </button>

            <p>{content.footer.copyright.replace('{APP_NAME}', appConfig.app.name)}</p>

            {/* FTTG dev badge — right */}
            <a
              href={content.footer.developed_by_link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-0 transition-transform duration-300 hover:scale-110"
              title="Built by FTTG Solutions"
              aria-label="Built by FTTG Solutions"
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '9px',
                background: 'linear-gradient(145deg, #c4a870, #a89880, #7a6450)',
                boxShadow: 'inset 1px 1px 1px rgba(255,225,160,0.3), inset -1px -1px 1px rgba(0,0,0,0.3), 2px 3px 6px rgba(0,0,0,0.55)',
              }}>
                <FiCode style={{ width: '18px', height: '18px', color: '#2a2420', strokeWidth: 2.5 }} />
              </span>
            </a>
          </div>
        </div>
      </footer>

      {/* Scroll to Top — floating, appears mid-page */}
      {/* Floating share booking link */}
      {showShare && <button
        onClick={handleShareBookingLink}
        className="fixed z-40 flex items-center justify-center w-12 h-12 transition-all duration-300 rounded-full shadow-lg bottom-8 left-6 bg-primary/60 backdrop-blur-sm text-secondary hover:bg-accent/80 hover:text-primary hover:scale-110 active:scale-95 animate-fade-in"
        aria-label={bookingLinkShared ? 'Copied!' : 'Share booking link'}
        title={bookingLinkShared ? 'Copied!' : 'Share booking link'}
      >
        {bookingLinkShared ? <span className="text-[10px] font-bold">✓</span> : <FiShare2 className="w-5 h-5" />}
      </button>}

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed z-40 flex items-center justify-center w-12 h-12 text-primary transition-all duration-300 rounded-full shadow-lg bottom-8 right-6 bg-accent hover:bg-accent/80 hover:scale-110 active:scale-95 animate-fade-in"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
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
                    onChange={(e) => { setName(e.target.value); if (formErrors.name) setFormErrors((p) => ({ ...p, name: '' })) }}
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
                    onChange={(e) => { setContact(e.target.value); if (formErrors.contact) setFormErrors((p) => ({ ...p, contact: '' })) }}
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
                      onChange={(e) => { setSelectedService(e.target.value); if (formErrors.service) setFormErrors((p) => ({ ...p, service: '' })) }}
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
                    onChange={(e) => { setMessage(e.target.value); if (formErrors.message) setFormErrors((p) => ({ ...p, message: '' })) }}
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

                {/* API error banner */}
                {contactError && (
                  <div className="flex items-start gap-2 px-4 py-3 text-sm text-red-700 rounded-lg bg-red-50 border border-red-200">
                    <span className="text-base flex-shrink-0">⚠️</span>
                    <p>{contactError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={contactSending}
                  className="w-full py-3 font-bold text-primary transition-all duration-300 rounded-lg shadow-lg bg-accent hover:bg-accent/80 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {contactSending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (content.message_modal?.submit_button || 'Send Message')}
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

          {/* Full Policy Modal */}
          {showFullPolicy && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowFullPolicy(false)}>
              <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in-down"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Policy Modal Header */}
                <div className="sticky top-0 flex items-center justify-between p-5 border-b bg-primary text-secondary border-amber-300 rounded-t-xl">
                  <h3 className="text-lg font-bold">{content.salon_policies.title}</h3>
                  <button
                    onClick={() => setShowFullPolicy(false)}
                    className="text-2xl font-bold transition-colors text-secondary/70 hover:text-secondary leading-none"
                  >
                    ×
                  </button>
                </div>
                {/* Policy Modal Body */}
                <div className="p-5 space-y-5 text-sm text-gray-800">
                  <p className="text-xs text-gray-500 italic">{content.salon_policies.intro}</p>
                  {(['booking','confirmation','cancellation','deposits','late_arrival','payment','salon_experience','service_guarantee','promise'] as const).map((key) => {
                    const section = content.salon_policies[key] as { title: string; intro?: string; points?: string[]; text?: string }
                    return (
                      <div key={key} className="space-y-1">
                        <p className="font-bold text-amber-800">{section.title}</p>
                        {section.intro && <p className="text-xs text-gray-600 italic">{section.intro}</p>}
                        {section.points?.map((pt, i) => (
                          <p key={i} className="text-xs text-gray-700">• {pt}</p>
                        ))}
                        {section.text && <p className="text-xs text-gray-700">{section.text}</p>}
                      </div>
                    )
                  })}
                </div>
                <div className="sticky bottom-0 p-4 border-t bg-amber-50 border-amber-200 rounded-b-xl">
                  <button
                    onClick={() => setShowFullPolicy(false)}
                    className="w-full py-2.5 rounded-lg bg-primary text-secondary font-bold text-sm hover:bg-primary/90 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md md:max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in-down">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-primary text-secondary border-accent/20">
              <h2 className="text-2xl font-bold">{content.reviews_section.cta_button}</h2>
              <button
                onClick={() => {
                  closeBookingModal()
                  setBookingName('')
                  setBookingEmail('')
                  setBookingContact('')
                  setSelectedBookingService(null)
                  setSelectedBookingStylist(null)
                  setSelectedDate(null)
                  setSelectedTime(null)
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

            {/* Modal Body — two columns on desktop */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:items-start">

                {/* ── LEFT: Calendar → Service → Time ── */}
                <div className="space-y-4">
                  {/* Stylist selector — banner when only one, picker chips when multiple */}
                  {stylists.length > 1 ? (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-primary/40 mb-2">Choose Your Stylist</p>
                      <div className="flex flex-wrap gap-2">
                        {stylists.map((s) => {
                          const isActive = selectedBookingStylist?.id === s.id
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setSelectedBookingStylist({ id: s.id, staff_id: s.staff_id, name: s.name, title: s.title, photo: s.photo, booking_slug: s.booking_slug, specialties: s.specialties, availability: s.availability ?? null })
                                setSelectedBookingService(null)
                                setSelectedTime(null)
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 text-sm font-semibold transition-all duration-200 ${
                                isActive ? 'border-accent bg-accent/15 text-primary' : 'border-secondary/30 bg-white text-primary/70 hover:border-accent/50'
                              }`}
                            >
                              {s.photo ? (
                                <img src={s.photo} alt={s.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent">{s.name.charAt(0)}</div>
                              )}
                              {s.name.split(' ')[0]}
                              {isActive && (
                                <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : selectedBookingStylist && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-accent/10 border-accent/30">
                      {selectedBookingStylist.photo ? (
                        <img src={selectedBookingStylist.photo} alt={selectedBookingStylist.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-accent/40" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 border-2 border-accent/40">
                          <span className="text-accent font-bold text-sm">{selectedBookingStylist.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-primary/60 font-medium">Booking with</p>
                        <p className="font-bold text-primary truncate">{selectedBookingStylist.name}</p>
                        {selectedBookingStylist.title && <p className="text-xs text-primary/50 truncate">{selectedBookingStylist.title}</p>}
                      </div>
                    </div>
                  )}

                  {/* Month Navigation */}
                  <div className="flex items-center justify-between">
                    <button onClick={handlePrevMonth} className="px-4 py-2 transition-colors rounded bg-secondary/20 hover:bg-secondary/30 text-primary">←</button>
                    <h3 className="text-xl font-bold text-primary">
                      {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={handleNextMonth} className="px-4 py-2 transition-colors rounded bg-secondary/20 hover:bg-secondary/30 text-primary">→</button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-1 mb-4 sm:gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-sm font-bold text-center text-primary/60">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {generateCalendarDays().map((dayObj, idx) => {
                        const isCurrentMonth = dayObj.isCurrentMonth
                        const isTodayDate = isToday(dayObj.date)
                        const isPast = isPastDate(dayObj.date)
                        const isSelected = selectedDate && dayObj.date.toDateString() === selectedDate.toDateString()
                        return (
                          <button
                            key={idx}
                            onClick={() => { if (!isPast) { setSelectedDate(new Date(dayObj.date)); setSelectedTime(null) } }}
                            disabled={isPast}
                            className={`
                              aspect-square rounded-lg font-semibold text-sm transition-all duration-200
                              ${!isCurrentMonth ? 'text-primary/30 bg-transparent cursor-default' : ''}
                              ${isTodayDate ? 'bg-accent text-primary ring-2 ring-accent ring-offset-1' : ''}
                              ${isSelected && !isTodayDate ? 'bg-primary text-white ring-2 ring-primary ring-offset-1' : ''}
                              ${isCurrentMonth && !isTodayDate && !isSelected && !isPast ? 'bg-secondary/20 hover:bg-secondary/40 text-primary cursor-pointer hover:shadow-md' : ''}
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
                    <div className="p-3 border rounded-lg bg-secondary/10 border-secondary/30">
                      <p className="text-xs text-primary/60 mb-0.5">Selected Date</p>
                      <p className="text-base font-bold text-primary">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}

                  {/* Unavailability banner — shown immediately after date is picked */}
                  {selectedDate && getDaySchedule(selectedDate) === 'closed' && (
                    <div className="p-4 border rounded-lg bg-secondary/10 border-secondary/40 text-center">
                      <p className="text-sm font-semibold text-primary/80">
                        {selectedBookingStylist
                          ? `${selectedBookingStylist.name} is not available on ${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}s.`
                          : `The salon is closed on ${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}s.`}
                      </p>
                      <p className="mt-1 text-xs text-primary/50">Please select a different date or contact us directly.</p>
                    </div>
                  )}

                  {/* Service Category Pills — hidden when selected date is unavailable */}
                  {(!selectedDate || getDaySchedule(selectedDate) !== 'closed') && <div className="space-y-2">
                    <label className="block text-sm font-bold text-primary">Service Category</label>
                    <div className="flex flex-wrap gap-2">
                      {getBookingCategories().map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => { setSelectedBookingCategory(category); setSelectedBookingService(null); setSelectedTime(null) }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                            selectedBookingCategory === category
                              ? 'bg-primary text-secondary border-primary'
                              : 'bg-white text-primary/70 border-secondary/30 hover:border-accent/50 hover:text-primary'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>}

                  {/* Service list — mobile only, hidden when day is closed */}
                  {(!selectedDate || getDaySchedule(selectedDate) !== 'closed') && selectedBookingCategory && (
                    <div className="md:hidden border rounded-lg bg-secondary/5 border-secondary/20 overflow-hidden">
                      <p className="px-4 py-2 text-xs font-bold text-primary/60 uppercase tracking-wide border-b border-secondary/20">{selectedBookingCategory}</p>
                      <div className="divide-y divide-secondary/10 max-h-52 overflow-y-auto">
                        {getServicesByCategory(selectedBookingCategory).map((service) => {
                          const isSelected = selectedBookingService?.id === service.id
                          return (
                            <div key={service.id} onClick={() => { setSelectedBookingService({ id: service.id, name: service.name, category: service.category, price_min: service.price_min, price_max: service.price_max, duration: service.duration }); setSelectedTime(null) }}
                              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 ${isSelected ? 'bg-accent/15 border-l-4 border-l-accent' : 'hover:bg-secondary/10 border-l-4 border-l-transparent'}`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate text-primary">{service.name}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <p className="text-xs font-bold text-accent">${service.price_min} – ${service.price_max}</p>
                                  <p className="text-[10px] text-primary/50">⏱ {service.duration} min</p>
                                </div>
                              </div>
                              <div className={`ml-3 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-accent border-accent' : 'border-secondary/40'}`}>
                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Time Slot Picker — appears once both date and service are selected and day is open */}
                  {selectedDate && selectedBookingService && getDaySchedule(selectedDate) !== 'closed' && (() => {
                    const schedule = getDaySchedule(selectedDate)
                    const slots = generateTimeSlots(schedule, selectedBookingService.duration)
                    if (slots.length === 0) {
                      return (
                        <div className="p-4 border rounded-lg bg-secondary/10 border-secondary/30 text-center">
                          <p className="text-sm font-semibold text-primary/70">No available time slots for this service on the selected date.</p>
                          <p className="mt-1 text-xs text-primary/50">Please select a different date or contact us directly.</p>
                        </div>
                      )
                    }
                    return (
                      <div>
                        <p className="mb-2 text-sm font-bold text-primary">Select a Time</p>
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTime(slot === selectedTime ? null : slot)}
                              className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                                selectedTime === slot
                                  ? 'bg-accent text-primary border-accent shadow-md scale-105'
                                  : 'bg-secondary/10 text-primary border-secondary/30 hover:bg-secondary/30 hover:border-secondary/50'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                        {selectedTime && <p className="mt-2 text-xs text-accent font-semibold">⏰ {selectedTime}</p>}
                      </div>
                    )
                  })()}
                </div>

                {/* ── RIGHT: Personal Information ── */}
                <div className="mt-8 md:mt-0 space-y-5">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-primary">Your Information</h3>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-primary">Full Name</label>
                      <input
                        type="text"
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition text-primary placeholder-gray-400 ${
                          formErrors.bookingName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-secondary/30 focus:border-accent focus:ring-accent/20'
                        }`}
                        placeholder="John Doe"
                      />
                      {formErrors.bookingName && <p className="mt-1 text-xs text-red-500">{formErrors.bookingName}</p>}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-primary">Email</label>
                      <input
                        type="email"
                        value={bookingEmail}
                        onChange={(e) => setBookingEmail(e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition text-primary placeholder-gray-400 ${
                          formErrors.bookingEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-secondary/30 focus:border-accent focus:ring-accent/20'
                        }`}
                        placeholder="john@example.com"
                      />
                      {formErrors.bookingEmail && <p className="mt-1 text-xs text-red-500">{formErrors.bookingEmail}</p>}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-primary">Phone Number</label>
                      <input
                        type="tel"
                        value={bookingContact}
                        onChange={(e) => setBookingContact(e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition text-primary placeholder-gray-400 ${
                          formErrors.bookingContact ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-secondary/30 focus:border-accent focus:ring-accent/20'
                        }`}
                        placeholder="(123) 456-7890"
                      />
                      {formErrors.bookingContact && <p className="mt-1 text-xs text-red-500">{formErrors.bookingContact}</p>}
                    </div>
                  </div>

                  {/* Service list — desktop only (fills empty space, mobile version is in left column) */}
                  {selectedBookingCategory && (
                    <div className="hidden md:block border rounded-lg bg-secondary/5 border-secondary/20 overflow-hidden">
                      <p className="px-4 py-2 text-xs font-bold text-primary/60 uppercase tracking-wide border-b border-secondary/20">{selectedBookingCategory}</p>
                      <div className="divide-y divide-secondary/10 max-h-64 overflow-y-auto">
                        {getServicesByCategory(selectedBookingCategory).map((service) => {
                          const isSelected = selectedBookingService?.id === service.id
                          return (
                            <div key={service.id} onClick={() => { setSelectedBookingService({ id: service.id, name: service.name, category: service.category, price_min: service.price_min, price_max: service.price_max, duration: service.duration }); setSelectedTime(null) }}
                              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 ${isSelected ? 'bg-accent/15 border-l-4 border-l-accent' : 'hover:bg-secondary/10 border-l-4 border-l-transparent'}`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate text-primary">{service.name}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <p className="text-xs font-bold text-accent">${service.price_min} – ${service.price_max}</p>
                                  <p className="text-[10px] text-primary/50">⏱ {service.duration} min</p>
                                </div>
                              </div>
                              <div className={`ml-3 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-accent border-accent' : 'border-secondary/40'}`}>
                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Booking summary — shown on desktop once selections are made */}
                  {(selectedBookingService || selectedDate || selectedTime) && (
                    <div className="hidden md:block p-4 rounded-xl border border-secondary/20 bg-secondary/5 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-primary/40">Your Booking</p>
                      {selectedBookingService && (
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-primary">{selectedBookingService.name}</p>
                            <p className="text-xs text-primary/50">⏱ {selectedBookingService.duration} min</p>
                          </div>
                          <p className="text-sm font-bold text-accent whitespace-nowrap">${selectedBookingService.price_min} – ${selectedBookingService.price_max}</p>
                        </div>
                      )}
                      {selectedDate && (
                        <p className="text-xs text-primary/70">
                          📅 {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {selectedTime && <span className="ml-1">at {selectedTime}</span>}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── FULL WIDTH BELOW: Policy + Payment + Submit ── */}
              <div className="mt-6 space-y-5 border-t border-secondary/20 pt-6">
                {/* Booking Disclaimer */}
                <div className={`p-4 space-y-1 text-xs border-2 rounded-lg bg-amber-50 text-amber-900 transition-all duration-300 ${formErrors.policyAccepted ? 'border-red-400 bg-red-50' : 'border-amber-300'}`}>
                  <p className="text-sm font-bold">📋 Booking Policy</p>
                  <p>• {content.booking_disclaimer.deposit_note}</p>
                  <p>• {content.booking_disclaimer.cancellation_note}</p>
                  <p>• {content.booking_disclaimer.late_policy}</p>
                  <p>• {content.salon_policies.confirmation.points[2]}</p>
                  <p>• {content.salon_policies.payment.points[2]}</p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowFullPolicy(true)}
                      className="w-full py-2 mt-1 rounded-lg border-2 border-amber-400 bg-amber-100 text-amber-800 text-sm font-bold hover:bg-amber-200 hover:border-amber-600 transition-all duration-200 active:scale-95"
                    >
                      📄 Read Full Salon Policies →
                    </button>
                  </div>
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
                  <div className="grid grid-cols-2 gap-3">
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
                  if (!selectedTime) missing.push('an appointment time')

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

                  setBookingReference('BK' + Date.now().toString().slice(-8))
                  setShowConfirmationModal(true)
                }}
                disabled={false}
                style={(() => {
                  const steps = [
                    !!selectedBookingService,
                    !!selectedDate,
                    !!selectedTime,
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
                    !!selectedTime,
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
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-2xl font-bold text-accent">{bookingReference}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(bookingReference)
                        setCopiedRef(true)
                        setTimeout(() => setCopiedRef(false), 2000)
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/10 hover:bg-accent/20 text-accent transition-all text-xs font-bold flex-shrink-0"
                    >
                      {copiedRef ? '✓ Copied!' : '⧉ Copy'}
                    </button>
                  </div>
                </div>
                <div className="w-full p-4 space-y-3 text-left border rounded-lg bg-secondary/5 border-secondary/20">
                  <p className="text-sm text-primary/70"><span className="font-semibold text-primary">Confirmation email:</span> Sent to {bookingEmail}</p>
                  <p className="text-sm text-primary/70"><span className="font-semibold text-primary">Appointment:</span> {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  <p className="text-sm text-primary/70"><span className="font-semibold text-primary">Service:</span> {selectedBookingService.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowConfirmationModal(false)
                    closeBookingModal()
                    setConfirmationStep('review')
                    setBookingName(''); setBookingEmail(''); setBookingContact('')
                    setSelectedBookingService(null); setSelectedBookingStylist(null); setSelectedDate(null); setSelectedTime(null); setPolicyAccepted(false)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-full py-3 font-bold text-primary transition-all duration-300 rounded-lg bg-accent hover:bg-accent/80 hover:scale-105 active:scale-95"
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
                  {selectedTime && <p className="text-sm font-semibold text-accent mt-1">⏰ {selectedTime}</p>}
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
                  <span>{bookingReference}</span>
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
                    setConfirmationStep('confirmed')
                    fetch('/api/booking', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        booking_reference: bookingReference,
                        customer_name: bookingName,
                        customer_email: bookingEmail,
                        customer_phone: bookingContact,
                        stylist_name: selectedBookingStylist?.name ?? 'Any Available Stylist',
                        service_name: selectedBookingService?.name,
                        service_category: selectedBookingService?.category,
                        service_duration: selectedBookingService?.duration,
                        service_price_min: selectedBookingService?.price_min,
                        service_price_max: selectedBookingService?.price_max,
                        appointment_date: selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                        appointment_date_iso: selectedDate?.toISOString().split('T')[0],
                        appointment_time: selectedTime ?? '',
                      }),
                    }).catch((err) => console.error('[booking email]', err))
                    // Auto-close after 5 seconds
                    setTimeout(() => {
                      setShowConfirmationModal(false)
                      closeBookingModal()
                      setConfirmationStep('review')
                      setBookingName('')
                      setBookingEmail('')
                      setBookingContact('')
                      setSelectedBookingService(null)
                      setSelectedBookingStylist(null)
                      setSelectedDate(null)
                      setSelectedTime(null)
                      setPolicyAccepted(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }, 5000)
                  }}
                  className="flex-1 py-3 font-bold text-primary transition-all duration-300 rounded-lg shadow-lg bg-accent hover:bg-accent/80 hover:scale-105 active:scale-95"
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
      {/* Global app toast — visible on page and inside modal */}
      {appToast && !showApplicationModal && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] max-w-sm w-full mx-4 px-5 py-4 bg-primary text-secondary rounded-xl shadow-2xl flex items-start gap-3 animate-fade-in-down">
          <span className="text-xl flex-shrink-0">✓</span>
          <p className="text-sm font-semibold leading-snug">{appToast}</p>
        </div>
      )}

      {showApplicationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm">
          {/* Toast */}
          {appToast && (
            <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] max-w-sm w-full mx-4 px-5 py-4 rounded-xl shadow-2xl flex items-start gap-3 animate-fade-in-down ${
              appToast.startsWith('Still needed') ? 'bg-red-600 text-white' : 'bg-primary text-secondary'
            }`}>
              <span className="text-xl flex-shrink-0">{appToast.startsWith('Still needed') ? '⚠️' : '✓'}</span>
              <p className="text-sm font-semibold leading-snug">{appToast}</p>
            </div>
          )}
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
                
                // Build validation errors
                const errors: { [key: string]: string } = {}
                if (!applicationData.full_name.trim()) errors.full_name = 'Name is required'
                if (!applicationData.email.trim()) {
                  errors.email = 'Email is required'
                } else if (!/^\S+@\S+\.\S+$/.test(applicationData.email)) {
                  errors.email = 'Invalid email format'
                }
                if (!applicationData.phone.trim()) errors.phone = 'Phone is required'
                if (!applicationData.employment_type) errors.employment_type = 'Employment type is required'
                if (!applicationData.years_experience.trim()) errors.years_experience = 'Experience is required'
                if (!applicationData.specialties.trim()) errors.specialties = 'Specialties are required'

                setFormErrors(errors)

                // Build friendly toast for missing fields
                const missing: string[] = []
                if (!applicationData.full_name.trim()) missing.push('your name')
                if (!applicationData.email.trim() || !/^\S+@\S+\.\S+$/.test(applicationData.email)) missing.push('a valid email')
                if (!applicationData.phone.trim()) missing.push('your phone')
                if (!applicationData.employment_type) missing.push('employment type')
                if (!applicationData.years_experience.trim()) missing.push('years of experience')
                if (!applicationData.specialties.trim()) missing.push('your specialties')

                if (missing.length > 0) {
                  showAppToast(`Still needed: ${missing.join(', ')}`)
                  // Scroll to first error
                  const firstError = document.querySelector('[data-app-error]')
                  firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  return
                }
                  // Compose availability string from interactive state
                  const availParts: string[] = []
                  if (appAvailDays.length > 0) availParts.push(`Days: ${appAvailDays.join(', ')}`)
                  if (appAvailStartDate) {
                    const d = new Date(appAvailStartDate + 'T00:00:00')
                    availParts.push(`Start: ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`)
                  }
                  const finalData = { ...applicationData, availability: availParts.join(' | ') }
                  fetch('/api/application', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalData),
                  }).catch((err) => console.error('[application email]', err))
                  setApplicationSubmitted(true)
                  setTimeout(() => {
                    setShowApplicationModal(false)
                    setApplicationSubmitted(false)
                    setAppAvailDays([])
                    setAppAvailStartDate('')
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
              }} className="p-6 space-y-5">

                <p className="text-xs font-bold uppercase tracking-widest text-primary/40">Contact</p>

                {/* Row 1: Name + Email */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-primary">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={applicationData.full_name}
                      onChange={(e) => { setApplicationData({ ...applicationData, full_name: e.target.value }); if (formErrors.full_name) setFormErrors({ ...formErrors, full_name: '' }) }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-primary placeholder-gray-400 ${formErrors.full_name ? 'border-red-500' : 'border-accent/30'}`}
                      placeholder="Your full name" />
                    {formErrors.full_name && <p data-app-error className="mt-1 text-xs text-red-500">{formErrors.full_name}</p>}
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-primary">Email <span className="text-red-500">*</span></label>
                    <input type="email" value={applicationData.email}
                      onChange={(e) => { setApplicationData({ ...applicationData, email: e.target.value }); if (formErrors.email) setFormErrors({ ...formErrors, email: '' }) }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-primary placeholder-gray-400 ${formErrors.email ? 'border-red-500' : 'border-accent/30'}`}
                      placeholder="your.email@example.com" />
                    {formErrors.email && <p data-app-error className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                  </div>
                </div>

                {/* Row 2: Phone + Employment Type */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-primary">Phone <span className="text-red-500">*</span></label>
                    <input type="tel" value={applicationData.phone}
                      onChange={(e) => { setApplicationData({ ...applicationData, phone: e.target.value }); if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' }) }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-primary placeholder-gray-400 ${formErrors.phone ? 'border-red-500' : 'border-accent/30'}`}
                      placeholder="(555) 123-4567" />
                    {formErrors.phone && <p data-app-error className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-primary">Employment Type <span className="text-red-500">*</span></label>
                    <div className={`flex gap-2 flex-wrap p-1 rounded-lg ${formErrors.employment_type ? 'ring-1 ring-red-400' : ''}`}>
                      {['Full-time', 'Part-time', 'Flexible'].map((type) => (
                        <button key={type} type="button"
                          onClick={() => { setApplicationData({ ...applicationData, employment_type: type }); if (formErrors.employment_type) setFormErrors({ ...formErrors, employment_type: '' }) }}
                          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                            applicationData.employment_type === type
                              ? 'bg-primary text-secondary border-primary'
                              : 'bg-white text-primary/70 border-accent/30 hover:border-accent/60 hover:text-primary'
                          }`}>{type}</button>
                      ))}
                    </div>
                    {formErrors.employment_type && <p data-app-error className="mt-1 text-xs text-red-500">{formErrors.employment_type}</p>}
                  </div>
                </div>

                <p className="text-xs text-primary/50 italic">Your Georgia Cosmetology License number may be requested during final selection.</p>

                <hr className="border-accent/10" />
                <p className="text-xs font-bold uppercase tracking-widest text-primary/40">Experience</p>

                {/* Row 3: Years Experience + Portfolio */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-primary">Years of Experience <span className="text-red-500">*</span></label>
                    <input type="number" value={applicationData.years_experience} min="0"
                      onChange={(e) => { setApplicationData({ ...applicationData, years_experience: e.target.value }); if (formErrors.years_experience) setFormErrors({ ...formErrors, years_experience: '' }) }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-primary placeholder-gray-400 ${formErrors.years_experience ? 'border-red-500' : 'border-accent/30'}`}
                      placeholder="5" />
                    {formErrors.years_experience && <p data-app-error className="mt-1 text-xs text-red-500">{formErrors.years_experience}</p>}
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-primary">Portfolio URL <span className="text-primary/40 font-normal text-xs">(Instagram, website…)</span></label>
                    <input type="url" value={applicationData.portfolio_url}
                      onChange={(e) => setApplicationData({ ...applicationData, portfolio_url: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg border-accent/30 focus:ring-2 focus:ring-accent focus:border-transparent text-primary placeholder-gray-400" />
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-primary">Specialties / Areas of Expertise <span className="text-red-500">*</span></label>
                  <textarea value={applicationData.specialties} rows={2}
                    onChange={(e) => { setApplicationData({ ...applicationData, specialties: e.target.value }); if (formErrors.specialties) setFormErrors({ ...formErrors, specialties: '' }) }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-primary placeholder-gray-400 ${formErrors.specialties ? 'border-red-500' : 'border-accent/30'}`}
                    placeholder="e.g., Balayage, Box Braids, Natural Hair, Color Corrections…" />
                  {formErrors.specialties && <p data-app-error className="mt-1 text-xs text-red-500">{formErrors.specialties}</p>}
                </div>

                {/* Certifications */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-primary">
                    Certifications & Education <span className="text-primary/40 font-normal">(select all that apply)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {[
                      'Licensed Cosmetologist',
                      'Cosmetology School',
                      'Self Taught',
                      'Natural Hair Certified',
                      'Color Specialist',
                      'Braiding Certified',
                      'Extensions Certified',
                      'Locs Specialist',
                      'Advanced Workshops',
                    ].map((cert) => {
                      const checked = applicationData.certifications.split(',').map(s => s.trim()).filter(Boolean).includes(cert)
                      return (
                        <label key={cert} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs transition-all duration-150 ${
                          checked ? 'bg-accent/10 border-accent text-accent font-semibold' : 'border-accent/20 text-primary/70 hover:border-accent/50'
                        }`}>
                          <input type="checkbox" className="hidden" checked={checked}
                            onChange={() => {
                              const current = applicationData.certifications.split(',').map(s => s.trim()).filter(Boolean)
                              const next = checked ? current.filter(c => c !== cert) : [...current, cert]
                              setApplicationData({ ...applicationData, certifications: next.join(', ') })
                            }} />
                          <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px] ${
                            checked ? 'bg-accent border-accent text-white' : 'border-accent/30'
                          }`}>{checked ? '✓' : ''}</span>
                          {cert}
                        </label>
                      )
                    })}
                  </div>
                </div>

                <hr className="border-accent/10" />
                <p className="text-xs font-bold uppercase tracking-widest text-primary/40">Availability</p>

                {/* Availability */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Day toggles */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-primary">Available days</p>
                    <div className="flex flex-wrap gap-2">
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => {
                        const on = appAvailDays.includes(day)
                        return (
                          <button key={day} type="button"
                            onClick={() => setAppAvailDays(on ? appAvailDays.filter(d => d !== day) : [...appAvailDays, day])}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                              on ? 'bg-accent text-primary border-accent' : 'border-accent/30 text-primary/60 hover:border-accent/60'
                            }`}>{day}</button>
                        )
                      })}
                    </div>
                  </div>
                  {/* Earliest start date — native date picker */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-primary">Earliest start date</label>
                    <input
                      type="date"
                      value={appAvailStartDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setAppAvailStartDate(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg border-accent/30 focus:ring-2 focus:ring-accent focus:border-transparent text-primary"
                    />
                  </div>
                </div>

                <hr className="border-accent/10" />
                <p className="text-xs font-bold uppercase tracking-widest text-primary/40">Tell Us More</p>

                {/* Why Join + References side by side on desktop */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-primary">Why do you want to join our team?</label>
                    <textarea value={applicationData.why_join} rows={3}
                      onChange={(e) => setApplicationData({ ...applicationData, why_join: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg border-accent/30 focus:ring-2 focus:ring-accent focus:border-transparent text-primary placeholder-gray-400"
                      placeholder="Tell us what excites you about this opportunity…" />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-primary">References <span className="text-primary/40 font-normal text-xs">(optional, can share later)</span></label>
                    <textarea value={applicationData.references} rows={3}
                      onChange={(e) => setApplicationData({ ...applicationData, references: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg border-accent/30 focus:ring-2 focus:ring-accent focus:border-transparent text-primary placeholder-gray-400"
                      placeholder="Name, Title, Phone/Email" />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-2">
                  <button type="button"
                    onClick={() => { setShowApplicationModal(false); setFormErrors({}) }}
                    className="flex-1 px-6 py-3 transition-colors border rounded-lg border-accent/30 text-primary hover:bg-secondary/10">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-accent">Submit Application</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
