import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import '../index.css'
import { AppQueryProvider } from './providers/QueryProvider'
import { ThemeProvider } from '@/shared/theme/ThemeProvider'
import { AuthProvider, useAuth } from '@/features/auth/AuthContext'
import { ToastProvider } from '@/shared/ui/toast/Toast'
import { LandingPage } from '@/pages/landing/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'
import { App as MainApp } from '../App'

// GuestRoute: If user is already authenticated, they cannot access login/register until logout
const GuestRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }
  return children
}

// ProtectedRoute: If user is not authenticated, redirect to landing page (/)
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return children
}

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page (Redirects to /app if already logged in) */}
      <Route
        path="/"
        element={
          <GuestRoute>
            <LandingPage />
          </GuestRoute>
        }
      />

      {/* Authentication Pages (Accessible ONLY when NOT logged in) */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <GuestRoute>
            <ResetPasswordPage />
          </GuestRoute>
        }
      />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

      {/* Main Application Workspace (Protected) */}
      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

import { I18nProvider } from '@/shared/i18n'

export const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system">
      <I18nProvider>
        <AppQueryProvider>
          <ToastProvider>
            <AuthProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AuthProvider>
          </ToastProvider>
        </AppQueryProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

export default App
