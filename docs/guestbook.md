# 📨 Panduan Setup Database & Guestbook (Supabase)

Dokumen ini memandu Anda dalam menyiapkan database PostgreSQL gratis di **Supabase** untuk menyimpan data Projects dan pesan Guestbook.

---

## 1. Setup Akun & Proyek Supabase

1. Kunjungi **[Supabase](https://supabase.com/)** lalu daftar/masuk menggunakan GitHub.
2. Klik tombol **"New Project"**.
3. Isi kolom yang disediakan:
   * **Project Name:** `NajinKyou-Portfolio`
   * **Database Password:** Buat password yang kuat dan catat.
   * **Region:** Pilih region terdekat dengan pengguna Anda (misalnya: `Singapore - ap-southeast-1` untuk akses tercepat dari Indonesia).
   * **Pricing Plan:** Pilih **Free Tier** ($0/bulan).
4. Klik **"Create New Project"**. Supabase akan menyiapkan database Anda selama beberapa menit.

---

## 2. Membuat Skema Tabel (SQL Schema)

Setelah proyek siap, kita perlu membuat tabel database untuk Projects dan Guestbook:

1. Di menu sidebar kiri dashboard Supabase, klik **"SQL Editor"**.
2. Klik **"New Query"** untuk membuat editor kueri SQL baru.
3. Salin dan tempel (paste) kode SQL berikut ke dalam editor:

```sql
-- Mengaktifkan ekstensi kriptografi untuk ID UUID otomatis
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Membuat tabel Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  tech_stack TEXT[],
  category TEXT CHECK (category IN ('ai', 'web', 'mobile', 'data')),
  thumbnail_url TEXT,
  demo_url TEXT,
  github_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Membuat tabel Guestbook
CREATE TABLE IF NOT EXISTS guestbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true, -- default true agar langsung muncul di halaman web
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Mengaktifkan Row Level Security (RLS) demi keamanan
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;

-- 4. Membuat Kebijakan Keamanan (RLS Policies)
-- Kebijakan untuk projects: Siapa saja dapat melihat data (SELECT)
CREATE POLICY "projects read public" ON projects 
  FOR SELECT USING (true);

-- Kebijakan untuk guestbook: Siapa saja dapat mengirim pesan baru (INSERT)
CREATE POLICY "guestbook insert public" ON guestbook 
  FOR INSERT WITH CHECK (true);

-- Kebijakan untuk guestbook: Publik hanya dapat melihat pesan yang disetujui (is_approved = true)
CREATE POLICY "guestbook approved read public" ON guestbook 
  FOR SELECT USING (is_approved = true);
```

4. Klik tombol **"Run"** di pojok kanan bawah editor.
5. Pastikan muncul notifikasi sukses: `Success. No rows returned.`

---

## 3. Manajemen Data & Moderator Guestbook

Mengingat kita meniadakan sistem custom admin dashboard Next.js demi menyederhanakan kode dan meningkatkan aspek keamanan, Anda dapat memoderasi pesan guestbook langsung melalui **Supabase Table Editor**:

### Menyetujui atau Menghapus Pesan:
1. Masuk ke dashboard Supabase Anda.
2. Di sidebar kiri, pilih menu **"Table Editor"**.
3. Klik pada nama tabel `guestbook`.
4. Anda akan melihat spreadsheet interaktif berisi seluruh pesan yang dikirim pengunjung:
   * **Untuk memblokir/menyembunyikan pesan:** Ubah nilai pada kolom `is_approved` dari `true` menjadi `false`.
   * **Untuk menghapus pesan:** Klik kanan pada baris pesan tersebut, lalu pilih **"Delete row"**.
   * **Untuk mengubah isi pesan:** Klik dua kali pada sel yang ingin diedit, lakukan perubahan, lalu tekan enter.

### Menambahkan Project Baru:
1. Buka tabel `projects` di Table Editor.
2. Klik tombol **"Insert row"**.
3. Isi kolom-kolom proyek:
   * `name`: Nama proyek (misal: `My New App`)
   * `slug`: Slug URL unik (misal: `my-new-app`)
   * `description`: Deskripsi singkat
   * `tech_stack`: Masukkan array teknologi dengan format `{"Go","React"}`
   * `category`: Pilih salah satu dari `ai`, `web`, `mobile`, `data`
   * `is_featured`: Set `true` jika ingin ditampilkan di bagian unggulan
   * `order_index`: Indeks pengurutan (semakin kecil, semakin atas)
4. Klik **"Save"**. Proyek baru akan langsung muncul di halaman web portfolio Anda setelah Vercel atau cache direfresh!

---

## 4. Cara Melakukan Backup Data

Supabase melakukan backup database harian secara otomatis untuk seluruh tingkat database (termasuk Free Tier). Namun, jika Anda ingin menyalin data secara manual ke komputer lokal Anda untuk diarsipkan:

1. Buka dashboard Supabase, pilih menu **"Database"** di sidebar kiri.
2. Buka tab **"Backups"**.
3. Di sana Anda dapat mengunduh salinan database SQL mentah (.sql) secara instan.
4. Anda juga dapat menggunakan perintah PostgreSQL standar di terminal lokal Anda untuk melakukan dump data:
   ```bash
   pg_dump -h db.wqchbiunmcwxipusjsfe.supabase.co -U postgres -d postgres > backup_portfolio.sql
   ```
   *(Ganti host `db.wqchbiunmcwxipusjsfe.supabase.co` dengan Host DB proyek Anda yang tertera di menu Settings -> Database)*
