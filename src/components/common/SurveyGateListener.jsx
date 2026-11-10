import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../context/authContext.js'
import { ASSESSMENT_EVENT, ONBOARDING_EVENT, TEAM_SPORT_EVENT } from '../../utils/surveyGate.js'

// BE trả 403 / errorCode khi người chơi chưa làm khảo sát hoặc đội chưa khai môn → dẫn sang đúng màn.
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
    // Đội cũ chưa khai môn: đội trưởng cập nhật môn của đội ở tab Đội
    const onTeamSport = () => {
      toast.info('Đội chưa khai môn. Đội trưởng hãy cập nhật môn của đội trước khi đăng ký giải.')
      navigate('/tournament?tab=teams', { state: { from: pathname } })
    }
    window.addEventListener(ONBOARDING_EVENT, onOnboarding)
    window.addEventListener(ASSESSMENT_EVENT, onAssessment)
    window.addEventListener(TEAM_SPORT_EVENT, onTeamSport)
    return () => {
      window.removeEventListener(ONBOARDING_EVENT, onOnboarding)
      window.removeEventListener(ASSESSMENT_EVENT, onAssessment)
      window.removeEventListener(TEAM_SPORT_EVENT, onTeamSport)
    }
  }, [navigate, pathname, role])

  return null
}
