'use client'

import { useState, useRef, useEffect } from 'react'
import { sendGuardianSessionMessage, markGuardianMessagesAsReadAction } from '@/app/actions/guardian-session-messages.actions'
import { useTranslations } from 'next-intl'

export function GuardianSessionChat({ sessionData }: { sessionData: any }) {
  const t = useTranslations('session')
  const [content, setContent] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = sessionData.messages || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    // Mark unread messages as read
    const hasUnread = messages.some((m: any) => !m.fromOwner && !m.readAt)
    if (hasUnread) {
      markGuardianMessagesAsReadAction(sessionData.id)
    }
  }, [messages, sessionData.id])

  async function handleSend() {
    if (!content.trim() && !attachmentUrl) return
    setIsSending(true)
    
    const formData = new FormData()
    formData.append('sessionId', sessionData.id)
    formData.append('content', content)
    if (attachmentUrl) formData.append('attachmentUrl', attachmentUrl)

    const res = await sendGuardianSessionMessage(formData)
    setIsSending(false)
    if (res.success) {
      setContent('')
      setAttachmentUrl('')
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
      alert(t('errorUploadingImage') || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col h-[400px] mt-4 bg-[var(--color-cream-2)] rounded-[18px] p-4">
      <h3 className="text-[14px] font-bold text-[var(--color-ink)] mb-3">
        {t('consultationFollowUp') || 'متابعة الحالة / استشارة'}
      </h3>

      <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-[var(--color-white)] rounded-[12px] shadow-inner mb-3">
        {messages.length === 0 ? (
          <p className="text-[12px] text-center text-[var(--color-ink-soft)] mt-10">
            {t('noMessagesYet') || 'لا توجد رسائل بعد'}
          </p>
        ) : (
          messages.map((msg: any) => (
            <div key={msg.id} className={`flex flex-col max-w-[80%] ${!msg.fromOwner ? 'self-start' : 'self-end items-end ml-auto'}`}>
              <div className={`p-2.5 rounded-[12px] ${!msg.fromOwner ? 'bg-[var(--color-cream-2)] text-[var(--color-ink)]' : 'bg-[var(--color-olive)] text-[var(--color-white)]'}`}>
                {msg.content && <p className="text-[13px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                {msg.attachmentUrl && (
                  <img src={msg.attachmentUrl} alt="Attachment" className="mt-2 rounded-[8px] max-h-40 object-cover" />
                )}
              </div>
              <span className="text-[10px] text-[var(--color-ink-soft)] mt-1">
                {new Date(msg.createdAt).toLocaleString()}
                {msg.fromOwner && msg.readAt && ' • مقروء'}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-2">
        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[var(--color-olive)] font-medium hover:underline">
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            {isUploading ? (t('uploading') || 'جاري الرفع...') : (t('attachImage') || 'إرفاق صورة')}
          </label>
          {attachmentUrl && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachmentUrl} alt="Attached" className="h-10 w-10 object-cover rounded-[8px] border border-[var(--color-line)]" />
              <button 
                onClick={() => setAttachmentUrl('')} 
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <textarea 
            placeholder={t('typeMessage') || 'اكتب رسالتك هنا...'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[44px] max-h-[100px] p-[10px] rounded-[10px] border border-[var(--color-line)] text-[13px] bg-[var(--color-white)] outline-none focus:border-[var(--color-olive)] resize-y"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <button 
            onClick={handleSend} 
            disabled={isSending || (!content.trim() && !attachmentUrl)}
            className="self-end h-[44px] px-[16px] rounded-[10px] bg-[var(--color-olive)] text-[var(--color-white)] font-bold text-[13px] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t('send') || 'إرسال'}
          </button>
        </div>
      </div>
    </div>
  )
}
