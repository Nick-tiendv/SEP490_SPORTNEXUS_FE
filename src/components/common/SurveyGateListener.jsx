import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../context/authContext.js'
import { ASSESSMENT_EVENT, ONBOARDING_EVENT } from '../../utils/surveyGate.js'

// BE trả 403 khi người chơi chưa làm khảo sát → dẫn sang đúng màn khảo sát.
export default function SurveyGateListener() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { role } = useAuth()

  useEffect(() => {
    if (role !== 'Player') return undefined
    const onOnboarding = () => {
      if (pathname === '/onboarding') return
      toast.info('Bạn cần hoàn thành khảo sát người chơi trước khi tham gia.')
      navigate('/onboarding', { state: { from: pathname } })
    }
    const onAssessment = event => {
      if (pathname === '/assessment') return
      const sportId = event.detail?.sportId
      toast.info('Bạn cần làm khảo sát toàn diện của môn này để có Elo trước khi tham gia.')
      navigate(`/assessment${sportId ? `?sportId=${encodeURIComponent(sportId)}` : ''}`, { state: { from: pathname } })
    }
    window.addEventListener(ONBOARDING_EVENT, onOnboarding)
    window.addEventListener(ASSESSMENT_EVENT, onAssessment)
    return () => {
      window.removeEventListener(ONBOARDING_EVENT, onOnboarding)
      window.removeEventListener(ASSESSMENT_EVENT, onAssessment)
    }
  }, [navigate, pathname, role])

  return null
}
