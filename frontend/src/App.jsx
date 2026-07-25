import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import DashboardPage from './pages/DashboardPage'
import FacilityDetailPage from './pages/FacilityDetailPage'
import BookingsPage from './pages/BookingsPage'
import ProtectedRoute from './pages/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/facility/:id" element={<FacilityDetailPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
