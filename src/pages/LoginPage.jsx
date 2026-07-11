import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signInWithGooglePopup } from '../api/firebaseAuth'
import toast from 'react-hot-toast'
import { Eye, EyeOff, LogIn, User } from 'lucide-react'

const LoginPage = () => {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ identifier: '', password: '' })
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
      toast.success(`Welcome back, ${user.first_name || user.username}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Google sign-in failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(formData.identifier, formData.password)
      toast.success(`Welcome back, ${user.first_name || user.username}!`)

      if (user.role === 'platform_admin') navigate('/admin')
      else if (user.role === 'restaurant_manager') navigate('/dashboard')
      else navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid email/username or password')
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
          <h1 className="text-2xl font-bold text-brand-black mt-4">Welcome back</h1>
          <p className="text-brand-gray mt-1">Sign in with your email or username</p>
        </div>

        <div className="card p-8">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className="w-full border border-gray-300 rounded-xl py-3 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60 mb-4">
            {googleLoading ? 'Connecting Google...' : 'Continue with Google'}
          </button>

          <div className="text-center text-xs text-brand-gray mb-4">or sign in with password</div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-black mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  autoComplete="username"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-black mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-black">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn size={18} /> Sign In</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-brand-gray mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-black font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
