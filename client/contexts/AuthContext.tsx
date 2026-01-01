import type { JSX, ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "../../domains/user/models"
import { getMe } from "../../domains/user/api/user.ts"

interface AuthContextValue {
    currentUser: User | null
    loading: boolean
    setCurrentUser: (user: User | null) => void
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
    readonly children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    async function refreshUser(): Promise<void> {
        setLoading(true)
        const result = await getMe()
        if (result.ok) {
            setCurrentUser(result.value)
        } else {
            // Only clear user on authentication errors, not network/other errors
            // This prevents clearing cached user on temporary failures
            if (result.error.includes("401") || result.error.includes("not logged in")) {
                setCurrentUser(null)
            }
            // Otherwise keep current state (might be from localStorage cache)
        }
        setLoading(false)
    }

    // Restore cached user (optimistic) to reduce flicker on refresh, then validate with getMe
    useEffect(() => {
        try {
            const raw = localStorage.getItem("currentUser")
            if (raw) {
                const parsed = JSON.parse(raw) as User
                setCurrentUser(parsed)
            }
        } catch (_e) {
            // ignore parse errors
        }

        void refreshUser()
    }, [])

    // Persist currentUser to localStorage so login survives page refresh
    useEffect(() => {
        if (currentUser) {
            try {
                localStorage.setItem("currentUser", JSON.stringify(currentUser))
            } catch (_e) {
                // ignore storage errors
            }
        } else {
            localStorage.removeItem("currentUser")
        }
    }, [currentUser])

    return (
        <AuthContext.Provider value={{ currentUser, loading, setCurrentUser, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
