import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Amiri',
  src: 'https://fonts.gstatic.com/s/amiri/v30/J7aRnpd8CGxBHqUp.ttf'
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Amiri',
    color: '#1A1A1A',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#F3F4F6',
    padding: 6,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: 120,
    color: '#6B7280',
  },
  value: {
    flex: 1,
    fontWeight: 'bold',
  },
  medRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 6,
  },
  medCol: {
    flex: 1,
  },
})

const pdfDict = {
  en: {
    medicalReport: 'Medical Report',
    date: 'Date:',
    patientInfo: 'Patient Information',
    animalName: 'Animal Name:',
    speciesBreed: 'Species / Breed:',
    weight: 'Weight:',
    ownerName: 'Owner Name:',
    clinicalDetails: 'Clinical Details',
    chiefComplaint: 'Chief Complaint:',
    diagnosis: 'Diagnosis:',
    clinicalNotes: 'Clinical Notes:',
    treatmentPlan: 'Treatment Plan:',
    prescribedMedications: 'Prescribed Medications',
    medication: 'Medication',
    dosage: 'Dosage',
    duration: 'Duration',
    nextVisitDate: 'Next Visit Date:',
    doctorSignature: 'Doctor Signature: _______________________',
    kg: 'kg',
  },
  ar: {
    medicalReport: 'تقرير طبي',
    date: 'التاريخ:',
    patientInfo: 'معلومات المريض',
    animalName: 'اسم الحيوان:',
    speciesBreed: 'النوع / السلالة:',
    weight: 'الوزن:',
    ownerName: 'اسم المرافق:',
    clinicalDetails: 'البيانات السريرية',
    chiefComplaint: 'الشكوى الرئيسية:',
    diagnosis: 'التشخيص:',
    clinicalNotes: 'ملاحظات الكشف:',
    treatmentPlan: 'الخطة العلاجية:',
    prescribedMedications: 'الأدوية الموصوفة',
    medication: 'الدواء',
    dosage: 'الجرعة',
    duration: 'المدة',
    nextVisitDate: 'تاريخ الزيارة القادمة:',
    doctorSignature: 'توقيع الطبيب: _______________________',
    kg: 'كجم',
  }
}

export const SessionPDF = ({ sessionData, animal, owner, clinic, locale = 'en' }: any) => {
  const isRTL = locale === 'ar'
  const t = pdfDict[isRTL ? 'ar' : 'en']
  
  const dirStyle = { flexDirection: isRTL ? 'row-reverse' : 'row' } as any
  const textStyle = { textAlign: isRTL ? 'right' : 'left' } as any

  // Create dynamic page style based on layout direction
  const dynamicPageStyle = {
    ...styles.page,
    direction: isRTL ? 'rtl' : 'ltr',
  } as any

  return (
    <Document>
      <Page size="A4" style={dynamicPageStyle}>
        <View style={[styles.header, dirStyle]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, textStyle]}>{clinic?.name || 'Veterinary Clinic'}</Text>
            <Text style={[styles.subtitle, textStyle]}>{clinic?.phone || ''} | {clinic?.address || ''}</Text>
          </View>
          <View style={{ flex: 1, alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
            <Text style={[{ fontSize: 16, fontWeight: 'bold' }, textStyle]}>{t.medicalReport}</Text>
            <Text style={[styles.subtitle, textStyle]}>
              {t.date} {new Date(sessionData.createdAt).toLocaleDateString(locale)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>{t.patientInfo}</Text>
          <View style={[styles.row, dirStyle]}>
            <Text style={[styles.label, textStyle]}>{t.animalName}</Text>
            <Text style={[styles.value, textStyle]}>{animal.name}</Text>
          </View>
          <View style={[styles.row, dirStyle]}>
            <Text style={[styles.label, textStyle]}>{t.speciesBreed}</Text>
            <Text style={[styles.value, textStyle]}>{animal.species} / {animal.breed || '—'}</Text>
          </View>
          <View style={[styles.row, dirStyle]}>
            <Text style={[styles.label, textStyle]}>{t.weight}</Text>
            <Text style={[styles.value, textStyle]}>{sessionData.weight ? `${sessionData.weight} ${t.kg}` : '—'}</Text>
          </View>
          <View style={[styles.row, dirStyle]}>
            <Text style={[styles.label, textStyle]}>{t.ownerName}</Text>
            <Text style={[styles.value, textStyle]}>{owner.name}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>{t.clinicalDetails}</Text>
          <View style={[styles.row, dirStyle]}>
            <Text style={[styles.label, textStyle]}>{t.chiefComplaint}</Text>
            <Text style={[styles.value, textStyle]}>{sessionData.chiefComplaint || '—'}</Text>
          </View>
          <View style={[styles.row, dirStyle]}>
            <Text style={[styles.label, textStyle]}>{t.diagnosis}</Text>
            <Text style={[styles.value, textStyle]}>{sessionData.diagnosis || '—'}</Text>
          </View>
          <View style={[styles.row, dirStyle]}>
            <Text style={[styles.label, textStyle]}>{t.clinicalNotes}</Text>
            <Text style={[styles.value, textStyle]}>{sessionData.clinicalNotes || '—'}</Text>
          </View>
          <View style={[styles.row, dirStyle]}>
            <Text style={[styles.label, textStyle]}>{t.treatmentPlan}</Text>
            <Text style={[styles.value, textStyle]}>{sessionData.treatmentPlan || '—'}</Text>
          </View>
        </View>

        {sessionData.medications && sessionData.medications.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>{t.prescribedMedications}</Text>
            <View style={[styles.medRow, dirStyle, { backgroundColor: '#F9FAFB', padding: 4 }]}>
              <Text style={[styles.medCol, textStyle, { fontWeight: 'bold' }]}>{t.medication}</Text>
              <Text style={[styles.medCol, textStyle, { fontWeight: 'bold' }]}>{t.dosage}</Text>
              <Text style={[styles.medCol, textStyle, { fontWeight: 'bold' }]}>{t.duration}</Text>
            </View>
            {sessionData.medications.map((med: any, i: number) => (
              <View key={i} style={[styles.medRow, dirStyle]}>
                <Text style={[styles.medCol, textStyle]}>{med.name}</Text>
                <Text style={[styles.medCol, textStyle]}>{med.dosage}</Text>
                <Text style={[styles.medCol, textStyle]}>{med.duration}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.section, { marginTop: 40 }]}>
          <Text style={[styles.subtitle, textStyle]}>
            {t.nextVisitDate} {sessionData.nextVisitDate ? new Date(sessionData.nextVisitDate).toLocaleDateString(locale) : '—'}
          </Text>
          <Text style={[styles.subtitle, textStyle, { marginTop: 20 }]}>{t.doctorSignature}</Text>
        </View>
      </Page>
    </Document>
  )
}
