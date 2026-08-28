'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Textarea } from '@/components/shared/Textarea'
import { sendDoctorSessionMessage, markDoctorMessagesAsReadAction } from '@/app/actions/session-messages.actions'
import { useTranslations } from 'next-intl'
import { bookFollowUpAppointment } from '@/app/actions/appointments.actions'
import { Input } from '@/components/shared/Input'

export function SessionChat({ sessionData, animalId }: { sessionData: any, animalId: string }) {
  const t = useTranslations('session')
  const [content, setContent] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [showBookModal, setShowBookModal] = useState(false)
  const [bookDate, setBookDate] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = sessionData.messages || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    // Mark unread messages as read
    const hasUnread = messages.some((m: any) => m.fromOwner && !m.readAt)
    if (hasUnread) {
      markDoctorMessagesAsReadAction(sessionData.id)
    }
  }, [messages, sessionData.id])

  async function handleSend() {
    if (!content.trim() && !attachmentUrl) return
    setIsSending(true)
    
    const formData = new FormData()
    formData.append('sessionId', sessionData.id)
    formData.append('content', content)
    if (attachmentUrl) formData.append('attachmentUrl', attachmentUrl)

    const res = await sendDoctorSessionMessage(formData)
    setIsSending(false)
    if (res.success) {
      setContent('')
      setAttachmentUrl('')
    } else {
      alert(res.error)
    }
  }

  async function handleBook() {
    if (!bookDate) return
    setIsBooking(true)
    const res = await bookFollowUpAppointment({
      animalId,
      scheduledAt: new Date(bookDate)
    })
    setIsBooking(false)
    if (res.success) {
      setShowBookModal(false)
      alert(t('appointmentBookedSuccessfully'))
    } else {
      alert(res.error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const timestamp = Math.round(new Date().getTime() / 1000)

      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign: { timestamp } }),
      })
      const { signature } = await signRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!)
      formData.append('timestamp', timestamp.toString())
      formData.append('signature', signature)

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await uploadRes.json()
      if (data.secure_url) {
        setAttachmentUrl(data.secure_url)
      } else {
        throw new Error(data.error?.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert(t('errorUploadingImage', { fallback: 'Failed to upload image' }))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <div className="flex justify-between items-center border-b border-outline-variant pb-2 mb-4">
        <h3 className="text-lg font-semibold text-on-surface">
          {t('consultationFollowUp')}
        </h3>
        <Button onClick={() => setShowBookModal(true)} variant="secondary" className="text-xs">
          {t('bookExamination')}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-2">
        {messages.length === 0 ? (
          <p className="text-sm text-center text-on-surface-variant mt-10">
            {t('noMessagesYet')}
          </p>
        ) : (
          messages.map((msg: any) => (
            <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.fromOwner ? 'self-start' : 'self-end items-end ml-auto'}`}>
              <div className={`p-3 rounded-xl ${msg.fromOwner ? 'bg-surface-container text-on-surface' : 'bg-primary text-on-primary'}`}>
                {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                {msg.attachmentUrl && (
                  <img src={msg.attachmentUrl} alt="Attachment" className="mt-2 rounded-lg max-h-48 object-cover" />
                )}
              </div>
              <span className="text-[10px] text-on-surface-variant mt-1">
                {new Date(msg.createdAt).toLocaleString()}
                {!msg.fromOwner && msg.readAt && ' • Read'}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 pt-4 border-t border-outline-variant space-y-2">
        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            {isUploading ? t('uploading', { fallback: 'Uploading...' }) : t('attachImage', { fallback: 'Attach Image' })}
          </label>
          {attachmentUrl && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachmentUrl} alt="Attached" className="h-10 w-10 object-cover rounded" />
              <button onClick={() => setAttachmentUrl('')} className="absolute -top-2 -right-2 bg-error text-on-error rounded-full w-4 h-4 text-xs flex items-center justify-center">×</button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Textarea 
            placeholder={t('typeMessage')} 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[40px] max-h-[120px] text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <Button onClick={handleSend} disabled={isSending || (!content.trim() && !attachmentUrl)} className="self-end">
            {t('send')}
          </Button>
        </div>
      </div>

      {showBookModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold">{t('bookFollowUp')}</h3>
            <div>
              <label className="text-sm block mb-1">{t('dateAndTime')}</label>
              <Input type="datetime-local" value={bookDate} onChange={(e) => setBookDate(e.target.value)} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowBookModal(false)}>{t('cancel')}</Button>
              <Button onClick={handleBook} disabled={!bookDate || isBooking}>{t('book')}</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
