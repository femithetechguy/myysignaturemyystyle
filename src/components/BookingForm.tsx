'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const bookingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  service: z.string().min(1, 'Service is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
})

type BookingFormData = z.infer<typeof bookingSchema>

export default function BookingForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  const onSubmit = async (data: BookingFormData) => {
    console.log('Booking data:', data)
    // Handle booking submission
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Book Your Appointment</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Name</label>
        <input
          {...register('name')}
          type="text"
          className="w-full px-4 py-2 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Your name"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-2 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Your email"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Phone</label>
        <input
          {...register('phone')}
          type="tel"
          className="w-full px-4 py-2 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Your phone number"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Service</label>
        <select
          {...register('service')}
          className="w-full px-4 py-2 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Select a service</option>
          <option value="haircut">Hair Cut & Style</option>
          <option value="coloring">Hair Coloring</option>
          <option value="blowdry">Blow Dry</option>
          <option value="braids">Braids</option>
          <option value="manicure">Manicure</option>
          <option value="pedicure">Pedicure</option>
        </select>
        {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Date</label>
        <input
          {...register('date')}
          type="date"
          className="w-full px-4 py-2 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Time</label>
        <input
          {...register('time')}
          type="time"
          className="w-full px-4 py-2 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
      </div>

      <button type="submit" className="btn-accent w-full">
        Confirm Booking
      </button>
    </form>
  )
}
