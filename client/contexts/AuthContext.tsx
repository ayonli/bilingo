import type { JSX, ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "../../domains/user/models"
import { getMe } from "../../domains/user/api/user.ts"

interface AuthContextData {
    loading: boolean
    user: User | null
    setUser: (user: User | null) => void
    refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextData | undefined>(undefined)

interface AuthProviderProps {
    readonly children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    async function refresh(): Promise<void> {
        setLoading(true)
        const result = await getMe()
        if (result.success) {
            setUser(result.data)
        } else {
            setUser(null)
        }
        setLoading(false)
    }

    useEffect(() => {
        refresh().catch(console.error)
    }, [])

    return (
        <AuthContext.Provider
            value={{ user, loading, setUser, refresh }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextData {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
