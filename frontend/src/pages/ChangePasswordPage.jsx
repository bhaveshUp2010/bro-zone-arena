import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import FormField from '../components/FormField'
import { changePassword } from '../store/authSlice'
import api from '../api/axios'

function ChangePasswordPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
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

    if (form.newPassword !== form.confirmPassword) {
      setError('The new password confirmation does not match.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/users/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })

      dispatch(changePassword({ newPassword: form.newPassword }))
      setMessage(response?.data?.message || 'Password changed successfully!')
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update password. Please verify current password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout
      title="Security & Account Password"
      subtitle="Keep your Bro Zone Arena account protected with a strong, secure password."
    >
      <div className="max-w-xl mx-auto">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 text-2xl border border-emerald-200">
              🔒
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Update Password</h2>
              <p className="text-xs text-slate-500">Enter your existing password and choose a new one.</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              label="Current Password"
              name="oldPassword"
              type="password"
              value={form.oldPassword}
              onChange={updateField}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            <FormField
              label="New Password"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={updateField}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />

            <FormField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={updateField}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                ⚠️ {error}
              </div>
            )}

            {message && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                ✓ {message}
              </div>
            )}

            <div className="pt-2">
              <button
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-white transition-all hover:opacity-95 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default ChangePasswordPage
