import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Search, UserPlus } from 'lucide-react'

const AssignManager = () => {
  const { restaurantId } = useParams()
  const [searchParams] = useSearchParams()
  const restaurantName = searchParams.get('name') || 'this restaurant'
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigningId, setAssigningId] = useState(null)

  const fetchUsers = useCallback(async (query = '') => {
    setLoading(true)
    try {
      const res = await api.get(`/auth/available-managers/?search=${query}`)
      setUsers(res.data.results)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearch(value)
    fetchUsers(value)
  }

  const handleAssign = async (user) => {
    setAssigningId(user.id)
    try {
      await api.post(`/restaurants/${restaurantId}/assign-manager/`, { user_id: user.id })
      toast.success(`${user.first_name || user.email} is now managing ${restaurantName}`)
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign manager')
    } finally {
      setAssigningId(null)
    }
  }

  return (
    <div className="min-h-screen bg-brand-white-soft">
      <Navbar />
      <div className="container-main py-8 max-w-2xl">
        <button onClick={() => navigate('/admin')}
          className="flex items-center gap-1.5 text-sm text-brand-gray hover:text-brand-black mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Admin
        </button>

        <h1 className="text-xl font-black text-brand-black mb-1">Add Manager</h1>
        <p className="text-brand-gray mb-6">Assigning a manager for <span className="font-semibold">{restaurantName}</span></p>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search by name or email..."
            className="input-field pl-10"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-brand-gray py-12">No matching customers found</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-black rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{(u.first_name?.[0] || u.username?.[0] || '?').toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-black truncate">{u.first_name} {u.last_name}</p>
                  <p className="text-xs text-brand-gray truncate">{u.email}</p>
                </div>
                <button
                  onClick={() => handleAssign(u)}
                  disabled={assigningId === u.id}
                  className="btn-primary text-sm py-1.5 px-4 flex items-center gap-1.5 flex-shrink-0">
                  <UserPlus size={14} />
                  {assigningId === u.id ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AssignManager