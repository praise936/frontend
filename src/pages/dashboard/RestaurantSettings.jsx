import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import { uploadImageToSupabase } from '../../api/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft, Store, Upload } from 'lucide-react'

const RestaurantSettings = () => {
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coverPreview, setCoverPreview] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [logoFile, setLogoFile] = useState(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    cuisine_type: '',
    opening_hours: '',
    is_open: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/restaurants/my-restaurant/')
        const data = res.data
        setRestaurant(data)
        setForm({
          name: data.name || '',
          description: data.description || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          cuisine_type: data.cuisine_type || '',
          opening_hours: data.opening_hours || '',
          is_open: Boolean(data.is_open),
        })
        setCoverPreview(data.cover_image_url || '')
        setLogoPreview(data.logo_url || '')
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load restaurant settings')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleFileChange = (e, kind) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      if (kind === 'cover') {
        setCoverPreview(ev.target.result)
        setCoverFile(file)
      } else {
        setLogoPreview(ev.target.result)
        setLogoFile(file)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!restaurant) return

    setSaving(true)
    try {
      const [coverImageUrl, logoUrl] = await Promise.all([
        coverFile ? uploadImageToSupabase(coverFile, 'restaurants/covers') : Promise.resolve(restaurant.cover_image_url || ''),
        logoFile ? uploadImageToSupabase(logoFile, 'restaurants/logos') : Promise.resolve(restaurant.logo_url || ''),
      ])

      const res = await api.put(`/restaurants/${restaurant.id}/`, {
        ...form,
        cover_image: coverImageUrl,
        logo: logoUrl,
      })

      setRestaurant(res.data)
      setCoverFile(null)
      setLogoFile(null)
      toast.success('Restaurant settings updated')
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to save restaurant settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-white-soft">
        <Navbar />
        <div className="container-main py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded-xl w-1/3" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!restaurant) return null

  return (
    <div className="min-h-screen bg-brand-white-soft">
      <Navbar />
      <div className="container-main py-8 max-w-3xl">
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-brand-gray hover:text-brand-black mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-black rounded-xl flex items-center justify-center">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-brand-black">Restaurant Settings</h1>
              <p className="text-sm text-brand-gray">Update your restaurant profile and images</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1.5">Restaurant Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1.5">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-black mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={3} className="input-field resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1.5">Address</label>
                <input name="address" value={form.address} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1.5">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1.5">Cuisine Type</label>
                <input name="cuisine_type" value={form.cuisine_type} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1.5">Opening Hours</label>
                <input name="opening_hours" value={form.opening_hours} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_open" checked={form.is_open} onChange={handleChange} />
              <span className="text-sm font-medium text-brand-black">Restaurant is open</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1.5">Cover Image</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden hover:border-gray-400 transition-colors">
                  {coverPreview ? (
                    <div className="relative">
                      <img src={coverPreview} alt="Cover preview" className="w-full h-48 object-cover" />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-semibold">Change Cover</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'cover')} />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer p-8">
                      <Upload size={24} className="text-gray-400" />
                      <span className="text-sm text-brand-gray">Upload cover image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'cover')} />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1.5">Logo</label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Store size={24} className="text-gray-300" />
                    </div>
                  )}
                  <label className="btn-secondary text-sm cursor-pointer">
                    Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} />
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Store size={18} /> Save Settings</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RestaurantSettings
