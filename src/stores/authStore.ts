import Cookies from 'js-cookie'
import { create } from 'zustand'
import type { CurrentUser, Organization } from '@/types/org.types'

const SESSION_TOKEN = 'session-token'
const USER_EMAIL = 'user-email'
const ACTIVE_ORG = 'active-org'

interface AuthState {
  auth: {
    email: string | null
    user: CurrentUser | null
    organizations: Organization[]
    /** Which workspace requests act on; sent as X-Org-Id. */
    activeOrgId: number | null
    sessionToken: string
    setEmail: (email: string) => void
    setSession: (token: string, user: CurrentUser, organizations: Organization[]) => void
    setOrganizations: (organizations: Organization[]) => void
    setActiveOrg: (orgId: number) => void
    setUser: (user: CurrentUser) => void
    reset: () => void
  }
}

function readActiveOrg(): number | null {
  const stored = Cookies.get(ACTIVE_ORG)
  const parsed = stored ? Number(stored) : NaN
  return Number.isInteger(parsed) ? parsed : null
}

const COOKIE_OPTIONS = { secure: true, sameSite: 'strict' as const, expires: 30 }

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    email: Cookies.get(USER_EMAIL) ?? null,
    user: null,
    organizations: [],
    activeOrgId: readActiveOrg(),
    sessionToken: Cookies.get(SESSION_TOKEN) ?? '',

    setEmail: (email) =>
      set((state) => {
        Cookies.set(USER_EMAIL, email, COOKIE_OPTIONS)
        return { auth: { ...state.auth, email } }
      }),

    setSession: (token, user, organizations) =>
      set((state) => {
        Cookies.set(SESSION_TOKEN, token, COOKIE_OPTIONS)
        Cookies.set(USER_EMAIL, user.email, COOKIE_OPTIONS)

        // Keep the previously selected workspace if the user is still a
        // member of it; otherwise fall back to the first one.
        const previous = state.auth.activeOrgId
        const stillAMember = organizations.some((org) => org.id === previous)
        const activeOrgId = stillAMember ? previous : organizations[0]?.id ?? null

        if (activeOrgId !== null) Cookies.set(ACTIVE_ORG, String(activeOrgId), COOKIE_OPTIONS)

        return {
          auth: {
            ...state.auth,
            sessionToken: token,
            email: user.email,
            user,
            organizations,
            activeOrgId,
          },
        }
      }),

    setOrganizations: (organizations) =>
      set((state) => {
        const stillAMember = organizations.some((org) => org.id === state.auth.activeOrgId)
        const activeOrgId = stillAMember
          ? state.auth.activeOrgId
          : organizations[0]?.id ?? null

        if (activeOrgId !== null) Cookies.set(ACTIVE_ORG, String(activeOrgId), COOKIE_OPTIONS)

        return { auth: { ...state.auth, organizations, activeOrgId } }
      }),

    setActiveOrg: (orgId) =>
      set((state) => {
        Cookies.set(ACTIVE_ORG, String(orgId), COOKIE_OPTIONS)
        return { auth: { ...state.auth, activeOrgId: orgId } }
      }),

    setUser: (user) => set((state) => ({ auth: { ...state.auth, user } })),

    reset: () =>
      set((state) => {
        Cookies.remove(SESSION_TOKEN)
        Cookies.remove(USER_EMAIL)
        Cookies.remove(ACTIVE_ORG)

        return {
          auth: {
            ...state.auth,
            email: null,
            user: null,
            organizations: [],
            activeOrgId: null,
            sessionToken: '',
          },
        }
      }),
  },
}))

/** Role of the signed-in user in the active workspace. */
export function useActiveRole(): Organization['role'] | null {
  const { organizations, activeOrgId } = useAuthStore((state) => state.auth)
  return organizations.find((org) => org.id === activeOrgId)?.role ?? null
}

/** Members are read-only; changing configuration takes admin or owner. */
export function useCanManage(): boolean {
  const role = useActiveRole()
  return role === 'admin' || role === 'owner'
}

export function getActiveOrgId(): number | null {
  return useAuthStore.getState().auth.activeOrgId
}
