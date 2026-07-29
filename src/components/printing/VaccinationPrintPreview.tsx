"use client"

import React, { useRef, useEffect } from "react"
import { useReactToPrint } from "react-to-print"
import { VaccinationCertificateA4 } from "./VaccinationCertificateA4"
import { useTranslations, useLocale } from "next-intl"

interface Props {
  data: React.ComponentProps<typeof VaccinationCertificateA4>["data"]
}

export const VaccinationPrintPreview: React.FC<Props> = ({ data }) => {
  const t = useTranslations("printing")
  const locale = useLocale()
  
  const componentRef = useRef<HTMLDivElement>(null)

  // Load the appropriate CSS when component mounts (matches invoice approach)
  useEffect(() => {
    const existingLinks = document.querySelectorAll('link[data-print-style="true"]')
    existingLinks.forEach(link => link.remove())

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.setAttribute("data-print-style", "true")
    link.href = "/styles/invoice-a4.css" // Reusing the A4 print styles for clean PDF export
    document.head.appendChild(link)
    
    return () => {
      link.remove()
    }
  }, [])

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Vaccination_Certificate_${data.animal.name}`,
  })

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center bg-surface-container p-4 rounded-xl shadow-sm border border-outline-variant/30">
        <div>
          <h2 className="text-xl font-bold text-on-surface">{locale === 'ar' ? 'معاينة الطباعة' : 'Print Preview'}</h2>
          <p className="text-sm text-on-surface-variant">{locale === 'ar' ? 'شهادة تطعيم' : 'Vaccination Certificate'}</p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => handlePrint()} 
            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {t("print", { defaultMessage: 'Print' })}
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low p-8 rounded-xl overflow-auto border border-outline-variant/30 shadow-inner flex justify-center items-start min-h-[500px]">
        <VaccinationCertificateA4 ref={componentRef} data={data} />
      </div>
    </div>
  )
}
