import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { superAdminService } from '../../../services/superAdminService'

export default function SuperAdminPanel() {
  const [tab, setTab] = useState('org')
  const [states, setStates] = useState([])
  const [districts, setDistricts] = useState([])
  const [talukas, setTalukas] = useState([])
  const [cities, setCities] = useState([])
  const [selectedState, setSelectedState] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedTaluka, setSelectedTaluka] = useState('')
  const [logs, setLogs] = useState([])
  const [settings, setSettings] = useState({})
  const [users, setUsers] = useState([])

  const loadStates = () => superAdminService.listStates().then((d) => setStates(d.states)).catch(() => {})
  const loadDistricts = (stateId) => superAdminService.listDistricts(stateId).then((d) => setDistricts(d.districts)).catch(() => {})
  const loadTalukas = (districtId) => superAdminService.listTalukas(districtId).then((d) => setTalukas(d.talukas)).catch(() => {})
  const loadCities = (talukaId) => superAdminService.listCities(talukaId).then((d) => setCities(d.cities)).catch(() => {})

  useEffect(() => {
    loadStates()
    superAdminService.listActivityLogs({ limit: 30 }).then((d) => setLogs(d.logs)).catch(() => {})
    superAdminService.getSettings().then((d) => setSettings(d.settings)).catch(() => {})
    superAdminService.listUsers({ limit: 50 }).then((d) => setUsers(d.users)).catch(() => {})
  }, [])

  useEffect(() => { if (selectedState) loadDistricts(selectedState) }, [selectedState])
  useEffect(() => { if (selectedDistrict) loadTalukas(selectedDistrict) }, [selectedDistrict])
  useEffect(() => { if (selectedTaluka) loadCities(selectedTaluka) }, [selectedTaluka])

  const addState = async () => {
    const name = window.prompt('State name:')
    if (!name) return
    await superAdminService.createState({ name })
    loadStates()
    toast.success('State added')
  }
  const addDistrict = async () => {
    if (!selectedState) return toast.error('Select a state first')
    const name = window.prompt('District name:')
    if (!name) return
    await superAdminService.createDistrict({ name, stateId: selectedState })
    loadDistricts(selectedState)
    toast.success('District added')
  }
  const addTaluka = async () => {
    if (!selectedDistrict) return toast.error('Select a district first')
    const name = window.prompt('Taluka name:')
    if (!name) return
    await superAdminService.createTaluka({ name, districtId: selectedDistrict })
    loadTalukas(selectedDistrict)
    toast.success('Taluka added')
  }
  const addCity = async () => {
    if (!selectedTaluka) return toast.error('Select a taluka first')
    const name = window.prompt('City name:')
    if (!name) return
    await superAdminService.createCity({ name, talukaId: selectedTaluka })
    loadCities(selectedTaluka)
    toast.success('City added')
  }

  const handleSettingSave = async (key) => {
    await superAdminService.updateSetting(key, settings[key] || '')
    toast.success('Setting saved')
  }

  const handleRoleChange = async (userId, role) => {
    try {
      await superAdminService.updateUserRole(userId, { role })
      toast.success('Role updated')
      superAdminService.listUsers({ limit: 50 }).then((d) => setUsers(d.users))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update role')
    }
  }

  return (
    <div>
      <h2 className="page-title">Super Admin Panel</h2>
      <p className="page-subtitle">Organization structure, roles, settings & activity logs</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {['org', 'roles', 'settings', 'logs'].map((t) => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>
            {t === 'org' ? 'Organization' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'org' && (
        <div className="card-grid">
          <div className="dashboard-card">
            <h3>States</h3>
            <button className="btn btn-outline" onClick={addState} style={{ marginBottom: 8 }}>+ Add State</button>
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} style={{ width: '100%' }}>
              <option value="">Select state</option>
              {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="dashboard-card">
            <h3>Districts</h3>
            <button className="btn btn-outline" onClick={addDistrict} style={{ marginBottom: 8 }}>+ Add District</button>
            <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} style={{ width: '100%' }}>
              <option value="">Select district</option>
              {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="dashboard-card">
            <h3>Talukas</h3>
            <button className="btn btn-outline" onClick={addTaluka} style={{ marginBottom: 8 }}>+ Add Taluka</button>
            <select value={selectedTaluka} onChange={(e) => setSelectedTaluka(e.target.value)} style={{ width: '100%' }}>
              <option value="">Select taluka</option>
              {talukas.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="dashboard-card">
            <h3>Cities</h3>
            <button className="btn btn-outline" onClick={addCity} style={{ marginBottom: 8 }}>+ Add City</button>
            <ul>{cities.map((c) => <li key={c.id}>{c.name}</li>)}</ul>
          </div>
        </div>
      )}

      {tab === 'roles' && (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>
                    <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                      {['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'TALUKA_ADMIN', 'CITY_ADMIN', 'VOLUNTEER', 'MEMBER'].map((r) => (
                        <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'settings' && (
        <div className="profile-card" style={{ maxWidth: 480 }}>
          {['websiteName', 'contactEmail', 'paymentGatewayMode'].map((key) => (
            <div className="form-group" key={key}>
              <label>{key}</label>
              <input
                type="text"
                value={settings[key] || ''}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              />
              <button className="btn btn-outline" onClick={() => handleSettingSave(key)} style={{ marginTop: 6 }}>Save</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'logs' && (
        <ul className="timeline" style={{ maxWidth: 700 }}>
          {logs.map((l) => (
            <li key={l.id}>
              <strong>{l.action.replace(/_/g, ' ')}</strong> — {l.user?.fullName || 'System'} — {new Date(l.createdAt).toLocaleString('en-IN')}
              {l.details && <div className="timeline-detail">{l.details}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
