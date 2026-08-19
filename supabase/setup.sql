-- ============================================================
--  SETUP DATABASE — Portal Transparansi Warga Cluster Sigerland
--  Cara pakai: Supabase → SQL Editor → New query → paste semua → Run.
--  AMAN dijalankan berulang: tabel pakai "if not exists", seed hanya
--  masuk kalau tabel masih kosong, policy di-drop dulu sebelum dibuat.
-- ============================================================

-- ---------- TABEL ----------
create table if not exists iuran (
  id bigint generated always as identity primary key,
  jenis text not null, nominal int not null default 0, periode text default 'per bulan'
);

-- Kas: cukup nama + saldo awal. Saldo berjalan DIHITUNG dari transaksi.
create table if not exists kas (
  id bigint generated always as identity primary key,
  nama text not null, saldo int not null default 0
);
alter table kas add column if not exists saldo_awal int not null default 0;

-- Transaksi = sumber kebenaran keuangan. Ditandai kas & periode.
create table if not exists transaksi (
  id bigint generated always as identity primary key,
  tgl date not null default now(), ket text,
  tipe text check (tipe in ('masuk','keluar')) default 'masuk',
  nominal int not null default 0
);
alter table transaksi add column if not exists kas text;
alter table transaksi add column if not exists periode text;

create table if not exists agenda (
  id bigint generated always as identity primary key,
  tgl date, judul text, kategori text
);
alter table agenda add column if not exists foto text;

create table if not exists usaha (
  id bigint generated always as identity primary key,
  nama text, kategori text, blok text, harga int default 0, wa text, foto text, "desc" text
);
-- untuk DB yang tabelnya sudah ada sebelum kolom foto ditambahkan:
alter table usaha add column if not exists foto text;

create table if not exists pengumuman (
  id bigint generated always as identity primary key,
  tgl date, judul text, isi text, tag text
);
alter table pengumuman add column if not exists foto text;

-- Kotak masukan/saran warga (publik boleh kirim, hanya pengurus boleh baca).
create table if not exists masukan (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  nama text, blok text, saran text, masukan text, foto text
);

-- Tabel data yang dikelola pengurus (CRUD).
create table if not exists data_warga (
  id bigint generated always as identity primary key,
  blok text, pemilik text, penghuni text, ket text
);
create table if not exists keuangan (
  id bigint generated always as identity primary key,
  periode text, tgl text, blok text, masuk int default 0, keluar int default 0, ket text
);
create table if not exists iuran_air (
  id bigint generated always as identity primary key,
  blok text, penghuni text, periode text, tagihan int default 0, status text
);
create table if not exists banjir_kontribusi (
  id bigint generated always as identity primary key,
  blok text, nama text, jul int default 0, ags int default 0, sep int default 0,
  okt int default 0, nov int default 0, des int default 0
);
create table if not exists banjir_pengeluaran (
  id bigint generated always as identity primary key,
  tgl date, ket text, persen int default 0, nominal int default 0
);
create table if not exists struktur (
  id bigint generated always as identity primary key,
  urutan int default 99, jabatan text, nama text, icon text
);
-- Pengaturan lokasi/peta (satu baris, id = 1).
create table if not exists pengaturan (
  id bigint primary key,
  lat double precision, lng double precision, zoom int default 16,
  label text, alamat text, embed text
);

-- ---------- SEED (hanya jika tabel masih kosong) ----------
insert into iuran (jenis, nominal, periode)
select * from (values
  ('Iuran Sampah', 25000, 'per bulan'),
  ('Iuran Keamanan', 30000, 'per bulan'),
  ('Iuran Kebersihan', 15000, 'per bulan')
) v(jenis,nominal,periode)
where not exists (select 1 from iuran);

insert into kas (nama, saldo_awal)
select * from (values
  ('Kas Umum', 500000), ('Kas Keamanan', 0), ('Kas Kebersihan', 0)
) v(nama,saldo_awal)
where not exists (select 1 from kas);

insert into transaksi (tgl, periode, kas, tipe, nominal, ket)
select * from (values
  ('2026-07-20'::date,'Periode 4','Kas Keamanan','masuk',4440000,'Iuran keamanan 148 rumah'),
  ('2026-07-18'::date,'Periode 4','Kas Keamanan','keluar',3600000,'Gaji Satpam (Jul)'),
  ('2026-07-15'::date,'Periode 4','Kas Kebersihan','masuk',3700000,'Iuran sampah 148 rumah'),
  ('2026-07-12'::date,'Periode 4','Kas Kebersihan','keluar',2100000,'Angkut sampah TPS'),
  ('2026-07-05'::date,'Periode 3','Kas Umum','keluar',450000,'Beli alat kebersihan taman')
) v(tgl,periode,kas,tipe,nominal,ket)
where not exists (select 1 from transaksi);

