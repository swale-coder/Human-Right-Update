import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { eventService } from '../../services/eventService'

export default function EventsPublic() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeEvent, setActiveEvent] = useState(null)
  const [registration, setRegistration] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    eventService
      .listPublic()
      .then((data) => setEvents(data.events))
      .catch(() => toast.error('Could not load events'))
      .finally(() => setLoading(false))
  }, [])

  const onSubmit = async (formData) => {
    try {
      const data = await eventService.registerForEvent(activeEvent.id, formData)
      setRegistration(data.registration)
      toast.success('Registered! Save your QR code for attendance.')
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not register')
    }
  }

  if (loading) return <div className="page-loader">Loading events...</div>

  if (registration) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h1>You're Registered!</h1>
          <p>Show this QR code at the event for attendance.</p>
          {registration.qrCodeUrl && <img src={registration.qrCodeUrl} alt="QR Code" style={{ width: 200, margin: '16px auto' }} />}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ color: 'var(--green-deep)' }}>Upcoming Events</h1>

      {events.length === 0 && <p>No upcoming events at the moment.</p>}

      {events.map((e) => (
        <div key={e.id} className="profile-card" style={{ marginBottom: 16 }}>
          <h3>{e.title}</h3>
          <p>{e.description}</p>
          <p><strong>When:</strong> {new Date(e.startAt).toLocaleString('en-IN')}</p>
          {e.location && <p><strong>Where:</strong> {e.location}</p>}
          <button className="btn btn-primary" onClick={() => setActiveEvent(e)}>Register</button>
        </div>
      ))}

      {activeEvent && (
        <div className="profile-card" style={{ marginTop: 24 }}>
          <h3>Register for {activeEvent.title}</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" {...register('attendeeName', { required: true })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" {...register('attendeeEmail')} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" {...register('attendeePhone')} />
            </div>
            <button className="btn btn-primary" type="submit">Confirm Registration</button>
          </form>
        </div>
      )}
    </div>
  )
}
