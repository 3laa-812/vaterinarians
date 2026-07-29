import React from "react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { VaccinationPrintPreview } from "@/components/printing/VaccinationPrintPreview"

interface PageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

export default async function VaccinationPrintPage({ params }: PageProps) {
  const { locale, id } = await params
  
  const session = await auth()
  if (!session) redirect(`/${locale}/login`)
  
  // Fetch animal, owner, clinic, and vaccinations
  const animal = await prisma.animal.findUnique({
    where: {
      id,
      clinicId: session.user.clinicId!,
    },
    include: {
      owner: true,
      clinic: true,
      vaccinations: {
        include: {
          vaccine: true
        },
        orderBy: {
          dateAdministered: 'desc'
        }
      }
    }
  })
  
  if (!animal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-error">Patient not found</h2>
        <p className="text-on-surface-variant mt-2">The requested patient could not be found or you do not have permission to view it.</p>
      </div>
    )
  }

  // Format data for the component
  const data = {
    clinic: {
      name: animal.clinic.name,
      address: animal.clinic.address,
      phone: animal.clinic.phone
    },
    animal: {
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      gender: animal.gender,
      birthDate: animal.birthDate
    },
    owner: {
      name: animal.owner.name,
      phone: animal.owner.phone
    },
    vaccinations: animal.vaccinations
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-surface">
      <VaccinationPrintPreview data={data as any} />
    </div>
  )
}
