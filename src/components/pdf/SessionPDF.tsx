import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// You must ensure a font supporting Arabic/local characters is provided
// Font.register({ family: 'Inter', src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf' })

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
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

export const SessionPDF = ({ sessionData, animal, owner, clinic }: any) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{clinic?.name || 'Veterinary Clinic'}</Text>
            <Text style={styles.subtitle}>{clinic?.phone || ''} | {clinic?.address || ''}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Medical Report</Text>
            <Text style={styles.subtitle}>
              Date: {new Date(sessionData.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Animal Name:</Text>
            <Text style={styles.value}>{animal.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Species / Breed:</Text>
            <Text style={styles.value}>{animal.species} / {animal.breed || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Weight:</Text>
            <Text style={styles.value}>{sessionData.weight ? `${sessionData.weight} kg` : '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Owner Name:</Text>
            <Text style={styles.value}>{owner.name}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Chief Complaint:</Text>
            <Text style={styles.value}>{sessionData.chiefComplaint || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Diagnosis:</Text>
            <Text style={styles.value}>{sessionData.diagnosis || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Clinical Notes:</Text>
            <Text style={styles.value}>{sessionData.clinicalNotes || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Treatment Plan:</Text>
            <Text style={styles.value}>{sessionData.treatmentPlan || '—'}</Text>
          </View>
        </View>

        {sessionData.medications && sessionData.medications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prescribed Medications</Text>
            <View style={[styles.medRow, { backgroundColor: '#F9FAFB', padding: 4 }]}>
              <Text style={[styles.medCol, { fontWeight: 'bold' }]}>Medication</Text>
              <Text style={[styles.medCol, { fontWeight: 'bold' }]}>Dosage</Text>
              <Text style={[styles.medCol, { fontWeight: 'bold' }]}>Duration</Text>
            </View>
            {sessionData.medications.map((med: any, i: number) => (
              <View key={i} style={styles.medRow}>
                <Text style={styles.medCol}>{med.name}</Text>
                <Text style={styles.medCol}>{med.dosage}</Text>
                <Text style={styles.medCol}>{med.duration}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.section, { marginTop: 40 }]}>
          <Text style={styles.subtitle}>
            Next Visit Date: {sessionData.nextVisitDate ? new Date(sessionData.nextVisitDate).toLocaleDateString() : '—'}
          </Text>
          <Text style={[styles.subtitle, { marginTop: 20 }]}>Doctor Signature: _______________________</Text>
        </View>
      </Page>
    </Document>
  )
}
