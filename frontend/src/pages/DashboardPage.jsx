import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'
import { getFacilityImage, getSportIcon } from '../assets/facilityImages'

const timeToMinutes = (value) => {
  if (!value) return null
  const [hours, minutes] = value.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

const minutesToTime = (value) => {
  const safeValue = Math.max(0, Math.min(24 * 60, Number(value) || 0))
  const hours = Math.floor(safeValue / 60)
  const minutes = safeValue % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const formatTimeRange = (start, end) => `${minutesToTime(start)} - ${minutesToTime(end)}`

function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  
  const [facilities, setFacilities] = useState([])
  const [selectedFacility, setSelectedFacility] = useState('')
  const [selectedSport, setSelectedSport] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSport, setFilterSport] = useState('All')
  const [maxPrice, setMaxPrice] = useState(5000)

  // Booking Feedback & Confirmation
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [bookedSlots, setBookedSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successModalData, setSuccessModalData] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchFacilities = async () => {
      try {
        const response = await api.get('/facility')
        const items = response?.data?.data || []
        setFacilities(items)
        
        // Handle pre-selected facility from navigation state if available
        const targetId = location.state?.selectedFacilityId || items[0]?._id
        if (targetId) {
          const match = items.find((item) => item._id === targetId) || items[0]
          if (match) {
            setSelectedFacility(match._id)
            setSelectedSport(match.sports?.[0] || '')
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchFacilities()
  }, [isAuthenticated, navigate, location.state])

  // Get distinct list of sports for filter pills
  const availableSportsList = useMemo(() => {
    const sportsSet = new Set()
    facilities.forEach((f) => f.sports?.forEach((s) => sportsSet.add(s)))
    return ['All', ...Array.from(sportsSet)]
  }, [facilities])

  // Filter facilities based on search, sport, price
  const filteredFacilities = useMemo(() => {
    return facilities.filter((fac) => {
      const matchesSearch =
        fac.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (fac.location && fac.location.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesSport = filterSport === 'All' || fac.sports?.includes(filterSport)
      const matchesPrice = (fac.pricePerHour || 0) <= maxPrice
      return matchesSearch && matchesSport && matchesPrice
    })
  }, [facilities, searchTerm, filterSport, maxPrice])

  const selectedFacilityData = useMemo(
    () => facilities.find((item) => item._id === selectedFacility) || null,
    [facilities, selectedFacility]
  )

  useEffect(() => {
    if (!selectedFacility || !date) return

    const fetchBookedSlots = async () => {
      setLoadingSlots(true)
      try {
        const response = await api.get('/bookings/available-slots', {
          params: { facility: selectedFacility, date },
        })
        setBookedSlots(response?.data?.data || [])
      } catch (error) {
        console.error(error)
        setBookedSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchBookedSlots()
  }, [selectedFacility, date])

  const selectedStartMinutes = timeToMinutes(startTime)
  const selectedEndMinutes = timeToMinutes(endTime)
  const durationHours = useMemo(() => {
    if (selectedStartMinutes == null || selectedEndMinutes == null || selectedStartMinutes >= selectedEndMinutes) {
      return 0
    }
    return (selectedEndMinutes - selectedStartMinutes) / 60
  }, [selectedStartMinutes, selectedEndMinutes])

  const totalPrice = useMemo(() => {
    return Math.round(durationHours * (selectedFacilityData?.pricePerHour || 0))
  }, [durationHours, selectedFacilityData])

  const overlapsExistingSlot = useMemo(() => {
    if (selectedStartMinutes == null || selectedEndMinutes == null || selectedStartMinutes >= selectedEndMinutes) {
      return false
    }

    return bookedSlots.some((slot) => selectedStartMinutes < slot.endTime && selectedEndMinutes > slot.startTime)
  }, [bookedSlots, selectedEndMinutes, selectedStartMinutes])

  const handleBooking = async (event) => {
    event.preventDefault()
    setBookingMessage('')
    setBookingError('')

    if (!selectedFacility || !selectedSport || !date || !startTime || !endTime) {
      setBookingError('Please select all required booking details.')
      return
    }

    if (selectedStartMinutes == null || selectedEndMinutes == null || selectedStartMinutes >= selectedEndMinutes) {
      setBookingError('End time must be later than start time.')
      return
    }

    if (overlapsExistingSlot) {
      setBookingError('Selected slot overlaps with an existing booking. Please pick another time.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        facility: selectedFacility,
        sport: selectedSport,
        bookingDate: date,
        startTime: selectedStartMinutes,
        endTime: selectedEndMinutes,
        amount: totalPrice,
      }

      const response = await api.post('/bookings', payload)
      const newBooking = response?.data?.data
      setSuccessModalData({
        booking: newBooking,
        facilityName: selectedFacilityData?.name,
        sport: selectedSport,
        date: date,
        timeRange: formatTimeRange(selectedStartMinutes, selectedEndMinutes),
        amount: totalPrice,
      })

      // Refresh slot availability
      const updatedSlots = await api.get('/bookings/available-slots', {
        params: { facility: selectedFacility, date },
      })
      setBookedSlots(updatedSlots?.data?.data || [])
    } catch (error) {
      setBookingError(error?.response?.data?.message || 'Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const setDateShortcut = (daysFromToday) => {
    const d = new Date()
    d.setDate(d.getDate() + daysFromToday)
    setDate(d.toISOString().slice(0, 10))
  }

  const quickSlotPresets = [
    { label: 'Morning 07:00 - 08:00', start: '07:00', end: '08:00' },
    { label: 'Morning 08:00 - 09:00', start: '08:00', end: '09:00' },
    { label: 'Afternoon 16:00 - 17:00', start: '16:00', end: '17:00' },
    { label: 'Evening 18:00 - 19:00', start: '18:00', end: '19:00' },
    { label: 'Night 20:00 - 21:00', start: '20:00', end: '21:00' },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="h-48 rounded-3xl bg-slate-200 animate-pulse" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-96 rounded-3xl bg-slate-200 animate-pulse lg:col-span-2" />
            <div className="h-96 rounded-3xl bg-slate-200 animate-pulse" />
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="Reserve Premier Sports Courts"
      subtitle="Discover high-grade turfs and indoor arenas. Pick your slot, check real-time availability, and lock your game in seconds."
    >
      {/* Search & Filter Header Container */}
      <section className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base">🔍</span>
              <input
                type="text"
                placeholder="Search venue by name, sport, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Price Filter */}
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-700 font-bold whitespace-nowrap">Max Price: ₹{maxPrice}/hr</span>
              <input
                type="range"
                min="300"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-28 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Sport Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 flex items-center gap-1">
              <span>🎯</span> Sport:
            </span>
            {availableSportsList.map((sport) => (
              <button
                key={sport}
                onClick={() => setFilterSport(sport)}
                className={`rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                  filterSport === sport
                    ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {sport !== 'All' ? `${getSportIcon(sport)} ` : '✨ '}
                {sport}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid: Facilities List (Left) + Booking Widget (Right) */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Column: Venue Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>🏟️</span> Available Facilities ({filteredFacilities.length})
            </h2>
            <span className="text-xs text-slate-500">Click a court to select or view details</span>
          </div>

          {filteredFacilities.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
              <div className="text-4xl">🔍</div>
              <h3 className="text-lg font-bold text-slate-800">No facilities match your search</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range or clearing the sport filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterSport('All')
                  setMaxPrice(5000)
                }}
                className="mt-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-emerald-700 border border-slate-200 hover:bg-slate-200"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFacilities.map((facility) => {
                const isSelected = selectedFacility === facility._id
                const primarySport = facility.sports?.[0] || 'Sports'
                const venueImg = getFacilityImage(primarySport, facility._id)

                return (
                  <article
                    key={facility._id}
                    className={`group relative overflow-hidden rounded-3xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Venue Image Thumbnail */}
                      <div className="relative h-44 sm:h-auto sm:w-48 shrink-0 overflow-hidden">
                        <img
                          src={venueImg}
                          alt={facility.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent sm:bg-gradient-to-r" />
                        <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-slate-200 shadow-xs">
                          {getSportIcon(primarySport)} {primarySport}
                        </span>
                        <span className="absolute bottom-3 left-3 sm:top-3 sm:bottom-auto sm:right-3 sm:left-auto rounded-full bg-amber-50 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
                          ★ {facility.rating || '4.9'}
                        </span>
                      </div>

                      {/* Content Details */}
                      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                {facility.name}
                              </h3>
                              <p className="text-xs text-blue-700 font-semibold mt-1 flex items-center gap-1">
                                <span>📍</span> {facility.location || 'Central Sports Hub'}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-base font-black text-emerald-600">₹{facility.pricePerHour}</div>
                              <div className="text-[10px] text-slate-500 font-medium">per hour</div>
                            </div>
                          </div>

                          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {facility.description || 'Professional grade court with high-efficiency LED floodlighting, synthetic turf, and player lounge.'}
                          </p>

                          {/* Sports & Amenities tags */}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {facility.sports?.map((s) => (
                              <span key={s} className="rounded-lg bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                {s}
                              </span>
                            ))}
                            <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              ⚡ Instant Lock
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => navigate(`/facility/${facility._id}`)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                          >
                            View Details ↗
                          </button>

                          <button
                            onClick={() => {
                              setSelectedFacility(facility._id)
                              setSelectedSport(facility.sports?.[0] || '')
                            }}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white font-extrabold shadow-md shadow-emerald-600/20'
                                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Select Court'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Right Column: Step-by-Step Booking Console */}
        <section className="space-y-4">
          <div className="sticky top-20 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
            
            {/* Selected Court Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Reservation Console</span>
                <h2 className="text-lg font-black text-slate-900">
                  {selectedFacilityData ? selectedFacilityData.name : 'Select a venue'}
                </h2>
              </div>
              {selectedFacilityData && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-right">
                  <span className="text-xs font-black text-emerald-700">₹{selectedFacilityData.pricePerHour}</span>
                  <span className="text-[10px] text-slate-500 block">/ hour</span>
                </div>
              )}
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              
              {/* Sport Picker (if facility supports multiple) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Sport
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(selectedFacilityData?.sports || ['Football']).map((sport) => (
                    <button
                      type="button"
                      key={sport}
                      onClick={() => setSelectedSport(sport)}
                      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold border transition-all ${
                        selectedSport === sport
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>{getSportIcon(sport)}</span>
                      <span>{sport}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selector + Quick Shortcuts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Booking Date
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setDateShortcut(0)}
                      className="rounded-lg bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateShortcut(1)}
                      className="rounded-lg bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100"
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Quick Slot Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quick Time Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickSlotPresets.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => {
                        setStartTime(preset.start)
                        setEndTime(preset.end)
                      }}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-emerald-600 hover:bg-white"
                    >
                      {preset.start} - {preset.end}
                    </button>
                  ))}
                </div>
              </div>

              {/* Precise Time Range Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    step="1800"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    step="1800"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Overlap & Error Messages */}
              {overlapsExistingSlot && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2 font-medium">
                  <span>⚠️</span> That slot overlaps with a booked reservation. Choose another time window.
                </div>
              )}

              {bookingError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
                  {bookingError}
                </div>
              )}

              {/* Live Price Calculator Breakdown Card */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Duration</span>
                  <span className="font-bold text-slate-800">{durationHours} hours</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Hourly Rate</span>
                  <span className="font-bold text-slate-800">₹{selectedFacilityData?.pricePerHour || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Platform Fee</span>
                  <span className="font-bold text-emerald-700">FREE ₹0</span>
                </div>
                <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Total Payable</span>
                  <span className="text-lg font-black text-emerald-600">
                    ₹{totalPrice}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || overlapsExistingSlot || durationHours <= 0}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 py-3.5 px-4 text-xs font-extrabold text-white uppercase tracking-widest transition-all hover:opacity-95 shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Confirming Slot...' : '⚡ Lock Reservation'}
              </button>
            </form>

            {/* Booked Slots Grid Indicator */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider">Booked Slots Today</span>
                <span className="text-slate-500 font-medium">
                  {loadingSlots ? 'Updating...' : `${bookedSlots.length} slot(s) reserved`}
                </span>
              </div>

              {bookedSlots.length === 0 ? (
                <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  ✓ All time slots are open for this date.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {bookedSlots.map((slot) => (
                    <div
                      key={slot._id}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700"
                    >
                      🚫 {formatTimeRange(slot.startTime, slot.endTime)} ({slot.sport})
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>

      </div>

      {/* Booking Success Confirmation Modal */}
      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 text-center relative overflow-hidden">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl border border-emerald-200 animate-bounce">
              ✓
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">Booking Confirmed!</span>
              <h3 className="text-xl font-black text-slate-900 mt-1">{successModalData.facilityName}</h3>
              <p className="text-xs text-slate-600 mt-1">Your reservation has been locked in the system.</p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-2 text-left text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sport</span>
                <span className="font-bold text-slate-900">{successModalData.sport}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Date</span>
                <span className="font-bold text-slate-900">{successModalData.date}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Time Slot</span>
                <span className="font-bold text-emerald-700">{successModalData.timeRange}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-blue-200">
                <span>Amount Reserved</span>
                <span className="font-black text-slate-900">₹{successModalData.amount}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setSuccessModalData(null)}
                className="rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Book Another Slot
              </button>
              <button
                onClick={() => navigate('/bookings')}
                className="rounded-xl bg-emerald-600 py-2.5 px-3 text-xs font-extrabold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default DashboardPage
