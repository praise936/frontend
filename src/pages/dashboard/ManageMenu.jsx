import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import MenuItemCard from '../../components/MenuItemCard'
import api from '../../api/axios'
import { uploadImageToSupabase } from '../../api/supabase'
import toast from 'react-hot-toast'
import { Plus, ArrowLeft, Upload, X } from 'lucide-react'

const ManageMenu = () => {
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    availability: 'available',
    prep_time_minutes: 20,
    is_featured: false,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const restRes = await api.get('/restaurants/my-restaurant/')
      setRestaurant(restRes.data)
      const [menuRes, catRes] = await Promise.all([
        api.get(`/menu/${restRes.data.id}/`),
        api.get(`/menu/${restRes.data.id}/categories/`),
      ])
      setMenuItems(menuRes.data)
      setCategories(catRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)

    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!restaurant) return
    setSubmitting(true)
    try {
      const imageUrl = imageFile ? await uploadImageToSupabase(imageFile, 'menu/items') : ''

      await api.post(`/menu/${restaurant.id}/`, {
        ...form,
        image: imageUrl,
      })

      toast.success('Menu item added!')
      setShowForm(false)
      setForm({
        name: '',
        description: '',
        price: '',
        category: '',
        availability: 'available',
        prep_time_minutes: 20,
        is_featured: false,
      })
      setImagePreview(null)
      setImageFile(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to add item')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAvailabilityToggle = async (itemId, availability) => {
    try {
      await api.patch(`/menu/${restaurant.id}/items/${itemId}/availability/`, { availability })
      setMenuItems((prev) => prev.map((item) => item.id === itemId ? { ...item, availability } : item))
      toast.success('Availability updated')
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this menu item?')) return
    try {
      await api.delete(`/menu/${restaurant?.id}/items/${itemId}/`)
      setMenuItems((prev) => prev.filter((item) => item.id !== itemId))
      toast.success('Item deleted')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="min-h-screen bg-brand-white-soft">
      <Navbar />
      <div className="container-main py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-sm text-brand-gray hover:text-brand-black transition-colors">
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-2xl font-black text-brand-black">Manage Menu</h1>
            <span className="badge-gray">{menuItems.length} items</span>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Cancel' : 'Add Item'}
          </button>
        </div>

        {showForm && (
          <div className="card p-6 mb-6">
            <h2 className="font-bold text-brand-black mb-4">New Menu Item</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-black mb-1.5">Item Name *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    required placeholder="e.g. Chicken Tikka" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-black mb-1.5">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange}
                    rows={3} placeholder="Describe this dish..." className="input-field resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-brand-black mb-1.5">Price (KSh) *</label>
                    <input type="number" name="price" value={form.price} onChange={handleChange}
                      required min="0" step="0.01" placeholder="0.00" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-black mb-1.5">Prep Time (min)</label>
                    <input type="number" name="prep_time_minutes" value={form.prep_time_minutes}
                      onChange={handleChange} min="1" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-black mb-1.5">Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className="input-field">
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-black mb-1.5">Availability</label>
                  <select name="availability" value={form.availability} onChange={handleChange} className="input-field">
                    <option value="available">Available Now</option>
                    <option value="later">Available Later</option>
                    <option value="unavailable">Not Available</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_featured" checked={form.is_featured}
                    onChange={handleChange} className="rounded" />
                  <span className="text-sm font-medium text-brand-black">Featured Item</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-black mb-1.5">Food Image</label>
                <div className={`border-2 border-dashed border-gray-200 rounded-xl overflow-hidden ${imagePreview ? 'h-64' : 'h-64 flex items-center justify-center'} hover:border-gray-400 transition-colors`}>
                  {imagePreview ? (
                    <div className="relative h-full">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-semibold">Change Image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-3 cursor-pointer p-8">
                      <Upload size={32} className="text-gray-300" />
                      <span className="text-sm text-brand-gray text-center">Click to upload food photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>

                <button type="submit" disabled={submitting}
                  className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-3">
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Plus size={18} /> Add to Menu</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl">🍽️</span>
            <p className="font-bold text-brand-black text-xl mt-3">No menu items yet</p>
            <p className="text-brand-gray mt-1">Click "Add Item" to start building your menu</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {menuItems.map((item) => (
              <div key={item.id} className="relative">
                <MenuItemCard
                  item={item}
                  isManagerView={true}
                  onToggleAvailability={handleAvailabilityToggle}
                />
                <button onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageMenu
