import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { eventService } from '../../../services/eventService'

export default function EventsAdmin() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const load = async () => {
    setLoading(true)
    try {
      const data = await eventService.list({ limit: 50 })
      setEvents(data.events)
    } catch {
      toast.error('Could not load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async (formData) => {
    try {
      await eventService.create(formData)
      toast.success('Event created')
      reset()
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create event')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await eventService.update(id, { status })
      toast.success('Updated')
      load()
    } catch {
      toast.error('Could not update event')
    }
  }

  return (
    <div>
      <h2 className="page-title">Events</h2>
      <p className="page-subtitle">Create and manage events, registrations & attendance</p>

      <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)} style={{ marginBottom: 16 }}>
        {showForm ? 'Close' : '+ Create Event'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit(onCreate)} className="profile-card" style={{ marginBottom: 20, maxWidth: 480 }}>
          <div className="form-group"><label>Title</label><input type="text" {...register('title', { required: true })} /></div>
          <div className="form-group"><label>Description</label><input type="text" {...register('description')} /></div>
          <div className="form-group"><label>Location</label><input type="text" {...register('location')} /></div>
          <div className="form-group"><label>Start Date/Time</label><input type="datetime-local" {...register('startAt', { required: true })} /></div>
          <div className="form-group"><label>End Date/Time</label><input type="datetime-local" {...register('endAt')} /></div>
          <div className="form-group"><label>Capacity</label><input type="number" {...register('capacity')} /></div>
          <button className="btn btn-primary" type="submit">Save Event</button>
        </form>
      )}

      {loading ? (
        <div className="page-loader">Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Title</th><th>Date</th><th>Registrations</th><th>Status</th></tr></thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{e.title}</td>
                  <td>{new Date(e.startAt).toLocaleString('en-IN')}</td>
                  <td>{e._count?.registrations ?? 0}</td>
                  <td>
                    <select value={e.status} onChange={(ev) => handleStatusChange(e.id, ev.target.value)}>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
