# Portal Transparansi Warga — Cluster Sigerland

Dashboard transparansi iuran, kas, kebersihan, hunian, dan agenda warga
Cluster Sigerland (Desa Sabah Balau, Kec. Jati Agung, Kab. Lampung Selatan).

Terinspirasi dari studi kasus `griyamelati.free.nf`.

## Stack

| Bagian | Teknologi | Alasan |
|---|---|---|
| Frontend | **React + Vite + Tailwind CSS** | Cepat, modern, tampilan menarik |
| Database + API | **Supabase** (Postgres) | Gratis, tanpa perlu server Express sendiri |
| Hosting | **Vercel / Netlify** | Gratis, subdomain `.vercel.app` / `.netlify.app` |

> **Kenapa bukan Express + React?** Hosting gratis `.free.nf` (InfinityFree) hanya
> mendukung PHP + MySQL, tidak bisa menjalankan Node/Express. Sedangkan server
> Express perlu Node yang selalu hidup (tidak gratis permanen). **Supabase**
> sudah menyediakan database + REST/Realtime API otomatis, jadi Express tidak
> diperlukan. Frontend statis React cukup di-deploy ke Vercel (gratis).
>
> **Alternatif** jika ingin persis seperti contoh dosen di `.free.nf`: bangun
> ulang dengan **PHP + MySQL**. Struktur data di `src/data/siteplan.js` bisa jadi
> acuan tabelnya.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka http://localhost:5173

## Build produksi

```bash
npm run build      # hasil di folder dist/
```

## Deploy gratis ke Vercel

1. Push folder ini ke GitHub.
2. Buka https://vercel.com → **Add New Project** → import repo.
3. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
4. Deploy → dapat domain gratis `namamu.vercel.app`.

## Menghubungkan ke database (Supabase)

Integrasi Supabase **sudah terpasang** (`src/lib/supabase.js` & `src/lib/useData.js`).
Aplikasi otomatis:
- pakai **data lokal** (`src/data/siteplan.js`) jika env kosong → tetap jalan untuk demo;
- pakai **data live Supabase** begitu `.env` diisi. Sumber data ditampilkan di footer.

Langkah mengaktifkan:

1. Buat project gratis di https://supabase.com
2. Buat tabel (SQL Editor):

```sql
create table iuran (
  id bigint generated always as identity primary key,
  jenis text, nominal int, periode text
);
create table kas (
  id bigint generated always as identity primary key,
  nama text, saldo int
);
create table transaksi (
  id bigint generated always as identity primary key,
  tgl date, ket text, tipe text check (tipe in ('masuk','keluar')), nominal int
);
create table hunian_blok (
  id bigint generated always as identity primary key,
  kode text, rentang text, jumlah int, dp int
);
create table agenda (
  id bigint generated always as identity primary key,
  tgl date, judul text, kategori text
);
```

3. Salin `.env.example` → `.env`, isi `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`
   (dari Supabase → Project Settings → API).
4. `npm run dev` — footer akan berubah jadi "Supabase (live)". Selesai.
5. Saat deploy, simpan kedua variabel itu di Environment Variables Vercel.

> Peta kavling saat ini dibuat dari generator di `siteplan.js` (`kavlingList`).
> Untuk data riil per kavling, buat tabel `kavling(id text, blok text, status text,
> dp int, hook bool)` dan tarik lewat pola `useData` yang sama.

## Gambar siteplan asli (interaktif)

Section **"Siteplan Resmi (Interaktif)"** menampilkan foto siteplan asli dengan
titik blok yang bisa diklik.

1. Simpan file gambar siteplan sebagai **`public/siteplan.png`**.
2. Muat ulang halaman → gambar tampil dengan hotspot A–F.
3. Posisi hotspot belum pas? Klik tombol **"Kalibrasi posisi hotspot"**, lalu klik
   di gambar. Koordinat `x, y` muncul — salin ke objek `HOTSPOTS` di
   `src/components/SiteplanPhoto.jsx`.

## Panel Admin / Login Pengurus

Buka `#admin` (tombol **"Login Pengurus"** di navbar). Pengurus bisa menambah
transaksi kas, agenda, iuran, dan kas — langsung tersimpan ke Supabase dan tampil
di dashboard.

Menyiapkan akun & keamanan:

1. Supabase → **Authentication → Users → Add user** (buat email + password pengurus).
2. Aktifkan **Row Level Security** tiap tabel, lalu tambah policy:

```sql
-- Semua orang boleh MEMBACA (dashboard publik)
create policy "public read" on transaksi for select using (true);
-- Hanya user login yang boleh MENULIS
create policy "auth write" on transaksi for insert to authenticated with check (true);
-- Ulangi untuk tabel: kas, iuran, agenda
```

## Routing (halaman terpisah)

Memakai **react-router-dom** (HashRouter, kompatibel dengan hosting statis gratis).
Setiap menu adalah halaman sendiri, bukan sekadar anchor:

