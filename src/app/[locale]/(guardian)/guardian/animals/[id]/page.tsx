'use client'

import { useGuardianPet, useGuardianPetVaccinations } from '@/hooks/useGuardian'
import { useParams } from 'next/navigation'
import { useRouter } from '@/lib/i18n-navigation'
import { ArrowLeft, Stethoscope, FileText, Calendar, Activity, Syringe } from 'lucide-react'
import Image from 'next/image'

export default function AnimalProfilePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const { data, isLoading, isError } = useGuardianPet(id)
  const { data: vaxData } = useGuardianPetVaccinations(id)
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-guardian-bg p-6 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 bg-stone-200 rounded-full mb-4" />
          <div className="w-32 h-6 bg-stone-200 rounded mb-2" />
          <div className="w-24 h-4 bg-stone-200 rounded" />
        </div>
      </div>
    )
  }

  if (isError || !data?.animal) {
    return (
      <div className="min-h-screen bg-guardian-bg p-6 flex flex-col items-center justify-center">
        <p className="text-guardian-text-muted mb-4">Animal profile not found.</p>
        <button onClick={() => router.back()} className="text-primary font-bold">Go Back</button>
      </div>
    )
  }

  const animal = data.animal

  return (
    <div className="min-h-screen bg-guardian-bg text-guardian-text pb-24">
      {/* Top Navigation */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-guardian-bg/90 backdrop-blur-md z-10">
        <button onClick={() => router.back()} className="text-guardian-text hover:bg-stone-200/50 p-2 rounded-full transition-colors">
          <ArrowLeft size={24} strokeWidth={1.5} />
        </button>
        <h1 className="text-xl font-bold text-guardian-text">Medical File</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 mt-4">
        {/* Profile Header */}
        <div className="bg-guardian-surface rounded-3xl p-6 shadow-[0_4px_20px_rgba(28,25,23,0.03)] border border-stone-100 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-stone-100 border-4 border-primary/10 overflow-hidden mb-4 flex items-center justify-center relative shadow-sm">
            {animal.imageUrl ? (
              <Image src={animal.imageUrl} alt={animal.name} fill className="object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary">{animal.name.charAt(0)}</span>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-1">{animal.name}</h2>
          <p className="text-guardian-text-muted mb-4">{animal.species} • {animal.breed || 'Mixed'}</p>
          
          <div className="grid grid-cols-3 w-full gap-4 pt-4 border-t border-stone-100">
            <div className="flex flex-col">
              <span className="text-xs text-guardian-text-muted mb-1">Age</span>
              <span className="font-bold text-sm">{animal.age || '--'}</span>
            </div>
            <div className="flex flex-col border-x border-stone-100">
              <span className="text-xs text-guardian-text-muted mb-1">Weight</span>
              <span className="font-bold text-sm">{animal.weight ? `${animal.weight} kg` : '--'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-guardian-text-muted mb-1">Gender</span>
              <span className="font-bold text-sm">{animal.gender || '--'}</span>
            </div>
          </div>
        </div>

        {/* Medical History Section */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="text-primary" size={20} />
            Medical History
          </h3>
          
          <div className="space-y-4">
            {animal.sessions && animal.sessions.length > 0 ? (
              animal.sessions.map((session: any) => (
                <div key={session.id} className="bg-guardian-surface rounded-2xl p-5 shadow-[0_4px_20px_rgba(28,25,23,0.03)] border border-stone-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                        <Stethoscope size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{session.type || 'General Checkup'}</p>
                        <p className="text-xs text-guardian-text-muted">
                          {new Date(session.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  {session.notes && (
                    <p className="text-sm text-guardian-text-muted mt-2 pl-10 border-l-2 border-stone-100 py-1 line-clamp-2">
                      "{session.notes}"
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-guardian-surface rounded-2xl p-6 text-center border border-stone-100">
                <FileText className="mx-auto text-stone-300 mb-2" size={28} />
                <p className="text-guardian-text-muted text-sm">No medical records yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="text-primary" size={20} />
            Appointments
          </h3>
          
          <div className="space-y-4">
            {animal.appointments && animal.appointments.length > 0 ? (
              animal.appointments.map((apt: any) => (
                <div key={apt.id} className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-primary mb-1">
                        {new Date(apt.scheduledAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-xs font-semibold text-primary/70">
                        {new Date(apt.scheduledAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="bg-white text-primary text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-guardian-surface rounded-2xl p-6 text-center border border-stone-100">
                <p className="text-guardian-text-muted text-sm">No upcoming appointments.</p>
              </div>
            )}
          </div>
        </div>

        {/* Vaccinations */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Syringe className="text-primary" size={20} />
            Vaccinations
          </h3>
          
          <div className="space-y-4">
            {vaxData?.vaccinations && vaxData.vaccinations.length > 0 ? (
              vaxData.vaccinations.map((vax: any) => {
                const isOverdue = vax.nextDueDate && new Date(vax.nextDueDate) < new Date();
                const isDueSoon = vax.nextDueDate && new Date(vax.nextDueDate) >= new Date() && new Date(vax.nextDueDate) <= new Date(new Date().setDate(new Date().getDate() + 14));
                return (
                  <div key={vax.id} className="bg-guardian-surface rounded-2xl p-5 shadow-[0_4px_20px_rgba(28,25,23,0.03)] border border-stone-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{vax.vaccine.name}</p>
                      <p className="text-xs text-guardian-text-muted">
                        Given: {new Date(vax.dateAdministered).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    {vax.nextDueDate && (
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm ${isOverdue ? 'bg-red-100 text-red-600' : isDueSoon ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                          Due: {new Date(vax.nextDueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="bg-guardian-surface rounded-2xl p-6 text-center border border-stone-100">
                <p className="text-guardian-text-muted text-sm">No vaccination records.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
