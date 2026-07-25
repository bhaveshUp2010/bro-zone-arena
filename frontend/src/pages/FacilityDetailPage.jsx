import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'
import { getFacilityImage, getSportIcon } from '../assets/facilityImages'

function FacilityDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const [facility, setFacility] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchFacility = async () => {
      try {
        const response = await api.get(`/facility/${id}`)
        setFacility(response?.data?.data || null)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchFacility()
  }, [id, isAuthenticated, navigate])

  const highlights = useMemo(() => {
    const base = [
      '⚡ Instant Online Slot Reservation',
      '💡 High-Grade LED Floodlighting System',
      '🚿 Modern Shower & Changing Rooms',
      '🅿️ Dedicated Player Parking Area',
      '🏆 Pro Tournament Surface Specs',
    ]
    const amenities = facility?.amenities || []
    return amenities.length > 0 ? [...base, ...amenities] : base
  }, [facility])

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="h-72 rounded-3xl bg-slate-200 animate-pulse" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-64 rounded-3xl bg-slate-200 animate-pulse lg:col-span-2" />
            <div className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
          </div>
        </div>
      </Layout>
    )
  }

  if (!facility) {
    return (
      <Layout title="Venue Not Found" subtitle="The requested sports court could not be loaded.">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm">
          <div className="text-4xl">🏟️</div>
          <p className="text-slate-600">This facility might have been updated or removed.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
          >
            ← Return to Facilities Discovery
          </button>
        </div>
      </Layout>
    )
  }

  const primarySport = facility.sports?.[0] || 'Sports'
  const venueImage = getFacilityImage(primarySport, facility._id)

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Back Link Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
          >
            <span>←</span> Back to All Facilities
          </button>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            Verified Partner Arena
          </span>
        </div>

        {/* Hero Section Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
          <div className="relative h-72 sm:h-96 w-full overflow-hidden">
            <img
              src={venueImage}
              alt={facility.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 space-y-4 text-white">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold text-emerald-700 border border-slate-200 shadow-xs">
                {getSportIcon(primarySport)} {primarySport}
              </span>
              <span className="rounded-full bg-amber-400/90 backdrop-blur px-3 py-1 text-xs font-bold text-slate-900 border border-amber-300">
                ★ {facility.rating || '4.9'} Customer Rating
              </span>
              <span className="rounded-full bg-blue-600/90 backdrop-blur px-3 py-1 text-xs font-bold text-white">
                📍 {facility.location || 'Central Sports Hub'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white">{facility.name}</h1>
                <p className="mt-2 text-sm text-slate-200 max-w-2xl leading-relaxed">
                  {facility.description || 'Premium sports arena equipped with professional grade playing surface, spectator seating, and night lighting for competitive & casual matches.'}
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-start sm:items-end">
                <div className="text-3xl font-black text-emerald-400">₹{facility.pricePerHour}</div>
                <div className="text-xs text-slate-300 mb-3">per hour rate</div>
                <button
                  onClick={() => navigate('/dashboard', { state: { selectedFacilityId: facility._id } })}
                  className="rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg hover:opacity-95 uppercase tracking-wider"
                >
                  ⚡ Book Court Slot
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Highlights Grid */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          
          <div className="space-y-6">
            {/* Highlights */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>⭐</span> Court Highlights & Amenities
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-xs font-semibold text-slate-800 flex items-center gap-2"
                  >
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>💬</span> Verified Player Feedback
                </h3>
                <span className="text-xs text-emerald-700 font-bold">4.9 / 5.0 Rating</span>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">Rahul S. (Team Captain)</span>
                    <span className="text-amber-500 font-bold">★★★★★</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    "Excellent lighting and turf condition. We booked a 2-hour slot for our weekend 5-a-side match. Smooth process with zero waiting time."
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">Priya M. (Badminton Player)</span>
                    <span className="text-amber-500 font-bold">★★★★★</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    "The court surface is pristine and clean. Booking via Bro Zone Arena took literally 30 seconds."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Venue Specs Card */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>📋</span> Arena Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Supported Sports</span>
                  <span className="font-bold text-slate-900">{facility.sports?.join(', ') || 'Multi-Sport'}</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Hourly Booking Rate</span>
                  <span className="font-extrabold text-emerald-600">₹{facility.pricePerHour}/hr</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Opening Hours</span>
                  <span className="font-bold text-slate-900">06:00 AM - 11:00 PM</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Cancellation Policy</span>
                  <span className="font-bold text-blue-700">1-Click Free Cancel</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard', { state: { selectedFacilityId: facility._id } })}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 py-3.5 text-xs font-extrabold text-white uppercase tracking-wider shadow-md shadow-emerald-600/20 hover:opacity-95"
              >
                Proceed to Reservation Console →
              </button>
            </div>
          </div>

        </div>

      </div>
    </Layout>
  )
}

export default FacilityDetailPage
