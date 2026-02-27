import { createContext, useContext, useEffect, useState } from 'react'
import { getUser, removeToken } from '../services/authService'
import type { User } from '../services/authService'

interface AuthContextType {
    user: User | null
    loading: boolean
    refresh: () => Promise<void>
    logoutUser: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    async function refresh() {
        const token = localStorage.getItem('token')
        if (!token) {
            setUser(null)
            setLoading(false)
            return
        }
        try {
            const u = await getUser()
            setUser(u)
        } catch {
            setUser(null)
            removeToken()
        } finally {
            setLoading(false)
        }
    }

    function logoutUser() {
        removeToken()
        setUser(null)
    }

    useEffect(() => { refresh() }, [])

    return (
        <AuthContext.Provider value={{ user, loading, refresh, logoutUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}