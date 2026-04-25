import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { Geolocation } from '@capacitor/geolocation'

const LocationContext = createContext(null)

export function LocationProvider({ children }) {
  const [position, setPosition] = useState(null)
  const [positionHistory, setPositionHistory] = useState([])
  const [tracking, setTracking] = useState(false)
  const [error, setError] = useState(null)
  const [permissionState, setPermissionState] = useState('prompt')
  const watchRef = useRef(null)

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permissions = await Geolocation.checkPermissions()
        setPermissionState(permissions.location)
      } catch (err) {
        console.error('Permission check failed', err)
      }
    }
    checkPermissions()
  }, [])

  const getCurrentPosition = useCallback(async () => {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      })
      
      const p = {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
        accuracy: coordinates.coords.accuracy,
        speed: coordinates.coords.speed,
        heading: coordinates.coords.heading,
        timestamp: coordinates.timestamp
      }
      
      setPosition(p)
      setError(null)
      return p
    } catch (err) {
      setError(err.message)
      // If native geolocation fails, we still provide a stable fallback 
      // but log it clearly as a fallback for the demo
      console.warn('Geolocation failed, using demo fallback', err)
      const fallback = position || {
        lat: 12.9716, // Bangalore default
        lng: 77.5946,
        accuracy: 100,
        timestamp: Date.now(),
        isFallback: true
      }
      return fallback
    }
  }, [position])

  const startTracking = useCallback(async () => {
    if (watchRef.current) return
    
    setTracking(true)
    setPositionHistory([])

    try {
      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 3000
        },
        (pos, err) => {
          if (err) {
            setError(err.message)
            return
          }
          if (pos) {
            const p = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              speed: pos.coords.speed,
              heading: pos.coords.heading,
              timestamp: pos.timestamp
            }
            setPosition(p)
            setPositionHistory(prev => [...prev, p])
            setError(null)
          }
        }
      )
      watchRef.current = watchId
    } catch (err) {
      setError(err.message)
      setTracking(false)
    }
  }, [])

  const stopTracking = useCallback(async () => {
    setTracking(false)
    if (watchRef.current) {
      try {
        await Geolocation.clearWatch({ id: watchRef.current })
      } catch (err) {
        console.error('Failed to stop tracking', err)
      }
      watchRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (watchRef.current) {
        Geolocation.clearWatch({ id: watchRef.current }).catch(() => {})
      }
    }
  }, [])

  return (
    <LocationContext.Provider value={{
      position,
      positionHistory,
      tracking,
      error,
      permissionState,
      getCurrentPosition,
      startTracking,
      stopTracking
    }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocation must be used within LocationProvider')
  return ctx
}
