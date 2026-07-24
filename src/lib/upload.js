import { supabase } from './supabase.js'

const BUCKET = 'foto'

// Upload file gambar ke Supabase Storage, kembalikan URL publik.
export async function uploadImage(file) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran maksimal 5 MB.')

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600', upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
