import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signInWithGooglePopup } from '../api/firebaseAuth'
import toast from 'react-hot-toast'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

const RegisterPage = () => {
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleGoogleAuth = async () => {
    setGoogleLoading(true)
    try {
      const idToken = await signInWithGooglePopup()
      const user = await loginWithGoogle(idToken)
      toast.success(`Welcome, ${user.first_name || user.username}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Google sign-in failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match')
      return
    }

    const parts = formData.name.trim().split(/\s+/)
    const first_name = parts[0] || ''
    const last_name = parts.slice(1).join(' ')

    setLoading(true)
    try {
      await register({
        first_name,
        last_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirm: formData.password_confirm,
      })
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err) {
      const errors = err.response?.data
      if (errors) {
        Object.values(errors).forEach((msgs) => {
          if (Array.isArray(msgs)) msgs.forEach((m) => toast.error(m))
          else toast.error(msgs)
        })
      } else {
        toast.error('Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-white-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-black rounded-xl flex items-center justify-center">
              <span className="text-white">🍽</span>
            </div>
            <span className="text-2xl font-black text-brand-black">
              Food<span className="text-brand-accent">Court</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-brand-black mt-4">Create account</h1>
          <p className="text-brand-gray mt-1">Join FoodCourt today</p>
        </div>

        <div className="card p-8">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className="w-full border border-gray-300 rounded-xl py-3 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60 mb-4">
            {googleLoading ? 'Connecting Google...' : 'Continue with Google'}
          </button>

          <div className="text-center text-xs text-brand-gray mb-4">or register with email</div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-black mb-1.5">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-black mb-1.5">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-black mb-1.5">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+254 700 000 000" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-black mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 characters"
                  className="input-field pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-black mb-1.5">Confirm Password</label>
              <input type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange} required placeholder="Repeat your password" className="input-field" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><UserPlus size={18} /> Create Account</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-brand-gray mt-6">
            Already have an account? <Link to="/login" className="text-brand-black font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
