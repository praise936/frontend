import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react'

const AdminRegisterPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    setup_key: '',
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    password_confirm: '',
    role: 'platform_admin',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/admin-setup/', formData)
      toast.success('Platform admin account created. Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Admin setup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Setup</h1>
          <p className="text-gray-500 mt-1 text-sm">Create the first platform admin account</p>
        </div>

        <div className="bg-brand-black-light border border-gray-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Setup Key</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  name="setup_key"
                  value={formData.setup_key}
                  onChange={handleChange}
                  placeholder="Enter setup key..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-black border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1.5">First Name</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1.5">Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-brand-black border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-brand-black border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-brand-black border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-brand-black border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-brand-black border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-brand-accent text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-60">
              {loading ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminRegisterPage
