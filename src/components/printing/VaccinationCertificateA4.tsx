import React, { forwardRef } from "react"
import { format } from "date-fns"
import { useTranslations } from "next-intl"

interface Props {
  data: {
    clinic: {
      name: string
      address?: string | null
      phone?: string | null
    }
    animal: {
      name: string
      species: string
      breed?: string | null
      gender: string
      birthDate?: Date | null
    }
    owner: {
      name: string
      phone: string
    }
    vaccinations: Array<{
      id: string
      vaccine: { name: string; isCore: boolean }
      dateAdministered: Date
      nextDueDate?: Date | null
      manufacturer?: string | null
      lotNumber?: string | null
      administeredBy?: string | null
    }>
  }
}

export const VaccinationCertificateA4 = forwardRef<HTMLDivElement, Props>(
  ({ data }, ref) => {
    const tPrint = useTranslations("printing")
    // Note: To avoid adding many new translation keys, we reuse common ones and fallback to English
    const fallbackText = (ar: string, en: string) => {
      // Very basic approach: if the locale in Next.js is available we can check, 
      // but since we are in a component we can just output EN for simplicity unless we add keys
      return en;
    }

    const { clinic, animal, owner, vaccinations } = data

    const calculateAge = (birthDateVal?: Date | null) => {
      if (!birthDateVal) return 'Unknown'
      const birth = new Date(birthDateVal)
      const today = new Date()
      let years = today.getFullYear() - birth.getFullYear()
      let months = today.getMonth() - birth.getMonth()
      if (months < 0) {
        years--
        months += 12
      }
      return `${years} yrs ${months > 0 ? `${months} mos` : ''}`
    }

    return (
      <div ref={ref} id="printable-vaccination-certificate" className="bg-white text-black p-8 text-sm max-w-4xl mx-auto w-[210mm] min-h-[297mm]">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b-2 border-primary/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{clinic.name}</h1>
            {clinic.address && <p className="text-gray-600 mt-1">{clinic.address}</p>}
            {clinic.phone && <p className="text-gray-600">{clinic.phone}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold uppercase text-teal-600 tracking-wider">Vaccination Record</h2>
            <p className="text-gray-500 mt-2">Issued: {format(new Date(), "dd MMM yyyy")}</p>
          </div>
        </div>

        {/* Info Blocks */}
        <div className="grid grid-cols-2 gap-8 mb-10 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div>
            <h3 className="font-bold text-teal-700 uppercase text-xs mb-3 tracking-wider">Patient Details</h3>
            <div className="space-y-1">
              <p><span className="text-gray-500 w-20 inline-block">Name:</span> <span className="font-bold text-lg">{animal.name}</span></p>
              <p><span className="text-gray-500 w-20 inline-block">Species:</span> <span className="capitalize">{animal.species}</span></p>
              <p><span className="text-gray-500 w-20 inline-block">Breed:</span> {animal.breed || "Mixed"}</p>
              <p><span className="text-gray-500 w-20 inline-block">Gender:</span> <span className="capitalize">{animal.gender.toLowerCase()}</span></p>
              <p><span className="text-gray-500 w-20 inline-block">Age:</span> {calculateAge(animal.birthDate)}</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-teal-700 uppercase text-xs mb-3 tracking-wider">Owner Details</h3>
            <div className="space-y-1">
              <p><span className="text-gray-500 w-20 inline-block">Name:</span> <span className="font-bold">{owner.name}</span></p>
              <p><span className="text-gray-500 w-20 inline-block">Phone:</span> {owner.phone}</p>
            </div>
          </div>
        </div>

        {/* Vaccinations Table */}
        <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-800 pb-2 mb-4">Vaccination History</h3>
        
        {vaccinations.length === 0 ? (
          <p className="text-center py-10 text-gray-500 italic">No vaccination records found for this patient.</p>
        ) : (
          <table className="w-full mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 rounded-l">Vaccine</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date Given</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Next Due</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Manufacturer / Lot</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 rounded-r">Administered By</th>
              </tr>
            </thead>
            <tbody>
              {vaccinations.map((v) => (
                <tr key={v.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-gray-800">{v.vaccine.name}</div>
                    {v.vaccine.isCore && <span className="text-[10px] uppercase tracking-wider text-teal-600 font-semibold">Core Vaccine</span>}
                  </td>
                  <td className="py-4 px-4 text-gray-700">{format(new Date(v.dateAdministered), "dd MMM yyyy")}</td>
                  <td className="py-4 px-4 font-medium text-gray-800">
                    {v.nextDueDate ? format(new Date(v.nextDueDate), "dd MMM yyyy") : "Lifetime / NA"}
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {v.manufacturer || v.lotNumber ? (
                      <>
                        {v.manufacturer && <div>{v.manufacturer}</div>}
                        {v.lotNumber && <div className="font-mono text-xs text-gray-500">Lot: {v.lotNumber}</div>}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">{v.administeredBy || "Clinic Staff"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-gray-300 text-center text-gray-500 text-xs">
          <p className="mb-2">This is an official record of vaccinations administered at {clinic.name}.</p>
          <p>{tPrint("thankYou", { defaultMessage: "Thank you for trusting VetCare Clinic!" })}</p>
        </div>
      </div>
    )
  }
)

VaccinationCertificateA4.displayName = "VaccinationCertificateA4"