insert into agenda (tgl, judul, kategori)
select * from (values
  ('2026-07-27'::date,'Kerja bakti bulanan (semua blok)','Kebersihan'),
  ('2026-07-30'::date,'Rapat pengurus & laporan kas Juli','Rapat'),
  ('2026-08-17'::date,'Peringatan HUT RI ke-81','Kegiatan')
) v(tgl,judul,kategori)
where not exists (select 1 from agenda);

insert into usaha (nama, kategori, blok, harga, wa, "desc")
select * from (values
  ('Bisma Transporta','Rental Mobil','B12',350000,'6281200000001','Rental mobil all unit + driver.'),
  ('Catering Bu Sri','Makanan','A9',15000,'6281200000003','Nasi box & prasmanan acara warga.'),
  ('Laundry Kilat','Jasa','C4',6000,'6281200000004','Cuci-kering-lipat 1 hari jadi.')
) v(nama,kategori,blok,harga,wa,"desc")
where not exists (select 1 from usaha);

insert into pengumuman (tgl, judul, isi, tag)
select * from (values
  ('2026-07-22'::date,'Perbaikan gerbang & CCTV','Pemasangan CCTV baru di gerbang utama selesai minggu ini.','Keamanan'),
  ('2026-07-19'::date,'Jadwal fogging DBD','Fogging serentak Sabtu 26 Juli pukul 07.00.','Kesehatan')
) v(tgl,judul,isi,tag)
where not exists (select 1 from pengumuman);

insert into data_warga (blok, pemilik, penghuni, ket)
select * from (values
  ('A1','Rasyid Haditya S','Rasyid Haditya S','Dihuni'),
  ('A2','-','-','Kosong'),
  ('A3','Adi','Adi','Dihuni'),
  ('A4','Dwi Miftha Kurnia','Dwi Miftha Kurnia','Dihuni'),
  ('A5','Abdul Irsadul Anam','Abdul Irsadul Anam','Dihuni'),
  ('A6','Tafrikan','Tafrikan','Dihuni'),
  ('A7','Riyadhotul Jinan','Riyadhotul Jinan','Dihuni'),
  ('A8','-','-','Kosong'),
  ('B1','Viky Raditia Delmi','Viky Raditia Delmi','Dihuni'),
  ('B2','Linda Lauren','Linda Lauren','Dihuni'),
  ('B5','Chandra W.U','Chandra W.U','Dihuni'),
  ('B7','Sabar','Mahasiswa','Dikontrakkan'),
  ('C1','Dharmawanti','Dharmawanti','Dihuni')
) v(blok,pemilik,penghuni,ket)
where not exists (select 1 from data_warga);

insert into keuangan (periode, tgl, blok, masuk, keluar, ket)
select * from (values
  ('Periode 3','18/01/2026','',885000,0,'Sisa saldo periode 2'),
  ('Periode 3','20/01/2026','',0,145000,'Pembelian kabel & fitting lampu jalan'),
  ('Periode 3','01/02/2026','A3',100000,0,''),
  ('Periode 3','09/02/2026','',0,135000,'Konsumsi gotong royong (6 orang)'),
  ('Periode 4','01/04/2026','',1029000,0,'Sisa saldo periode 3'),
  ('Periode 4','12/04/2026','D1',100000,0,'')
) v(periode,tgl,blok,masuk,keluar,ket)
where not exists (select 1 from keuangan);

insert into iuran_air (blok, penghuni, periode, tagihan, status)
select * from (values
  ('A1','Rasyid Haditya S','31 Mei 2026',100000,'Lunas'),
  ('A7','Riyadhotul Jinan','14 Juni 2026',100000,'Belum Bayar'),
  ('B1','Viky Raditia Delmi','2026-06-21',100000,'Lunas'),
  ('B5','Chandra W.U','2026-06-21',100000,'Lunas'),
  ('C1','Dharmawanti','2026-07-12',100000,'Lunas'),
  ('C10','Irwan Wijaya','2026-07-19',100000,'Belum Bayar')
) v(blok,penghuni,periode,tagihan,status)
where not exists (select 1 from iuran_air);

insert into banjir_kontribusi (blok, nama, jul, ags, sep, okt, nov, des)
select * from (values
  ('B5','Chandra',1000000,0,0,0,0,0),
  ('A1','Rasyid',500000,500000,0,0,0,0),
  ('C7','Syaifudin',0,400000,0,0,0,0)
) v(blok,nama,jul,ags,sep,okt,nov,des)
where not exists (select 1 from banjir_kontribusi);

