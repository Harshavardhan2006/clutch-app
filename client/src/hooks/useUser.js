import { useAuth } from '../context/AuthContext'

export function useUser() {
  const { user } = useAuth()
  return { userId: user?.id || null }
}