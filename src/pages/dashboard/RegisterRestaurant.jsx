import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import { uploadImageToSupabase } from '../../api/supabase'
import toast from 'react-hot-toast'
import { Store, ArrowLeft, Upload, Printer } from 'lucide-react'

const generateManagerPassword = () => `Mgr!${Math.random().toString(36).slice(2, 8)}${Math.floor(10 + Math.random() * 90)}`

const RegisterRestaurant = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [coverPreview, setCoverPreview] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [managerCredentials, setManagerCredentials] = useState(null)

  const [formData, setFormData] = useState({
    manager_first_name: '',
    manager_last_name: '',
    manager_email: '',
    manager_phone: '',
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

  const handleFileChange = (e, field) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      if (field === 'cover_image') {
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
    setLoading(true)
    setManagerCredentials(null)
    try {
      const managerPassword = generateManagerPassword()
      const managerPayload = {
        first_name: formData.manager_first_name,
        last_name: formData.manager_last_name,
        email: formData.manager_email,
        phone: formData.manager_phone || '',
        password: managerPassword,
        password_confirm: managerPassword,
      }

      // Debug: Log the payload
      console.log('Sending manager payload:', managerPayload)

      const managerRes = await api.post('/auth/register-manager/', managerPayload)
      
      // Debug: Log the response
      console.log('Manager response:', managerRes.data)

      // ✅ FIX: Access the user data correctly
      const manager = managerRes.data.user
      const plainPassword = managerRes.data.plain_password || managerPassword
      const loginEmail = managerRes.data.login_email || formData.manager_email

      // Upload images if they exist
      const [coverImageUrl, logoUrl] = await Promise.all([
        coverFile ? uploadImageToSupabase(coverFile, 'restaurants/covers') : Promise.resolve(''),
        logoFile ? uploadImageToSupabase(logoFile, 'restaurants/logos') : Promise.resolve(''),
      ])

      // Create the restaurant
      await api.post('/restaurants/', {
        manager_id: manager.id,
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        cuisine_type: formData.cuisine_type,
        opening_hours: formData.opening_hours,
        cover_image: coverImageUrl,
        logo: logoUrl,
      })

      // ✅ FIX: Set the credentials correctly
      setManagerCredentials({
        email: loginEmail,
        password: plainPassword,
      })
      
      toast.success('Restaurant and manager account created')
      
      // Optional: Scroll to show the credentials
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
    } catch (err) {
      console.error('Error details:', err)
      console.error('Error response:', err.response?.data)
      
      let errorMessage = 'Failed to register restaurant'
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          // Handle validation errors
          const errors = err.response.data
          const messages = Object.entries(errors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ')
          errorMessage = messages || JSON.stringify(errors)
        } else {
          errorMessage = err.response.data.error || err.response.data.message || errorMessage
        }
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

        {managerCredentials && (
          <div className="card p-6 mb-6 border border-green-200 bg-green-50">
            <h2 className="text-lg font-bold text-green-900 mb-2">Manager Login Details</h2>
            <p className="text-sm text-green-800">Give these credentials to the restaurant manager:</p>
            <div className="mt-3 space-y-1 text-sm">
              <p><span className="font-semibold">Email:</span> {managerCredentials.email}</p>
              <p><span className="font-semibold">Password:</span> {managerCredentials.password}</p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-secondary mt-4 text-sm inline-flex items-center gap-2">
              <Printer size={16} /> Print Credentials
            </button>
          </div>
        )}

        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-black rounded-xl flex items-center justify-center">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-brand-black">Register Restaurant</h1>
              <p className="text-sm text-brand-gray">Create manager account and restaurant in one step</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="font-bold text-brand-black mb-3">Restaurant Manager Account</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  name="manager_first_name" 
                  value={formData.manager_first_name} 
                  onChange={handleChange} 
                  required 
                  placeholder="Manager first name" 
                  className="input-field" 
                />
                <input 
                  type="text" 
                  name="manager_last_name" 
                  value={formData.manager_last_name} 
                  onChange={handleChange} 
                  required 
                  placeholder="Manager last name" 
                  className="input-field" 
                />
                <input 
                  type="email" 
                  name="manager_email" 
                  value={formData.manager_email} 
                  onChange={handleChange} 
                  required 
                  placeholder="manager@email.com" 
                  className="input-field" 
                />
                <input 
                  type="tel" 
                  name="manager_phone" 
                  value={formData.manager_phone} 
                  onChange={handleChange} 
                  placeholder="+254 700 000 000" 
                  className="input-field" 
                />
              </div>
            </div>

            <div>
              <h2 className="font-bold text-brand-black mb-3">Restaurant Details</h2>
              <div className="space-y-4">
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1.5">Cover Image</label>
                <div className={`border-2 border-dashed border-gray-200 rounded-xl overflow-hidden ${coverPreview ? 'p-0' : 'p-6'} hover:border-gray-400 transition-colors`}>
                  {coverPreview ? (
                    <div className="relative">
                      <img src={coverPreview} alt="Cover preview" className="w-full h-40 object-cover" />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-semibold">Change Image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'cover_image')} />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer">
                      <Upload size={24} className="text-gray-400" />
                      <span className="text-sm text-brand-gray">Upload cover image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'cover_image')} />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1.5">Restaurant Logo</label>
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

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Store size={18} /> Create Restaurant & Manager</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterRestaurant