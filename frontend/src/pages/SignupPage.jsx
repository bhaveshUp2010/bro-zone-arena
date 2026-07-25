import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import { signup } from '../store/authSlice'
import api from '../api/axios'

function SignupPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileno: '',
  })

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/users/register', {
        name: form.name,
        email: form.email,
        mobileno: form.mobileno,
        password: form.password,
      })

      dispatch(
        signup({
          name: form.name,
          email: form.email,
          password: form.password,
        })
      )

      setMessage(response?.data?.message || 'Account created successfully. Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 1000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please check your information.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create Player Account"
      subtitle="Join the arena network to book turfs, view availability, and manage matches."
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign In"
    >
      <form className="space-y-3.5" onSubmit={handleSubmit}>
        <FormField
          label="Full Name"
          name="name"
          value={form.name}
          onChange={updateField}
          placeholder="e.g. Alex Morgan"
          autoComplete="name"
          required
        />

        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={updateField}
          placeholder="alex@example.com"
          autoComplete="email"
          required
        />

        <FormField
          label="Mobile Phone Number"
          name="mobileno"
          type="tel"
          value={form.mobileno}
          onChange={updateField}
          placeholder="9876543210"
          autoComplete="tel"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />

          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={updateField}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700">
            ✓ {message}
          </div>
        )}

        <button
          className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-white transition-all hover:opacity-95 shadow-md shadow-emerald-600/20 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Player Account →'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default SignupPage
