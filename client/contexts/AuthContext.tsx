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
        if (result.success) {
            setCurrentUser(result.data)
        } else {
            setCurrentUser(null)
        }
        setLoading(false)
    }

    useEffect(() => {
        void refreshUser()
    }, [])

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
