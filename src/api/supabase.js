import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseBucket = import.meta.env.VITE_SUPABASE_BUCKET || 'foodcourt-images'

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export const isSupabaseConfigured = () => Boolean(supabase)

export const uploadImageToSupabase = async (file, folder) => {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const extension = file.name.includes('.') ? file.name.split('.').pop() : ''
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension ? `.${extension}` : ''}`
  const filePath = folder ? `${folder}/${safeName}` : safeName

  const { error } = await supabase.storage.from(supabaseBucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })

  if (error) {
    throw error
  }

  const { data } = supabase.storage.from(supabaseBucket).getPublicUrl(filePath)
  return data.publicUrl
}
