import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ fallback = '/dashboard' }) {
  const navigate = useNavigate()

  const handleBack = () => {
    // If there's browser history, go back; otherwise, navigate to fallback
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate(fallback, { replace: true })
    }
  }

  return (
    <button
      className="back-btn"
      onClick={handleBack}
      aria-label="Go back"
      id="back-button"
    >
      <ArrowLeft size={18} strokeWidth={2.5} />
    </button>
  )
}
