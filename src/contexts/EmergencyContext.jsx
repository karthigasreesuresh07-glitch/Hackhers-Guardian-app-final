import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useLocation } from './LocationContext'

const EmergencyContext = createContext(null)

const CONTACTS_KEY = 'guardian_contacts'
const HISTORY_KEY = 'guardian_history'
const EVIDENCE_KEY = 'guardian_evidence'
const VOICE_TRIGGER_KEY = 'guardian_voice_trigger'

export function EmergencyProvider({ children }) {
  const { position, getCurrentPosition, startTracking, stopTracking } = useLocation()
  const [isEmergencyActive, setIsEmergencyActive] = useState(false)
  const [emergencyStartTime, setEmergencyStartTime] = useState(null)
  const [contacts, setContacts] = useState([])
  const [alertedContacts, setAlertedContacts] = useState([])
  const [escalationTier, setEscalationTier] = useState(0)
  const [trackingLink, setTrackingLink] = useState('')
  const [history, setHistory] = useState([])
  const [evidence, setEvidence] = useState([])
  const escalationRef = useRef(null)

  // Voice trigger — default ON, persisted to localStorage
  const [voiceTriggerEnabled, setVoiceTriggerEnabledState] = useState(() => {
    try {
      const stored = localStorage.getItem(VOICE_TRIGGER_KEY)
      return stored !== null ? JSON.parse(stored) : true // default: enabled
    } catch { return true }
  })

  const setVoiceTriggerEnabled = useCallback((val) => {
    setVoiceTriggerEnabledState(val)
    localStorage.setItem(VOICE_TRIGGER_KEY, JSON.stringify(val))
  }, [])

  // ---- Auto Recording State ----
  const [autoRecordingActive, setAutoRecordingActive] = useState(false)
  const [autoRecordingType, setAutoRecordingType] = useState(null) // 'video' | 'audio'
  const [autoRecordingDuration, setAutoRecordingDuration] = useState(0)
  const autoRecorderRef = useRef(null)
  const autoChunksRef = useRef([])
  const autoStreamRef = useRef(null)
  const autoTimerRef = useRef(null)

  // Load data from localStorage
  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem(CONTACTS_KEY) || '[]')
      setContacts(c)
      const h = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
      setHistory(h)
      const e = JSON.parse(localStorage.getItem(EVIDENCE_KEY) || '[]')
      setEvidence(e)
    } catch { /* ignore */ }
  }, [])

  const saveContacts = (c) => {
    setContacts(c)
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(c))
  }

  const saveHistory = (h) => {
    setHistory(h)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h))
  }

  const saveEvidence = (e) => {
    setEvidence(e)
    localStorage.setItem(EVIDENCE_KEY, JSON.stringify(e))
  }

  const addContact = (contact) => {
    const newContact = {
      id: 'contact_' + Date.now(),
      ...contact,
      tier: contacts.length < 2 ? 1 : contacts.length < 4 ? 2 : 3,
      createdAt: new Date().toISOString()
    }
    saveContacts([...contacts, newContact])
    return newContact
  }

  const updateContact = (id, updates) => {
    saveContacts(contacts.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const deleteContact = (id) => {
    saveContacts(contacts.filter(c => c.id !== id))
  }

  const generateTrackingLink = () => {
    const id = Math.random().toString(36).substring(2, 10)
    const link = `${window.location.origin}/track/${id}`
    setTrackingLink(link)
    return link
  }

  // Clean phone number to digits only (handle +91, spaces, dashes, etc.)
  const cleanPhone = (phone) => {
    let cleaned = ('' + phone).replace(/\D/g, '')
    // If Indian number without country code, add 91
    if (cleaned.length === 10) cleaned = '91' + cleaned
    return cleaned
  }

  // Build the emergency message with real GPS, user name, time, fallback
  const buildEmergencyMessage = (pos, link, userName) => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    const nameStr = userName ? ` from ${userName}` : ''

    if (!pos || pos.isFallback) {
      // Fallback: no GPS available
      return (
        `🚨 *EMERGENCY ALERT${nameStr} — GUARDIAN*\n\n` +
        `I am in danger and need immediate help!\n\n` +
        `⚠️ Location unavailable — please call me immediately!\n\n` +
        `📅 ${dateStr}\n` +
        `⏰ ${timeStr}\n\n` +
        `🔴 Status: EMERGENCY ACTIVE\n\n` +
        `${link ? `🔗 Live Tracking: ${link}\n\n` : ''}` +
        `Please call me or send help immediately!\n` +
        `— Sent via GUARDIAN Emergency App`
      )
    }

    const mapsUrl = `https://maps.google.com/?q=${pos.lat},${pos.lng}`
    return (
      `🚨 *EMERGENCY ALERT${nameStr} — GUARDIAN*\n\n` +
      `I am in danger and need immediate help!\n\n` +
      `📍 *My Live Location:*\n${mapsUrl}\n\n` +
      `🗺️ GPS: ${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}\n` +
      `📅 ${dateStr}\n` +
      `⏰ ${timeStr}\n\n` +
      `🔴 Status: EMERGENCY ACTIVE\n\n` +
      `${link ? `🔗 Live Tracking: ${link}\n\n` : ''}` +
      `Please call me or send help immediately!\n` +
      `— Sent via GUARDIAN Emergency App`
    )
  }

  // Send SMS to one or more contacts using native sms: URI
  const sendSMSToContacts = (contactList, message) => {
    try {
      const phones = contactList.map(c => cleanPhone(c.phone)).join(',')
      const smsUri = `sms:${phones}?body=${encodeURIComponent(message)}`
      window.open(smsUri, '_self')
      return true
    } catch (err) {
      console.error('SMS send failed:', err)
      return false
    }
  }

  // Send WhatsApp message to a single contact via wa.me deep link
  const sendWhatsAppToContact = (contact, message) => {
    try {
      const phone = cleanPhone(contact.phone)
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      window.open(waUrl, '_blank')
      return true
    } catch (err) {
      console.error('WhatsApp send failed:', err)
      return false
    }
  }

  // Send alert to a single contact (used during escalation)
  const sendAlertToContact = async (contact, pos, userName) => {
    const message = buildEmergencyMessage(pos, trackingLink, userName)

    // Try SMS
    sendSMSToContacts([contact], message)
    await new Promise(r => setTimeout(r, 800))

    // Also try WhatsApp
    sendWhatsAppToContact(contact, message)
    await new Promise(r => setTimeout(r, 500))

    return { success: true, contact, message, timestamp: Date.now() }
  }

  // ---- Auto Recording Functions ----
  const startAutoRecording = useCallback(async () => {
    try {
      // Try video first (camera + audio)
      let stream
      let type = 'video'
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: 'environment', width: 1280, height: 720 }
        })
      } catch {
        // Camera denied — fall back to audio only
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          type = 'audio'
        } catch (err) {
          console.error('Cannot start recording — no permissions:', err)
          return
        }
      }

      autoStreamRef.current = stream
      autoChunksRef.current = []

      const mimeType = type === 'video'
        ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm')
        : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm')

      const recorder = new MediaRecorder(stream, { mimeType })
      autoRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) autoChunksRef.current.push(e.data)
      }

      recorder.start(1000)
      setAutoRecordingActive(true)
      setAutoRecordingType(type)
      setAutoRecordingDuration(0)

      autoTimerRef.current = setInterval(() => {
        setAutoRecordingDuration(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error('Auto recording failed:', err)
    }
  }, [])

  const stopAutoRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (!autoRecorderRef.current || autoRecorderRef.current.state === 'inactive') {
        setAutoRecordingActive(false)
        resolve(null)
        return
      }

      autoRecorderRef.current.onstop = () => {
        const blob = new Blob(autoChunksRef.current, {
          type: autoRecordingType === 'video' ? 'video/webm' : 'audio/webm'
        })
        const url = URL.createObjectURL(blob)
        const result = { blob, url, type: autoRecordingType, duration: autoRecordingDuration }

        // Auto-save to evidence
        const newEvidence = {
          id: 'evidence_' + Date.now(),
          type: result.type,
          url: result.url,
          duration: result.duration,
          name: `Emergency ${result.type === 'video' ? 'Video' : 'Audio'} (Auto)`,
          createdAt: new Date().toISOString(),
          isAutoRecording: true
        }
        setEvidence(prev => {
          const updated = [newEvidence, ...prev]
          localStorage.setItem(EVIDENCE_KEY, JSON.stringify(updated))
          return updated
        })

        // Stop all tracks
        if (autoStreamRef.current) {
          autoStreamRef.current.getTracks().forEach(t => t.stop())
          autoStreamRef.current = null
        }

        resolve(result)
      }

      autoRecorderRef.current.stop()
      setAutoRecordingActive(false)
      clearInterval(autoTimerRef.current)
    })
  }, [autoRecordingType, autoRecordingDuration])

  // ---- Core SOS Functions ----
  const triggerSOS = useCallback(async (userName) => {
    const pos = await getCurrentPosition()
    const link = generateTrackingLink()

    setIsEmergencyActive(true)
    setEmergencyStartTime(Date.now())
    setEscalationTier(1)

    startTracking()

    // Start auto-recording immediately
    startAutoRecording()

    // Get tier 1 contacts
    const tier1 = contacts.filter(c => c.tier === 1)
    const allContacts = contacts // Send to ALL contacts, not just tier 1
    const message = buildEmergencyMessage(pos, link, userName)

    // --- AUTO DELIVERY --- (no manual send button needed)
    // 1. Bulk SMS: open native SMS app with ALL contacts + emergency message
    if (allContacts.length > 0) {
      sendSMSToContacts(allContacts, message)
      // Small delay so SMS app opens before WhatsApp
      await new Promise(r => setTimeout(r, 1200))
    }

    // 2. WhatsApp: send individual messages to each contact
    for (const contact of allContacts) {
      sendWhatsAppToContact(contact, message)
      await new Promise(r => setTimeout(r, 600))
    }

    // Mark all as alerted
    const alerted = allContacts.map(c => ({ ...c, alertedAt: Date.now(), status: 'sent' }))
    setAlertedContacts(alerted)

    // Start escalation timer (alerts tier 2 after 60s, tier 3 after 120s)
    if (tier1.length > 0) {
      escalationRef.current = setTimeout(() => {
        escalateAlerts(2, pos, userName)
      }, 60000)
    }

    // Save to history
    const entry = {
      id: 'emergency_' + Date.now(),
      startTime: new Date().toISOString(),
      location: pos,
      contactsAlerted: alerted.length,
      trackingLink: link,
      status: 'active',
      autoRecording: true
    }
    saveHistory([entry, ...history])

    return { position: pos, link, contactsAlerted: alerted.length }
  }, [contacts, history, getCurrentPosition, startTracking, startAutoRecording])

  const escalateAlerts = async (tier, pos, userName) => {
    setEscalationTier(tier)
    const tierContacts = contacts.filter(c => c.tier === tier)
    const newAlerted = []
    for (const contact of tierContacts) {
      await sendAlertToContact(contact, pos || position, userName)
      newAlerted.push({ ...contact, alertedAt: Date.now(), status: 'sent' })
    }
    setAlertedContacts(prev => [...prev, ...newAlerted])

    if (tier < 3) {
      escalationRef.current = setTimeout(() => {
        escalateAlerts(tier + 1, pos || position, userName)
      }, 60000)
    }
  }

  const cancelSOS = useCallback(async () => {
    // Stop auto recording + save evidence
    await stopAutoRecording()

    setIsEmergencyActive(false)
    setAlertedContacts([])
    setEscalationTier(0)
    setTrackingLink('')
    stopTracking()

    if (escalationRef.current) {
      clearTimeout(escalationRef.current)
      escalationRef.current = null
    }

    // Update history
    setHistory(prev => {
      const updated = prev.map((h, i) =>
        i === 0 && h.status === 'active'
          ? { ...h, status: 'resolved', endTime: new Date().toISOString(), duration: Date.now() - new Date(h.startTime).getTime() }
          : h
      )
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      return updated
    })

    setEmergencyStartTime(null)
    setAutoRecordingDuration(0)
    setAutoRecordingType(null)
  }, [stopTracking, stopAutoRecording])

  const addEvidence = (item) => {
    const newEvidence = {
      id: 'evidence_' + Date.now(),
      ...item,
      createdAt: new Date().toISOString()
    }
    const updated = [newEvidence, ...evidence]
    saveEvidence(updated)
    return newEvidence
  }

  const deleteEvidence = (id) => {
    saveEvidence(evidence.filter(e => e.id !== id))
  }

  return (
    <EmergencyContext.Provider value={{
      isEmergencyActive,
      emergencyStartTime,
      contacts,
      alertedContacts,
      escalationTier,
      trackingLink,
      history,
      evidence,
      triggerSOS,
      cancelSOS,
      addContact,
      updateContact,
      deleteContact,
      addEvidence,
      deleteEvidence,
      generateTrackingLink,
      voiceTriggerEnabled,
      setVoiceTriggerEnabled,
      // Auto recording state
      autoRecordingActive,
      autoRecordingType,
      autoRecordingDuration,
    }}>
      {children}
    </EmergencyContext.Provider>
  )
}

export const useEmergency = () => {
  const ctx = useContext(EmergencyContext)
  if (!ctx) throw new Error('useEmergency must be used within EmergencyProvider')
  return ctx
}
