'use client'
import { useState } from 'react'

const contactButtonStyle: React.CSSProperties = {
  background: '#C24B1E',
  color: '#F5F0E8',
  fontFamily: 'monospace',
  fontSize: '10px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  borderRadius: '3px',
  border: 'none',
  padding: '14px',
  cursor: 'pointer',
  width: '100%',
}

type OwnerContact = {
  phone: string | null
  whatsapp: string | null
  signal: string | null
  full_name: string | null
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

export default function ContactButton({ gearId, ownerName }: {
  gearId: string
  ownerName: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [contact, setContact] = useState<OwnerContact | null>(null)
  const [fetchError, setFetchError] = useState('')

  const handleClick = async () => {
    if (open) {
      setOpen(false)
      return
    }
    setLoading(true)
    setFetchError('')
    try {
      const res = await fetch(`/api/contact/${gearId}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setFetchError(body.error || 'Could not load contact info.')
        setLoading(false)
        return
      }
      const data: OwnerContact = await res.json()
      setContact(data)
      setOpen(true)
    } catch {
      setFetchError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const displayName = contact?.full_name || ownerName
  const whatsapp = contact?.whatsapp?.trim() || ''
  const signal = contact?.signal?.trim() || ''
  const phone = contact?.phone?.trim() || ''
  const hasWhatsapp = Boolean(whatsapp)
  const hasSignal = Boolean(signal)
  const hasPhoneOnly = Boolean(phone) && !hasWhatsapp && !hasSignal
  const hasAnyContact = hasWhatsapp || hasSignal || hasPhoneOnly

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        style={{
          ...contactButtonStyle,
          background: loading ? '#2E2A26' : '#C24B1E',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Loading…' : '▶ Contact Peer'}
      </button>

      {fetchError && (
        <p style={{ fontFamily: 'monospace', color: '#C24B1E', fontSize: '11px', marginTop: '8px' }}>
          {fetchError}
        </p>
      )}

      {open && contact && (
        <div
          style={{
            marginTop: '16px',
            padding: '20px',
            background: '#1A1714',
            border: '1px solid #2E2A26',
            borderRadius: '4px',
          }}
        >
          <h3 style={{ fontFamily: 'Georgia, serif', color: '#F5F0E8', fontSize: '18px', margin: '0 0 8px', fontWeight: 400 }}>
            Contact {displayName}
          </h3>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#7A7060', fontSize: '13px', margin: '0 0 20px' }}>
            Arrange everything directly — gear, timing, location. PeerShare stays out of it.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {hasWhatsapp && (
              <a
                href={`https://wa.me/${digitsOnly(whatsapp)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  background: '#1D5C45',
                  color: '#C4DAD0',
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  padding: '14px',
                  borderRadius: '3px',
                  textDecoration: 'none',
                }}
              >
                ▶ WhatsApp
              </a>
            )}

            {hasSignal && (
              <a
                href={`https://signal.me/#p/+${digitsOnly(signal)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  background: '#2E2A26',
                  color: '#F5F0E8',
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  padding: '14px',
                  borderRadius: '3px',
                  textDecoration: 'none',
                }}
              >
                ▶ Signal
              </a>
            )}

            {hasPhoneOnly && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <p style={{ fontFamily: 'monospace', color: '#4A453E', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px' }}>
                  Phone
                </p>
                <p style={{ fontFamily: 'monospace', color: '#F5F0E8', fontSize: '16px', margin: 0 }}>
                  {phone}
                </p>
              </div>
            )}

            {!hasAnyContact && (
              <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#7A7060', fontSize: '13px', margin: 0, textAlign: 'center' }}>
                This member hasn&apos;t added contact details yet. Try the Help Board to reach them.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              display: 'block',
              margin: '20px auto 0',
              background: 'none',
              border: 'none',
              fontFamily: 'monospace',
              color: '#4A453E',
              fontSize: '9px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
