import Cookies from 'js-cookie'
import { create } from 'zustand'

const SESSION_TOKEN = 'session-token'
const USER_EMAIL = 'user-email'

interface AuthState {
  auth: {
    email: string | null
    setEmail: (email: string) => void
    sessionToken: string
    setSessionToken: (sessionToken: string) => void
    resetSessionToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieToken = Cookies.get(SESSION_TOKEN)
  const emailCookie = Cookies.get(USER_EMAIL)

  const initToken = cookieToken || ''
  const initEmail = emailCookie || null

  return {
    auth: {
      email: initEmail,
      setEmail: (email) =>
        set((state) => {
          Cookies.set(USER_EMAIL, email, { secure: true, sameSite: 'strict' })
          return { ...state, auth: { ...state.auth, email } }
        }),
      sessionToken: initToken,
      setSessionToken: (sessionToken) =>
        set((state) => {
          Cookies.set(SESSION_TOKEN, sessionToken, { secure: true, sameSite: 'strict' })
          return { ...state, auth: { ...state.auth, sessionToken } }
        }),
      resetSessionToken: () =>
        set((state) => {
          Cookies.remove(SESSION_TOKEN)
          return { ...state, auth: { ...state.auth, sessionToken: '' } }
        }),
      reset: () =>
        set((state) => {
          Cookies.remove(SESSION_TOKEN)
          Cookies.remove(USER_EMAIL)
          return {
            ...state,
            auth: { ...state.auth, email: null, sessionToken: '' },
          }
        }),
    },
  }
})

// Optional alias
// export const useAuth = () => useAuthStore((state) => state.auth)
