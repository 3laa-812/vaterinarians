'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/lib/i18n-navigation'
import { useGuardianPets } from '@/hooks/useGuardian'
import { ChevronLeft, Calendar, Clock, AlertCircle } from 'lucide-react'

export default function BookAppointmentPage() {
  const t = useTranslations('guardian')
  const router = useRouter()
  const { data: petsData, isLoading: petsLoading } = useGuardianPets()

  const animals = petsData?.animals || []

  const [selectedAnimalId, setSelectedAnimalId] = useState('')
  const [selectedService, setSelectedService] = useState('Consultation')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const services = [
    'Consultation',
    'Vaccination',
    'Grooming',
    'Follow-up',
    'Emergency'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAnimalId || !date || !time) {
      setError('Please fill in all required fields.')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      
      const scheduledAt = new Date(`${date}T${time}:00`)
      
      const res = await fetch('/api/guardian/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animalId: selectedAnimalId,
          scheduledAt: scheduledAt.toISOString(),
          notes: `[${selectedService}] ${notes}`,
        }),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData?.error?.en || 'Failed to book appointment')
      }
      
      router.push('/guardian?booked=true')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-guardian-bg text-guardian-text">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-4 sticky top-0 bg-guardian-bg/80 backdrop-blur-md z-10">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-guardian-text-muted hover:text-guardian-text transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Book Appointment</h1>
      </div>

      <div className="px-6 pb-24">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Animal */}
          <div className="space-y-3">
            <label className="block font-bold">Which pet?</label>
            {petsLoading ? (
              <div className="h-16 bg-guardian-surface rounded-xl animate-pulse" />
            ) : animals.length === 0 ? (
              <p className="text-sm text-stone-500">You need to add a pet first to book an appointment.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {animals.map((animal: any) => (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => setSelectedAnimalId(animal.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedAnimalId === animal.id 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-white border-stone-200 text-stone-700 hover:border-primary/50'
                    }`}
                  >
                    <div className="font-bold">{animal.name}</div>
                    <div className="text-xs opacity-70">{animal.species}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Select Service */}
          <div className="space-y-3">
            <label className="block font-bold">Service Type</label>
            <div className="flex flex-wrap gap-2">
              {services.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => setSelectedService(service)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    selectedService === service 
                      ? 'bg-primary border-primary text-white' 
                      : 'bg-white border-stone-200 text-stone-700 hover:border-primary/50'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block font-bold">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="block font-bold">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="block font-bold">Additional Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., vomiting since yesterday..."
              className="w-full p-4 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedAnimalId || !date || !time}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-[0_4px_20px_rgba(40,167,69,0.3)] disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
          >
            {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  )
}
