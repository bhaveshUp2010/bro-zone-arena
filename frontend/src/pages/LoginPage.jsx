import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import { login } from '../store/authSlice'
import api from '../api/axios'

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    mobileNumber: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/users/login', {
        mobileNumber: form.mobileNumber,
        password: form.password,
      })

      const authData = response?.data?.data || {}
      const user = authData.user || {}
      dispatch(
        login({
          name: user.fullName || user.name || 'Player',
          email: user.email || user.mobileNumber || '',
          password: form.password,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
        })
      )

      navigate('/dashboard')
    } catch (error) {
      setError(error?.response?.data?.message || 'Unable to sign in. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in with your mobile number to lock your court slots."
      footerText="Don't have a player account?"
      footerLink="/signup"
      footerLinkText="Create Free Account"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="Mobile Number"
          name="mobileNumber"
          type="tel"
          value={form.mobileNumber}
          onChange={updateField}
          placeholder="e.g. 9876543210"
          autoComplete="tel"
          required
        />

        <FormField
          label="Account Password"
          name="password"
          type="password"
          value={form.password}
          onChange={updateField}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            ⚠️ {error}
          </div>
        )}

        <button
          className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-white transition-all hover:opacity-95 shadow-md shadow-emerald-600/20 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Authenticating...' : 'Sign In to Arena →'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
