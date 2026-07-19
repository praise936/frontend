import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import { uploadImageToSupabase } from '../../api/supabase'
import toast from 'react-hot-toast'
import { Store, ArrowLeft, Upload } from 'lucide-react'

const RegisterRestaurant = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [coverPreview, setCoverPreview] = useState(null)
  const [coverFile, setCoverFile] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    cuisine_type: '',
    opening_hours: '9AM - 10PM',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setCoverPreview(ev.target.result)
      setCoverFile(file)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const coverImageUrl = coverFile ? await uploadImageToSupabase(coverFile, 'restaurants/covers') : ''

      await api.post('/restaurants/', {
        ...formData,
        cover_image: coverImageUrl,
        logo: '',
      })

      toast.success('Restaurant registered! Assign a manager from the Restaurants list.')
      navigate('/admin')
    } catch (err) {
      const errors = err.response?.data
      let errorMessage = 'Failed to register restaurant'
      if (errors && typeof errors === 'object') {
        const messages = Object.entries(errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('; ')
        errorMessage = messages || errorMessage
      } else if (err.message) {
        errorMessage = err.message
      }
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-white-soft">
      <Navbar />
      <div className="container-main py-8 max-w-3xl">
        <button onClick={() => navigate('/admin')}
          className="flex items-center gap-1.5 text-sm text-brand-gray hover:text-brand-black mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Admin
        </button>

        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-black rounded-xl flex items-center justify-center">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-brand-black">Register Restaurant</h1>
              <p className="text-sm text-brand-gray">A manager can be assigned afterwards from the Restaurants list</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Restaurant name"
              className="input-field"
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Restaurant description"
              className="input-field resize-none"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Address"
                className="input-field"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Restaurant phone"
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="restaurant@email.com"
                className="input-field"
              />
              <input
                type="text"
                name="cuisine_type"
                value={formData.cuisine_type}
                onChange={handleChange}
                placeholder="Cuisine type"
                className="input-field"
              />
            </div>
            <input
              type="text"
              name="opening_hours"
              value={formData.opening_hours}
              onChange={handleChange}
              placeholder="Opening hours"
              className="input-field"
            />

            <div>
              <label className="block text-sm font-semibold text-brand-black mb-1.5">Cover Image</label>
              <div className={`border-2 border-dashed border-gray-200 rounded-xl overflow-hidden ${coverPreview ? 'p-0' : 'p-6'} hover:border-gray-400 transition-colors`}>
                {coverPreview ? (
                  <div className="relative">
                    <img src={coverPreview} alt="Cover preview" className="w-full h-40 object-cover" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-semibold">Change Image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <Upload size={24} className="text-gray-400" />
                    <span className="text-sm text-brand-gray">Upload cover image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Store size={18} /> Register Restaurant</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterRestaurant