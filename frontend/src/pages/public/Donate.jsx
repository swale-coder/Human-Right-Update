import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { donationService, loadRazorpayScript } from '../../services/donationService'

const AMOUNT_PRESETS = [500, 1000, 2500, 5000]

export default function Donate() {
  const [searchParams] = useSearchParams()
  const campaignId = searchParams.get('campaignId')
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { amount: 1000, isRecurring: false, recurringFrequency: 'NONE' },
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const isRecurring = watch('isRecurring')

  const onSubmit = async (formData) => {
    setSubmitting(true)
    try {
      const order = await donationService.createOrder({
        ...formData,
        amount: Number(formData.amount),
        campaignId: campaignId || undefined,
      })

      if (order.isDevMode) {
        // No Razorpay keys configured — confirm directly so the flow is still testable.
        const verified = await donationService.verifyPayment({
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: `dev_payment_${Date.now()}`,
          razorpaySignature: 'dev-mode-skip',
        })
        setSuccess(verified.donation)
        toast.success('Thank you for your donation!')
        return
      }

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Could not load payment gateway. Please try again.')
        return
      }

      const rzp = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: 'Human Rights Protection Council',
        description: formData.purpose || 'Donation',
        prefill: {
          name: formData.donorName,
          email: formData.donorEmail,
          contact: formData.donorPhone,
        },
        theme: { color: '#123E2D' },
        handler: async (response) => {
          try {
            const verified = await donationService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            setSuccess(verified.donation)
            toast.success('Thank you for your donation!')
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed')
          }
        },
      })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate donation')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Thank You!</h1>
          <div className="auth-success">
            Your donation of Rs. {Number(success.amount).toLocaleString('en-IN')} has been received.
            {success.receiptNumber && <div>Receipt No: {success.receiptNumber}</div>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <h1>Support HRPC</h1>
        <p className="auth-subtitle">Your contribution helps us protect human rights</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label>Select Amount (Rs.)</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {AMOUNT_PRESETS.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  className="btn btn-outline"
                  onClick={() => setValue('amount', amt)}
                >
                  Rs. {amt}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              step="1"
              {...register('amount', { required: true, min: 1 })}
            />
            {errors.amount && <span className="form-error">Enter a valid amount</span>}
          </div>

          <div className="form-group">
            <label htmlFor="donorName">Full Name</label>
            <input id="donorName" type="text" {...register('donorName', { required: 'Name is required' })} />
            {errors.donorName && <span className="form-error">{errors.donorName.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="donorEmail">Email</label>
            <input id="donorEmail" type="email" {...register('donorEmail')} />
          </div>

          <div className="form-group">
            <label htmlFor="donorPhone">Phone</label>
            <input id="donorPhone" type="tel" {...register('donorPhone')} />
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose (optional)</label>
            <input id="purpose" type="text" placeholder="e.g. Legal Aid Fund" {...register('purpose')} />
          </div>

          <div className="form-group">
            <label htmlFor="panNumber">PAN Number (for 80G receipt)</label>
            <input id="panNumber" type="text" {...register('panNumber')} />
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input id="isRecurring" type="checkbox" {...register('isRecurring')} style={{ width: 'auto' }} />
            <label htmlFor="isRecurring" style={{ margin: 0 }}>Make this a recurring donation</label>
          </div>

          {isRecurring && (
            <div className="form-group">
              <label htmlFor="recurringFrequency">Frequency</label>
              <select id="recurringFrequency" {...register('recurringFrequency')}>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          )}

          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Processing...' : 'Donate Now'}
          </button>
        </form>
      </div>
    </div>
  )
}
