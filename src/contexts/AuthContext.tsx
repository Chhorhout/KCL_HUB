import axios from 'axios'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { API_BASE_URLS } from '../config/api'

const API_BASE_URL = API_BASE_URLS.IDP

interface User {
  id: string
  name: string
  email: string
  roleName: string
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string, roleId: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth')
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth)
        setIsAuthenticated(true)
        setUser(authData.user)
      } catch (error) {
        localStorage.removeItem('auth')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`)
      
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          email: email.trim(),
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      )

      console.log('Login response received:', response.status, response.data)

      if (response.data) {
        const authData = {
          user: response.data,
          timestamp: Date.now(),
        }
        localStorage.setItem('auth', JSON.stringify(authData))
        setIsAuthenticated(true)
        setUser(response.data)
        return { success: true }
      }
      return { success: false, error: 'Invalid response from server' }
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      })
      
      // Extract error message from API response
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || error.response.data?.error || error.response.statusText || 'Login failed'
        return { success: false, error: errorMessage }
      } else if (error.request) {
        // Request made but no response received
        if (error.code === 'ECONNABORTED') {
          return { success: false, error: 'Request timeout. The server is taking too long to respond.' }
        }
        return { 
          success: false, 
          error: `Cannot connect to authentication server at ${API_BASE_URL}. Please ensure the server is running on port 5165.` 
        }
      } else {
        // Error setting up request
        return { success: false, error: error.message || 'An error occurred during login' }
      }
    }
  }

  const register = async (name: string, email: string, password: string, roleId: string): Promise<boolean> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        {
          name: name.trim(),
          email: email.trim(),
          password: password,
          roleId: roleId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data) {
        const authData = {
          user: response.data,
          timestamp: Date.now(),
        }
        localStorage.setItem('auth', JSON.stringify(authData))
        setIsAuthenticated(true)
        setUser(response.data)
        return true
      }
      return false
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('auth')
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

