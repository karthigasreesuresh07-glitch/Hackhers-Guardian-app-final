import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { AnimatePresence, motion } from 'framer-motion'

import BottomNav from './components/BottomNav'
import VoiceTriggerHandler from './components/VoiceTriggerHandler'
import SplashScreen from './pages/SplashScreen'
import OnboardingScreen from './pages/OnboardingScreen'
import LoginScreen from './pages/LoginScreen'
import RegisterScreen from './pages/RegisterScreen'
import DashboardScreen from './pages/DashboardScreen'
import SOSScreen from './pages/SOSScreen'
import LiveTrackingScreen from './pages/LiveTrackingScreen'
import ContactsScreen from './pages/ContactsScreen'
import EvidenceScreen from './pages/EvidenceScreen'
import HistoryScreen from './pages/HistoryScreen'
import ProfileScreen from './pages/ProfileScreen'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <PageWrapper><SplashScreen /></PageWrapper>
          } />
          <Route path="/onboarding" element={
            <PageWrapper><OnboardingScreen /></PageWrapper>
          } />
          <Route path="/login" element={
            <PageWrapper><LoginScreen /></PageWrapper>
          } />
          <Route path="/register" element={
            <PageWrapper><RegisterScreen /></PageWrapper>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PageWrapper><DashboardScreen /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="/sos" element={
            <ProtectedRoute>
              <PageWrapper><SOSScreen /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="/tracking" element={
            <ProtectedRoute>
              <PageWrapper><LiveTrackingScreen /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="/contacts" element={
            <ProtectedRoute>
              <PageWrapper><ContactsScreen /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="/evidence" element={
            <ProtectedRoute>
              <PageWrapper><EvidenceScreen /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <PageWrapper><HistoryScreen /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <PageWrapper><ProfileScreen /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <VoiceTriggerHandler />
      <BottomNav />
    </div>
  )
}
