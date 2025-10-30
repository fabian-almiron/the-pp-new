"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // TODO: Replace with your actual form submission endpoint
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubmitStatus("success")
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: ""
      })
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Form Section - Left Side */}
          <div className="w-full">
            <h2 
              style={{ 
                fontFamily: 'Playfair Display, serif', 
                fontSize: 'clamp(3rem, 8vw, 4.5rem)', 
                color: '#000000',
                lineHeight: '1.1',
                marginBottom: '2rem',
                fontWeight: 'normal'
              }}
            >
              CONTACT US
            </h2>
            
            <p className="text-base text-gray-700 mb-8" style={{ fontFamily: 'sofia-pro, sans-serif' }}>
              I'd love to hear from you! Send a message and I'll get back to you as soon as possible.
            </p>

            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'sofia-pro, sans-serif' }}>
                Hello Piped Peony Academy <strong>Members</strong>! We wanted to remind you that if you have any 
                technique or recipe-related questions, please post them in our Facebook group,{" "}
                <a 
                  href="https://www.facebook.com/groups/thepipedpeonyacademy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-black underline hover:text-gray-700 transition-colors"
                >
                  The Piped Peony Academy
                </a>
                . This not only helps Dara by reducing the number of duplicate questions she receives, but it 
                allows other members to benefit too!
              </p>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    name="firstName"
                    placeholder="first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Input
                  type="email"
                  name="email"
                  placeholder="email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <Textarea
                  name="message"
                  placeholder="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full min-h-[150px]"
                />
              </div>

              {submitStatus === "success" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}

              {submitStatus === "error" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
                  Something went wrong. Please try again later.
                </div>
              )}

              <div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-3"
                >
                  {isSubmitting ? "SENDING..." : "SUBMIT"}
                </Button>
              </div>
            </form>
          </div>

          {/* Image Section - Right Side */}
          <div className="w-full h-full  relative rounded-lg overflow-hidden">
            <Image
              src="/Video-Library-Intermediate-thumbnail.jpg"
              alt="Beautiful yellow buttercream flower piping demonstration"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}

