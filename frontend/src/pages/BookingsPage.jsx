import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'
import { getFacilityImage, getSportIcon } from '../assets/facilityImages'

const minutesToTime = (value) => {
  const safeValue = Math.max(0, Math.min(24 * 60, Number(value) || 0))
  const hours = Math.floor(safeValue / 60)
  const minutes = safeValue % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function BookingsPage() {
  const navigate = useNavigate()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState('ALL') // ALL, ACTIVE, CANCELLED
  const [cancelModalBooking, setCancelModalBooking] = useState(null)
  const [actionMessage, setActionMessage] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings/my-bookings')
        setBookings(response?.data?.data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [isAuthenticated, navigate])

  const filteredBookings = useMemo(() => {
    if (filterTab === 'ACTIVE') {
      return bookings.filter((b) => b.status !== 'Cancelled')
    }
    if (filterTab === 'CANCELLED') {
      return bookings.filter((b) => b.status === 'Cancelled')
    }
    return bookings
  }, [bookings, filterTab])

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = bookings.length
    const active = bookings.filter((b) => b.status !== 'Cancelled').length
    const cancelled = bookings.filter((b) => b.status === 'Cancelled').length
    const totalHours = bookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + Math.max(0, (b.endTime - b.startTime) / 60), 0)

    return { total, active, cancelled, totalHours }
  }, [bookings])

  const handleCancelConfirm = async () => {
    if (!cancelModalBooking) return
    setIsCancelling(true)
    setActionMessage('')

    try {
      const bookingId = cancelModalBooking._id
      const response = await api.post('/bookings/cancel-booking', { bookingId })
      const updatedItem = response?.data?.data

      setBookings((prev) =>
        prev.map((item) => (item._id === bookingId ? { ...item, status: 'Cancelled' } : item))
      )
      setActionMessage('Booking cancelled successfully.')
      setCancelModalBooking(null)
    } catch (error) {
      setActionMessage(error?.response?.data?.message || 'Unable to cancel this booking.')
    } finally {
      setIsCancelling(false)
    }
  }

  if (loading) {
    return (
      <Layout title="My Reservations" subtitle="Fetching your recent booking records...">
        <div className="space-y-4">
          <div className="h-24 rounded-3xl bg-slate-200 animate-pulse" />
          <div className="h-32 rounded-3xl bg-slate-200 animate-pulse" />
          <div className="h-32 rounded-3xl bg-slate-200 animate-pulse" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="My Reservations & Schedule"
      subtitle="View, track, and manage all your active and upcoming sports court reservations."
    >
      {/* Toast Notification Alert */}
      {actionMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between">
          <span>✓ {actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>
      )}

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Bookings</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</div>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Active / Locked</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{metrics.active}</div>
        </div>

        <div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Play Hours</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{metrics.totalHours} hrs</div>
        </div>

        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Cancelled</span>
          <div className="text-2xl font-black text-rose-700 mt-1">{metrics.cancelled}</div>
        </div>
      </div>

      {/* Filter Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 pt-2">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              filterTab === 'ALL'
                ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Reservations ({metrics.total})
          </button>
          <button
            onClick={() => setFilterTab('ACTIVE')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              filterTab === 'ACTIVE'
                ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Active ({metrics.active})
          </button>
          <button
            onClick={() => setFilterTab('CANCELLED')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              filterTab === 'CANCELLED'
                ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Cancelled ({metrics.cancelled})
          </button>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="hidden sm:inline-flex rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
        >
          + Book New Slot
        </button>
      </div>

      {/* Bookings Listing Container */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
          <div className="text-4xl">📅</div>
          <h3 className="text-lg font-bold text-slate-800">No reservations found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any bookings matching this filter tab. Ready to play?
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
          >
            Explore & Book Turfs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isCancelled = booking.status === 'Cancelled'
            const facilityName = booking.facility?.name || 'Sports Facility'
            const sportName = booking.sport || 'Sports'
            const venueImg = getFacilityImage(sportName, booking.facility?._id || booking._id)
            const formattedDate = booking.bookingDate ? booking.bookingDate.slice(0, 10) : 'Upcoming'
            const timeRangeStr = `${minutesToTime(booking.startTime)} - ${minutesToTime(booking.endTime)}`

            return (
              <article
                key={booking._id}
                className={`overflow-hidden rounded-3xl border transition-all ${
                  isCancelled
                    ? 'border-slate-200 bg-slate-50/60 opacity-80'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-stretch">
                  
                  {/* Visual Thumbnail */}
                  <div className="relative h-32 sm:h-auto sm:w-44 shrink-0 overflow-hidden">
                    <img src={venueImg} alt={facilityName} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent sm:bg-gradient-to-r" />
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-slate-200">
                      {getSportIcon(sportName)} {sportName}
                    </span>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{facilityName}</h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isCancelled
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {booking.status || 'Active'}
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-2 sm:flex sm:items-center gap-3 text-xs text-slate-700">
                          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                            <span>📅</span> <span className="font-semibold">{formattedDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 text-blue-700">
                            <span>⏰</span> <span className="font-bold">{timeRangeStr}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Amount / Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <div className="text-right">
                          <div className="text-sm font-black text-slate-900">₹{booking.amount || 0}</div>
                          <div className="text-[10px] text-slate-500 font-medium">Total Rate</div>
                        </div>

                        {!isCancelled && (
                          <button
                            onClick={() => setCancelModalBooking(booking)}
                            className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition-colors"
                          >
                            Cancel Slot
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Cancel Confirmation Dialog Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-2xl border border-rose-200">
              ⚠️
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Cancel Reservation?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to cancel your slot at{' '}
                <span className="font-bold text-slate-900">{cancelModalBooking.facility?.name}</span>?
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 space-y-1 text-left">
              <div>📅 Date: {cancelModalBooking.bookingDate?.slice(0, 10)}</div>
              <div>⏰ Time: {minutesToTime(cancelModalBooking.startTime)} - {minutesToTime(cancelModalBooking.endTime)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                disabled={isCancelling}
                className="rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={isCancelling}
                className="rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Slot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default BookingsPage
