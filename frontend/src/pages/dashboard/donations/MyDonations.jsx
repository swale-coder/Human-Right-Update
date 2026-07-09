import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { donationService } from '../../../services/donationService'
import { downloadBlob } from '../../../utils/downloadBlob'

export default function MyDonations() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    donationService
      .getMine()
      .then((data) => setDonations(data.donations))
      .catch(() => toast.error('Could not load donations'))
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = async (id, receiptNumber, type) => {
    setBusyId(id)
    try {
      const blob = type === '80g' ? await donationService.download80G(id) : await donationService.downloadReceipt(id)
      downloadBlob(blob, `${type === '80g' ? '80g-receipt' : 'receipt'}-${receiptNumber}.pdf`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not download receipt')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <div className="page-loader">Loading...</div>

  return (
    <div>
      <h2 className="page-title">My Donations</h2>
      <p className="page-subtitle">Your donation history and receipts</p>

      {donations.length === 0 ? (
        <div className="info-banner">You haven't made any donations yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Receipt #</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Purpose</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id}>
                  <td>{new Date(d.donatedAt || d.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>{d.receiptNumber}</td>
                  <td>Rs. {Number(d.amount).toLocaleString('en-IN')}</td>
                  <td>{d.mode}</td>
                  <td>{d.purpose || 'General'}</td>
                  <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" disabled={busyId === d.id} onClick={() => handleDownload(d.id, d.receiptNumber, 'receipt')}>
                      Receipt
                    </button>
                    {d.panNumber && (
                      <button className="btn btn-outline" disabled={busyId === d.id} onClick={() => handleDownload(d.id, d.receiptNumber, '80g')}>
                        80G
                      </button>
                    )}
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
