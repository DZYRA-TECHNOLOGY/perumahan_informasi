import { Link } from 'react-router-dom'
import { Container } from '../components/ui.jsx'

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-7xl font-black text-orange-500">404</p>
      <h1 className="mt-4 text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p className="mt-2 muted">Maaf, halaman yang Anda cari tidak tersedia.</p>
      <Link to="/" className="btn-orange mt-6 inline-block">← Kembali ke Beranda</Link>
    </Container>
  )
}
