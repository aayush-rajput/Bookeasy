"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Calendar, QrCode, Mail, Shield, Building, ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const isMobile = useMobile()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Handle scroll for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Animated background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: {
      x: number
      y: number
      radius: number
      color: string
      speedX: number
      speedY: number
      opacity: number
    }[] = []

    const colors = ["#1E0D73", "#FF9800", "#B7BDB7"]

    // Create particles
    for (let i = 0; i < 50; i++) {
      const radius = Math.random() * 5 + 1
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    const animate = () => {
      requestAnimationFrame(animate)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle =
          particle.color +
          Math.floor(particle.opacity * 255)
            .toString(16)
            .padStart(2, "0")
        ctx.fill()

        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1
        }
      })

      // Connect particles with lines if they're close enough
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(183, 189, 183, ${0.1 * (1 - distance / 150)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const navItems = [
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "How It Works",
      link: "#how-it-works",
    },
    {
      name: "For Businesses",
      link: "#for-businesses",
    },
    {
      name: "Testimonials",
      link: "#testimonials",
    },
  ]

  const MotionImage = motion(Image)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F1EB] to-[#F4F1EB]/80 font-poppins overflow-x-hidden">
      {/* Animated Background Canvas */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      {/* Resizable Navbar */}
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <NavbarButton href="https://bookeasy-app.vercel.app" variant="gradient">Get Started</NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMenuOpen(false)}
                className="relative text-[#1E0D73] dark:text-white w-full py-3 border-b border-gray-100"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4 mt-4">
              <NavbarButton href="https://bookeasy-app.vercel.app" variant="gradient" className="w-full">
                Get Started
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center">
        <div className="container relative z-10 mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="font-futura text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1E0D73] leading-tight">
                Book Local Spaces <br />
                <span className="text-[#FF9800] relative">
                  Effortlessly
                  <motion.span
                    className="absolute -bottom-2 left-0 w-full h-1 bg-[#FF9800]"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                </span>
              </h1>
            </motion.div>

            <motion.p
              className="text-lg md:text-xl text-[#050315] max-w-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Connect with local businesses and book their spaces for your events, meetings, or activities with just a
              few clicks.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button className="bg-gradient-to-r from-[#1E0D73] to-[#3D2A9C] hover:from-[#3D2A9C] hover:to-[#1E0D73] text-white text-lg px-8 py-7 rounded-xl group relative overflow-hidden">
                <a href="https://bookeasy-app.vercel.app" target="_blank" rel="noopener noreferrer">
  <span className="relative z-10 cursor-pointer">Get Started</span>