insert into banjir_pengeluaran (tgl, ket, persen, nominal)
select * from (values
  ('2026-07-15'::date,'Normalisasi selokan tahap 1',15,1860000)
) v(tgl,ket,persen,nominal)
where not exists (select 1 from banjir_pengeluaran);

insert into struktur (urutan, jabatan, nama, icon)
select * from (values
  (1,'Kepala Lingkungan','Bapak Ari','🧑‍💼'),
  (2,'Sekretaris','Hamba Allah','🖊️'),
  (3,'Bendahara','Hamba Allah','💰'),
  (4,'Keamanan','Tim Satpam','🛡️'),
  (5,'Kebersihan','Tim Kebersihan','🧹')
) v(urutan,jabatan,nama,icon)
where not exists (select 1 from struktur);

insert into pengaturan (id, lat, lng, zoom, label, alamat, embed)
select 1, -5.3581, 105.3149, 16, 'Cluster Sigerland',
  'Desa Sabah Balau, Kec. Jati Agung, Lampung Selatan', ''
where not exists (select 1 from pengaturan);

-- ---------- KEAMANAN (Row Level Security) ----------
-- Publik boleh MEMBACA; user login (pengurus) boleh insert/update/delete.
do $$
declare t text;
begin
  foreach t in array array['iuran','kas','transaksi','agenda','usaha','pengumuman',
    'data_warga','keuangan','iuran_air','banjir_kontribusi','banjir_pengeluaran','struktur','pengaturan'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public read" on %I', t);
    execute format('drop policy if exists "auth write" on %I', t);
    execute format('drop policy if exists "auth update" on %I', t);
    execute format('drop policy if exists "auth delete" on %I', t);
    execute format('create policy "public read"  on %I for select using (true)', t);
    execute format('create policy "auth write"   on %I for insert to authenticated with check (true)', t);
    execute format('create policy "auth update"  on %I for update to authenticated using (true) with check (true)', t);
    execute format('create policy "auth delete"  on %I for delete to authenticated using (true)', t);
  end loop;
end $$;

-- Policy khusus masukan: publik boleh KIRIM, hanya pengurus boleh BACA/HAPUS.
alter table masukan enable row level security;
drop policy if exists "masukan public insert" on masukan;
drop policy if exists "masukan auth read" on masukan;
drop policy if exists "masukan auth delete" on masukan;
create policy "masukan public insert" on masukan for insert with check (true);
create policy "masukan auth read"   on masukan for select to authenticated using (true);
create policy "masukan auth delete" on masukan for delete to authenticated using (true);

-- ---------- STORAGE (upload foto tanpa URL) ----------
-- Bucket publik 'foto': hanya gambar, maksimal 5 MB (batasi penyalahgunaan upload).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('foto', 'foto', true, 5242880, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'];

-- Policy: publik boleh lihat foto, pengurus (login) boleh upload/ubah/hapus.
drop policy if exists "foto public read"   on storage.objects;
drop policy if exists "foto auth upload"   on storage.objects;
drop policy if exists "foto auth update"   on storage.objects;
drop policy if exists "foto auth delete"   on storage.objects;
create policy "foto public read" on storage.objects for select using (bucket_id = 'foto');
create policy "foto auth upload" on storage.objects for insert to authenticated with check (bucket_id = 'foto');
create policy "foto auth update" on storage.objects for update to authenticated using (bucket_id = 'foto');
create policy "foto auth delete" on storage.objects for delete to authenticated using (bucket_id = 'foto');

-- ============================================================
--  KAS BULANAN: tagihan + pembayaran (verifikasi pengurus)
-- ============================================================
-- Katalog jenis iuran (menu iuran): Umum, Keamanan, Kebersihan, Air, dst.
create table if not exists kas_master (
  id bigint generated always as identity primary key,
  nama text, keterangan text
);
alter table kas_master add column if not exists nominal int not null default 0;
alter table kas_master add column if not exists aktif boolean not null default true;
alter table kas_master add column if not exists wajib boolean not null default true;  -- false = sumbangan sukarela

create table if not exists kas_tagihan (
  id bigint generated always as identity primary key,
  blok text, nama text, periode text,
  jenis text,                                    -- jenis iuran (dari kas_master)
  nominal int not null default 0,
  status text not null default 'Belum Bayar',   -- Belum Bayar | Menunggu | Lunas
  jatuh_tempo date
);
alter table kas_tagihan add column if not exists jenis text;

-- Seed katalog iuran (termasuk Air + contoh sumbangan sukarela) bila masih kosong.
insert into kas_master (nama, nominal, aktif, wajib)
select * from (values
  ('Iuran Umum', 25000, true, true),
  ('Iuran Keamanan', 30000, true, true),
  ('Iuran Kebersihan', 15000, true, true),
  ('Iuran Air', 100000, true, true),
  ('Sumbangan HUT RI', 50000, true, false)
) v(nama,nominal,aktif,wajib)
where not exists (select 1 from kas_master);

-- jenis pada pembayaran → untuk memetakan ke kas masing-masing (Kas Keamanan, dst).
alter table kas_pembayaran add column if not exists jenis text;

-- Jadwal kebersihan & sampah (CRUD).
create table if not exists jadwal_sampah (
  id bigint generated always as identity primary key,
  hari text, wilayah text, keterangan text
);
insert into jadwal_sampah (hari, wilayah, keterangan)
select * from (values
  ('Senin & Kamis','Blok A, B',''),
  ('Selasa & Jumat','Blok C, D',''),
  ('Rabu & Sabtu','Blok E, F','')
) v(hari,wilayah,keterangan)
where not exists (select 1 from jadwal_sampah);
alter table jadwal_sampah enable row level security;
drop policy if exists "public read" on jadwal_sampah;
drop policy if exists "auth write" on jadwal_sampah;
drop policy if exists "auth update" on jadwal_sampah;
drop policy if exists "auth delete" on jadwal_sampah;
create policy "public read" on jadwal_sampah for select using (true);
create policy "auth write"  on jadwal_sampah for insert to authenticated with check (true);
create policy "auth update" on jadwal_sampah for update to authenticated using (true) with check (true);
create policy "auth delete" on jadwal_sampah for delete to authenticated using (true);
create table if not exists kas_pembayaran (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  tagihan_id bigint references kas_tagihan(id) on delete set null,
  blok text, nama text, periode text,
  nominal int not null default 0,
  metode text default 'Transfer',
  bukti text,
  status text not null default 'Menunggu',       -- Menunggu | Disetujui | Ditolak
  catatan text,
  diverifikasi_oleh text, diverifikasi_at timestamptz
);

-- Seed contoh tagihan (hanya bila kosong).
insert into kas_tagihan (blok, nama, periode, nominal, status)
select * from (values
  ('A1','Budi Santoso','Juli 2026',100000,'Belum Bayar'),
  ('A2','Sari Dewi','Juli 2026',100000,'Belum Bayar'),
  ('B1','Lestari Wulandari','Juli 2026',100000,'Lunas'),
  ('B5','Chandra','Juli 2026',100000,'Belum Bayar')
) v(blok,nama,periode,nominal,status)
where not exists (select 1 from kas_tagihan);

-- RLS: publik boleh BACA; warga boleh KIRIM pembayaran; pengurus verifikasi.
alter table kas_master enable row level security;
alter table kas_tagihan enable row level security;
alter table kas_pembayaran enable row level security;

do $$
declare t text;
begin
  foreach t in array array['kas_master','kas_tagihan'] loop
    execute format('drop policy if exists "public read" on %I', t);
    execute format('drop policy if exists "auth write" on %I', t);
    execute format('drop policy if exists "auth update" on %I', t);
    execute format('drop policy if exists "auth delete" on %I', t);
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('create policy "auth write"  on %I for insert to authenticated with check (true)', t);
    execute format('create policy "auth update" on %I for update to authenticated using (true) with check (true)', t);
    execute format('create policy "auth delete" on %I for delete to authenticated using (true)', t);
  end loop;
end $$;

-- kas_pembayaran: publik boleh baca & KIRIM (warga tanpa login); pengurus verifikasi/hapus.
drop policy if exists "pembayaran public read"   on kas_pembayaran;
drop policy if exists "pembayaran public insert" on kas_pembayaran;
drop policy if exists "pembayaran auth update"   on kas_pembayaran;
drop policy if exists "pembayaran auth delete"   on kas_pembayaran;
create policy "pembayaran public read"   on kas_pembayaran for select using (true);
create policy "pembayaran public insert" on kas_pembayaran for insert with check (true);
create policy "pembayaran auth update"   on kas_pembayaran for update to authenticated using (true) with check (true);
create policy "pembayaran auth delete"   on kas_pembayaran for delete to authenticated using (true);

-- Bucket 'bukti' untuk bukti pembayaran warga (upload publik, dibatasi gambar & 5 MB).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bukti', 'bukti', true, 5242880, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'];

drop policy if exists "bukti public read"   on storage.objects;
drop policy if exists "bukti public upload" on storage.objects;
drop policy if exists "bukti auth manage"   on storage.objects;
create policy "bukti public read"   on storage.objects for select using (bucket_id = 'bukti');
create policy "bukti public upload" on storage.objects for insert with check (bucket_id = 'bukti');
create policy "bukti auth manage"   on storage.objects for delete to authenticated using (bucket_id = 'bukti');

-- Paksa PostgREST memuat ulang skema (hilangkan error "schema cache").
notify pgrst, 'reload schema';