| Route | Halaman |
|---|---|
| `/` | Beranda |
| `/iuran` | Rincian iuran |
| `/kas` | Kas & transaksi |
| `/siteplan` | Siteplan + peta kavling |
| `/usaha` | Daftar usaha warga |
| `/usaha/:id` | **Detail** satu usaha |
| `/hunian` | Hunian tersedia + rekap blok |
| `/data-warga` | Data kavling & warga (tabel + cari + pagination) |
| `/keuangan` | Rekap laporan keuangan (tab Periode 1–4) |
| `/iuran-air` | Iuran air + status Lunas/Belum Bayar |
| `/banjir` | Dana swadaya penanggulangan banjir |
| `/struktur` | Struktur organisasi + kontak darurat |
| `/galeri` | Galeri kegiatan warga |
| `/masukan` | Kotak masukan & saran (publik → DB) |
| `/warga` | Voting, pengumuman, agenda |
| `/admin` | Panel pengurus (login) |

Tabel panjang (data warga, iuran air) memakai komponen `DataTable` dengan
**pencarian + pagination** supaya ringkas. Menu di navbar dikelompokkan jadi
dropdown: Menu Warga, Keuangan, Layanan, Kegiatan.

## Semua data dapat di-CRUD dari admin

Panel pengurus (`/admin`) mengelola **semua** entitas lewat Supabase:
iuran, kas, transaksi, agenda, usaha, pengumuman, **data warga, rekap keuangan,
iuran air, dana banjir (masuk & keluar), struktur organisasi**, serta kotak masukan.
Setiap perubahan langsung tampil di halaman publik (tanpa refresh).

Halaman publik membaca data dari Supabase; jika sebuah tabel belum dibuat, halaman
otomatis memakai data lokal contoh (`siteplan.js`) sebagai fallback.

## Gambar / foto

Usaha, hunian, agenda, dan pengumuman bisa menampilkan foto.

**Upload langsung (tanpa URL):** di panel admin, field foto berupa tombol
**"Pilih foto"** — file diunggah ke **Supabase Storage** (bucket `foto`), dan URL
publiknya otomatis tersimpan ke kolom `foto`. Lihat `src/lib/upload.js`.

Urutan sumber gambar yang ditampilkan:
1. kolom `foto` hasil upload, atau
2. foto default berdasarkan kategori (usaha/hunian), atau
3. fallback gradient + emoji (kalau foto gagal dimuat).

> Fitur ini butuh `supabase/setup.sql` versi terbaru dijalankan ulang — ia membuat
> bucket `foto` + policy Storage dan menambah kolom `foto` di usaha/agenda/pengumuman.

## Peta lokasi (OpenStreetMap — gratis, bisa di-set dari admin)

Beranda menampilkan **peta lokasi interaktif** memakai **Leaflet + OpenStreetMap**
— **100% gratis, tanpa API key, tanpa tagihan** (berbeda dari Google Maps yang bisa
menagih untuk pemakaian tinggi). Peta bisa di-pan/zoom dan ada tombol "Rute di
Google Maps".

Pengurus mengatur titiknya di **Admin → Lokasi & Peta**: cukup **klik atau geser
pin di peta** — koordinat lat/lng terisi otomatis (bisa juga diketik manual).
Tersimpan ke tabel `pengaturan` (satu baris, id = 1) dan langsung tampil di beranda.

## Perilaku data (asli vs contoh)

Halaman membaca dari Supabase. Bila Supabase **belum dikonfigurasi** atau sebuah
**tabel belum dibuat**, dipakai data contoh lokal sebagai fallback. Tapi kalau
tabel **ada dan kosong** (mis. sengaja dihapus untuk diisi manual), halaman
menampilkan **kosong/nol** — bukan data contoh — supaya tidak membingungkan.

## Keamanan

- **Row Level Security (RLS) aktif** di semua tabel. Publik hanya bisa **membaca**
  data transparansi; **menulis/mengubah/menghapus hanya untuk pengurus yang login**.
  Sudah diuji: request anonim dengan kunci publik tidak bisa insert/update/delete.
- Kunci yang dipakai di klien adalah **publishable/anon key** (memang aman untuk publik);
  tidak ada `service_role` key di kode.
- **Kotak Masukan**: publik boleh mengirim, tapi isinya **hanya bisa dibaca pengurus**.
  Ada validasi panjang/anti-spam ringan. Upload foto anonim **dinonaktifkan** (mencegah
  penyalahgunaan storage) — lampiran foto hanya untuk pengurus di panel admin.
- **Storage** `foto` dibatasi: hanya tipe gambar & maksimal 5 MB.
- Tidak ada `dangerouslySetInnerHTML`/`eval`; React meng-escape teks otomatis (anti-XSS),
  dan Supabase memparameterkan query (anti-SQL-injection).

## Cetak laporan

Halaman **Kas, Rekap Keuangan, Iuran Air, Data Warga, dan Dana Banjir** punya tombol
**🖨️ Cetak Laporan** (`window.print()`) dengan gaya cetak khusus: menu/tombol
disembunyikan, warna jadi hitam-putih rapi, dan tabel ber-pagination otomatis
menampilkan **seluruh baris** saat dicetak (bukan cuma satu halaman).

## Struktur

```
src/
  data/siteplan.js   → data Cluster Sigerland (dari siteplan)
  App.jsx            → seluruh halaman dashboard
  main.jsx, index.css
```

> Catatan: angka iuran, kas, dan hunian di `siteplan.js` masih **contoh**.
> Data blok/kavling & DP diambil dari siteplan resmi. Ganti dengan data riil warga.