</a>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#FF9800] to-[#FF9800]/80 z-0"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
                  className="relative z-10 ml-2"
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </Button>

              <Button
                variant="outline"
                className="border-[#1E0D73] text-[#1E0D73] hover:bg-[#1E0D73]/5 text-lg px-8 py-7 rounded-xl group relative overflow-hidden"
              >
                <span className="relative z-10">Learn More</span>
                <motion.div
                  className="absolute inset-0 bg-[#1E0D73]/10 z-0"
                  initial={{ y: "100%" }}
                  whileHover={{ y: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="flex-1 relative"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#B7BDB7]/20"
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 6, ease: "easeInOut" }}
            >
              <div className="bg-gradient-to-r from-[#1E0D73] to-[#3D2A9C] p-4 flex items-center">
                <h3 className="font-futura text-white text-xl">Event Calendar</h3>
                <div className="ml-auto flex space-x-1">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-white/70" />
                  ))}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <button className="text-[#1E0D73]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <h4 className="font-medium">April 2025</h4>
                  <button className="text-[#1E0D73]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <div key={i} className="text-center text-[#050315]/70 text-sm font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 31 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer ${
                        i === 14
                          ? "bg-[#FF9800] text-white"
                          : i === 21 || i === 22
                            ? "bg-[#1E0D73]/10 text-[#1E0D73]"
                            : "hover:bg-[#B7BDB7]/10"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {i + 1}
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-[#F4F1EB] rounded-lg">
                  <h5 className="font-medium text-[#1E0D73] mb-2">Upcoming Events</h5>
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-white rounded-md">
                      <div className="w-2 h-2 rounded-full bg-[#FF9800] mr-2"></div>
                      <span className="text-sm">Team Meeting - 10:00 AM</span>
                    </div>
                    <div className="flex items-center p-2 bg-white rounded-md">
                      <div className="w-2 h-2 rounded-full bg-[#1E0D73] mr-2"></div>
                      <span className="text-sm">Yoga Class - 2:30 PM</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-[#B7BDB7]/20 flex justify-between">
                <div className="flex items-center gap-2 text-[#1E0D73]">
                  <div className="w-3 h-3 rounded-full bg-[#FF9800]"></div>
                  <span className="text-sm">Booked</span>
                </div>
                <div className="flex items-center gap-2 text-[#1E0D73]">
                  <div className="w-3 h-3 rounded-full bg-[#1E0D73]/10"></div>
                  <span className="text-sm">Available</span>
                </div>
                <motion.button
                  className="text-[#FF9800] text-sm font-medium flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Book Now
                  <ChevronRight className="h-4 w-4 ml-1" />
                </motion.button>
              </div>
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#FF9800]/20 rounded-full blur-2xl"></div>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#1E0D73]/20 rounded-full blur-2xl"></div>

            <motion.div
              className="absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-[#1E0D73]"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="absolute top-1/4 -right-6 w-8 h-8 rounded-full bg-[#FF9800]"
              animate={{
                y: [0, -30, 0],
                x: [0, 20, 0],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>

        {/* Decorative shapes */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white/50 to-transparent"></div>

        <motion.div
          className="absolute top-1/4 left-10 w-64 h-64 rounded-full bg-[#1E0D73]/5"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-[#FF9800]/5"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block rounded-full bg-[#1E0D73]/10 px-4 py-1 text-sm font-medium text-[#1E0D73] mb-4">
              POWERFUL FEATURES
            </div>
            <h2 className="font-futura text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E0D73] mb-4">
              Everything You Need for <br />
              Seamless Booking
            </h2>
            <p className="text-[#050315] text-lg">
              BookEasy provides all the tools you need to discover, book, and manage reservations at local businesses.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="h-7 w-7 text-white" />,
                title: "Calendar View",
                description:
                  "Browse available slots with our intuitive calendar interface. Filter by date, time, and venue type.",
                color: "#1E0D73",
              },
              {
                icon: <Mail className="h-7 w-7 text-white" />,
                title: "Booking Confirmation",
                description:
                  "Receive instant email confirmations and in-app notifications for all your bookings and updates.",
                color: "#FF9800",
              },
              {
                icon: <QrCode className="h-7 w-7 text-white" />,
                title: "QR Code Check-in",
                description:
                  "Skip the line with our contactless QR code check-in system. Fast, secure, and convenient.",
                color: "#1E0D73",
              },
              {
                icon: <Shield className="h-7 w-7 text-white" />,
                title: "Admin Panel",
                description:
                  "Powerful admin tools for businesses to manage bookings, spaces, and customer interactions.",
                color: "#FF9800",
              },
              {
                icon: <Building className="h-7 w-7 text-white" />,
                title: "Business Verification",
                description:
                  "Trust our verified businesses. We ensure all listings are legitimate and meet our quality standards.",
                color: "#1E0D73",
              },
              {
                icon: <span className="font-futura text-xl font-bold text-white">+</span>,
                title: "More Coming Soon",
                description:
                  "We're constantly adding new features to make booking even easier. Stay tuned for updates!",
                color: "#FF9800",
                special: true,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className={`feature-card rounded-xl p-6 border border-[#B7BDB7]/20 transition-all duration-500 ${
                  feature.special ? "bg-gradient-to-br from-[#1E0D73] to-[#3D2A9C] text-white" : "bg-white"
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  y: -15,
                  scale: 1.03,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  rotate: [0, 1, 0, -1, 0],
                  transition: {
                    rotate: {
                      duration: 0.5,
                      ease: "easeInOut",
                      repeat: 0,
                    },
                  },
                }}
              >
                <motion.div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}
                  style={{ backgroundColor: feature.color }}
                  whileHover={{
                    rotate: 360,
                    scale: 1.1,
                    transition: { duration: 0.5 },
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3
                  className={`font-futura text-xl font-bold mb-3 ${feature.special ? "text-white" : "text-[#1E0D73]"}`}
                >
                  {feature.title}
                </h3>
                <p className={feature.special ? "text-white/80" : "text-[#050315]"}>{feature.description}</p>
                <motion.div
                  className={`mt-6 flex items-center ${feature.special ? "text-white" : "text-[#FF9800]"} font-medium group cursor-pointer`}
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span>Learn more</span>
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-[#F4F1EB] to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/wave-pattern.svg')] opacity-5"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block rounded-full bg-[#FF9800]/10 px-4 py-1 text-sm font-medium text-[#FF9800] mb-4">
              SIMPLE PROCESS
            </div>
            <h2 className="font-futura text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E0D73] mb-4">
              How BookEasy Works
            </h2>
            <p className="text-[#050315] text-lg">
              Booking local spaces has never been easier. Follow these simple steps to get started.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#1E0D73] via-[#FF9800] to-[#1E0D73] -translate-y-1/2 z-0"></div>

            {[
              {
                step: 1,
                title: "Discover Spaces",
                description:
                  "Browse through our curated list of local venues and filter by type, location, and amenities.",
              },
              {
                step: 2,
                title: "Book Your Slot",
                description: "Select your preferred date and time from the available slots and confirm your booking.",
              },
              {
                step: 3,
                title: "Enjoy Your Event",
                description: "Use your QR code for seamless check-in and enjoy your booked space without any hassle.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <motion.div
                  className="bg-white rounded-xl p-8 border border-[#B7BDB7]/20 shadow-xl mb-6 hover:shadow-2xl transition-shadow relative"
                  whileHover={{
                    y: -10,
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300, damping: 10 },
                  }}
                >
                  <motion.div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-[#1E0D73] to-[#3D2A9C] text-white flex items-center justify-center font-futura font-bold text-lg"
                    animate={{
                      boxShadow: [
                        "0px 0px 0px rgba(30, 13, 115, 0.3)",
                        "0px 0px 20px rgba(30, 13, 115, 0.7)",
                        "0px 0px 0px rgba(30, 13, 115, 0.3)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    {step.step}
                  </motion.div>
                  <h3 className="font-futura text-xl font-bold text-[#1E0D73] mt-6 mb-3 text-center">{step.title}</h3>
                  <p className="text-[#050315] text-center">{step.description}</p>
                </motion.div>
                {index < 2 && (
                  <motion.div
                    className="flex justify-center"
                    animate={{ x: [0, 10, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
                  >
                    <ArrowRight className="h-6 w-6 text-[#FF9800]" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Button className="bg-gradient-to-r from-[#1E0D73] to-[#3D2A9C] hover:from-[#3D2A9C] hover:to-[#1E0D73] text-white text-lg px-8 py-6 rounded-xl">
              Start Booking Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* For Businesses Section */}
      <section
        id="for-businesses"
        className="py-20 bg-gradient-to-r from-[#1E0D73] to-[#3D2A9C] text-white relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        {/* Animated circles */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 rounded-full bg-[#FF9800]/10"
          animate={{
            scale: [1, 1.5, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-white/5"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-white mb-2">
                FOR BUSINESSES
              </div>
              <h2 className="font-futura text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Grow Your Business with BookEasy
              </h2>
              <p className="text-white/80 text-lg">
                Join hundreds of local businesses already using BookEasy to increase visibility, streamline bookings,
                and grow their customer base.
              </p>
              <ul className="space-y-4">
                {[
                  "Increase visibility with our growing user base",
                  "Manage all your bookings from a single dashboard",
                  "Reduce no-shows with automated reminders",
                  "Gain valuable insights with detailed analytics",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 * index + 0.5 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#FF9800] flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Button className="bg-[#FF9800] hover:bg-[#FF9800]/90 text-white mt-4 text-lg px-8 py-6 rounded-xl group relative overflow-hidden">
                  <span className="relative z-10">Partner with Us</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#FF9800]/80 to-[#FF9800] z-0"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
                    className="relative z-10 ml-2"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#B7BDB7]/20"
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 6, ease: "easeInOut" }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3 },
                }}
              >
                <div className="bg-gradient-to-r from-[#FF9800] to-[#FF9800]/80 p-4 flex items-center">
                  <h3 className="font-futura text-white text-xl">Business Dashboard</h3>
                  <div className="ml-auto flex space-x-1">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-white/70" />
                    ))}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: "42", label: "Bookings" },
                      { value: "89%", label: "Occupancy" },
                      { value: "$1.2k", label: "Revenue" },
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        className="bg-[#F4F1EB] p-4 rounded-lg text-center"
                        whileHover={{ y: -5, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="text-[#1E0D73] text-2xl font-bold">{stat.value}</div>
                        <div className="text-[#050315] text-sm">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#050315] font-medium">Today's Bookings</span>
                      <span className="text-[#1E0D73] font-bold">8</span>
                    </div>
                    <div className="h-2 bg-[#F4F1EB] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#FF9800]"
                        initial={{ width: 0 }}
                        whileInView={{ width: "65%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[#050315] text-sm">
                      <span>Upcoming</span>
                      <span>Time</span>
                    </div>
                    {[
                      { name: "Team Meeting", time: "10:00 AM" },
                      { name: "Yoga Class", time: "2:30 PM" },
                      { name: "Workshop", time: "4:00 PM" },
                    ].map((booking, index) => (
                      <motion.div
                        key={index}
                        className="flex justify-between items-center p-3 bg-[#F4F1EB] rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.1 * index + 0.8 }}
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-[#050315]">{booking.name}</span>
                        <span className="text-[#1E0D73] font-medium">{booking.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#FF9800]/20 rounded-full blur-xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#FF9800]"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/dots-pattern.svg')] opacity-5"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block rounded-full bg-[#1E0D73]/10 px-4 py-1 text-sm font-medium text-[#1E0D73] mb-4">
              TESTIMONIALS
            </div>
            <h2 className="font-futura text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E0D73] mb-4">
              What Our Users Say
            </h2>
            <p className="text-[#050315] text-lg">
              Join thousands of satisfied users who have simplified their booking experience with BookEasy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                rating: 5,
                text: "BookEasy has transformed how I find and book spaces for my yoga classes. The interface is intuitive and the booking process is seamless.",
                name: "Sarah L.",
                role: "Yoga Instructor",
                initials: "SL",
              },
              {
                rating: 5,
                text: "As a cafe owner, BookEasy has helped me manage my space rentals efficiently. The admin panel is powerful yet easy to use, and the QR code check-in system is a game-changer.",
                name: "Michael J.",
                role: "Cafe Owner",
                initials: "MJ",
              },
              {
                rating: 5,
                text: "Finding a co-working space used to be a hassle until I discovered BookEasy. Now I can book my favorite spots in advance and never worry about availability.",
                name: "Alex T.",
                role: "Freelancer",
                initials: "AT",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-white to-[#F4F1EB]/50 rounded-xl p-6 border border-[#B7BDB7]/20 transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  y: -15,
                  scale: 1.03,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <motion.svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-[#FF9800]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.1 * i + 0.5 }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                  ))}
                </div>
                <p className="text-[#050315] mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1E0D73] to-[#3D2A9C] flex items-center justify-center text-white font-medium text-lg"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {testimonial.initials}
                  </motion.div>
                  <div>
                    <div className="font-medium text-[#050315]">{testimonial.name}</div>
                    <div className="text-sm text-[#050315]/70">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Button className="bg-[#1E0D73] hover:bg-[#1E0D73]/90 text-white text-lg px-8 py-6 rounded-xl">
              Read More Reviews
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1E0D73] to-[#3D2A9C] text-white relative overflow-hidden">
        {/* Animated particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3 + Math.random() * 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-futura text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Simplify Your Booking Experience?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Join thousands of users and businesses who have transformed how they book and manage spaces.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Button className="bg-[#FF9800] hover:bg-[#FF9800]/90 text-white text-lg px-10 py-7 rounded-xl group relative overflow-hidden">
                <span className="relative z-10" href="https://bookeasy-app.vercel.app">Get Started Today</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#FF9800]/80 to-[#FF9800] z-0"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
                  className="relative z-10 ml-2"
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050315] text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <motion.div
                className="flex items-center gap-2 mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Image src="/logo.png" alt="BookEasy Logo" width={45} height={45} className="object-contain" />
                <span className="text-white font-futura text-2xl font-bold">BookEasy</span>
              </motion.div>
              <motion.p
                className="text-white/70 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                The simple way to book local spaces for your events and activities.
              </motion.p>
              <motion.div
                className="flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {[
                  <svg
                    key="facebook"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>,
                  <svg
                    key="twitter"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>,
                  <svg
                    key="instagram"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>,
                ].map((icon, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {icon}
                  </motion.a>
                ))}
              </motion.div>
            </div>

            {[
              {
                title: "Features",
                links: [
                  "Calendar View",
                  "Booking Confirmation",
                  "QR Code Check-in",
                  "Admin Panel",
                  "Business Verification",
                ],
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Blog", "Press", "Contact"],
              },
              {
                title: "Legal",
                links: ["Terms of Service", "Privacy Policy", "Cookie Policy", "GDPR"],
              },
            ].map((column, columnIndex) => (
              <div key={columnIndex}>
                <motion.h3
                  className="font-futura text-lg font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * columnIndex }}
                >
                  {column.title}
                </motion.h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <motion.li
                      key={linkIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.1 * linkIndex + 0.2 * columnIndex }}
                    >
                      <a href="#" className="text-white/70 hover:text-white transition-colors">
                        {link}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <motion.div
            className="border-t border-white/10 mt-12 pt-6 text-center text-white/50 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            &copy; {new Date().getFullYear()} BookEasy. All rights reserved.
          </motion.div>
        </div>
      </footer>
    </div>
  )
}

