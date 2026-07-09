import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { humanRightsLinkService } from '../../../services/humanRightsLinkService'

const CATEGORIES = [
  'NATIONAL_COMMISSION',
  'STATE_COMMISSION',
  'JUDICIARY',
  'LEGAL_SERVICES_AUTHORITY',
  'SPECIALIZED_COMMISSION',
  'GOVERNMENT_PORTAL',
  'INTERNATIONAL_BODY',
]

export default function HumanRightsLinksAdmin() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const load = async () => {
    setLoading(true)
    try {
      const data = await humanRightsLinkService.list({ limit: 100 })
      setLinks(data.links)
    } catch {
      toast.error('Could not load human rights links')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async (formData) => {
    try {
      await humanRightsLinkService.create(formData)
      toast.success('Link added')
      reset()
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add link')
    }
  }

  const toggleActive = async (link) => {
    try {
      await humanRightsLinkService.update(link.id, { isActive: !link.isActive })
      load()
    } catch {
      toast.error('Could not update link')
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete this link?')) return
    try {
      await humanRightsLinkService.remove(id)
      toast.success('Link deleted')
      load()
    } catch {
      toast.error('Could not delete link')
    }
  }

  return (
    <div>
      <h2 className="page-title">Human Rights Links Directory</h2>
      <p className="page-subtitle">Manage the public directory of human rights commissions, courts, and resources</p>

      <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)} style={{ marginBottom: 16 }}>
        {showForm ? 'Close' : '+ Add Link'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit(onCreate)} className="profile-card" style={{ marginBottom: 20, maxWidth: 480 }}>
          <div className="form-group"><label>Title</label><input type="text" {...register('title', { required: true })} /></div>
          <div className="form-group">
            <label>Category</label>
            <select {...register('category', { required: true })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="form-group"><label>URL</label><input type="url" {...register('url', { required: true })} /></div>
          <div className="form-group"><label>Description</label><input type="text" {...register('description')} /></div>
          <button className="btn btn-primary" type="submit">Save Link</button>
        </form>
      )}

      {loading ? (
        <div className="page-loader">Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Title</th><th>Category</th><th>URL</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id}>
                  <td>{l.title}</td>
                  <td>{l.category.replace(/_/g, ' ')}</td>
                  <td><a href={l.url} target="_blank" rel="noopener noreferrer">{l.url}</a></td>
                  <td>
                    <input type="checkbox" checked={l.isActive} onChange={() => toggleActive(l)} />
                  </td>
                  <td>
                    <button className="btn btn-sm" onClick={() => onDelete(l.id)}>Delete</button>
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
