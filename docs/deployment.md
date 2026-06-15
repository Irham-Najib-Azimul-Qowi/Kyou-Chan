# 🚀 Panduan Deployment & CI/CD

Panduan ini memandu Anda langkah demi langkah untuk melakukan deploy aplikasi portfolio Go Anda ke **Vercel** secara gratis, lengkap dengan integrasi otomatis GitHub (CI/CD).

---

## 1. Persiapan Repositori Git

Pastikan kode Anda sudah tercatat ke dalam Git lokal dan siap didorong ke GitHub:

1. Buka terminal di folder proyek Anda (`NajinKyou`).
2. Jalankan perintah berikut untuk menginisialisasi Git (jika belum):
   ```bash
   git init
   git add .
   git commit -m "feat: migrate portfolio to Go serverless single scroll page"
   ```
3. Buat repositori baru di GitHub dengan nama bebas (misalnya: `NajinKyou-Portfolio`).
4. Hubungkan repositori lokal Anda dengan GitHub:
   ```bash
   git remote add origin https://github.com/username/nama-repo.git
   git branch -M main
   git push -u origin main
   ```

---

## 2. Deploy ke Vercel (Native Git Integration)

Vercel memiliki deteksi runtime otomatis yang mendeteksi file `vercel.json` dan Go modules (`go.mod`) untuk mengompilasi aplikasi Go secara langsung di awan (cloud).

### Langkah-langkah Deployment:
1. Buka **[Vercel Dashboard](https://vercel.com/)** lalu masuk menggunakan akun GitHub Anda.
2. Klik tombol **"Add New"** lalu pilih **"Project"**.
3. Di daftar repositori, cari repositori portfolio Anda (misal: `NajinKyou-Portfolio`) dan klik tombol **"Import"**.
4. Di bagian **Configure Project**:
   * **Framework Preset:** Pilih **"Other"** (karena kita menggunakan Go, bukan Next.js).
   * **Root Directory:** Biarkan default (`./`).
   * **Build and Development Settings:** Biarkan default (Vercel otomatis membaca `vercel.json` untuk routing).
5. Buka tab **Environment Variables** (SANGAT PENTING) dan masukkan variabel-variabel berikut:

| Nama Variabel | Nilai / Deskripsi |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase project Anda (dari Supabase Dashboard API Settings) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Kunci Publik Anonim Supabase |
| `GOOGLE_GENERATIVE_AI_API_KEY` | API Key dari Google AI Studio (untuk Gemini RAG Assistant) |
| `PINECONE_API_KEY` | API Key Pinecone (untuk database vector RAG) |
| `PINECONE_INDEX_NAME` | Nama index Pinecone Anda (misal: `najinkyou-portfolio`) |
| `RESEND_API_KEY` | API Key dari Resend Email Service |
| `NOTIFICATION_EMAIL` | Alamat email Anda untuk menerima notifikasi pesan baru |

6. Klik tombol **"Deploy"**.

**Selesai!** Vercel akan menarik kode Anda, mengompilasi binary Go, dan meluncurkannya ke domain gratis (misal: `kyouchan.vercel.app`).

---

## 3. Otomatisasi Deploy (CI/CD)

Karena kita menggunakan **Integrasi Native Git Vercel**, alur CI/CD sudah aktif secara otomatis tanpa konfigurasi tambahan:
* Setiap kali Anda mengubah kode di komputer lokal dan menjalankan `git push origin main`, Vercel akan otomatis mendeteksi perubahan tersebut di GitHub.
* Vercel akan memulai proses build baru secara otomatis di latar belakang.
* Jika build sukses, Vercel akan mengalihkan lalu lintas (traffic) ke versi baru secara instan dengan *zero downtime*.
* Jika build gagal, versi lama Anda akan tetap aktif sehingga situs web Anda tidak pernah mengalami gangguan.
* Perubahan pada branch lain (misal: `feature-x`) akan otomatis dibuatkan link **Preview Deployment** sehingga Anda bisa mencobanya terlebih dahulu sebelum digabungkan ke `main`.

---

## 4. Pengujian Lokal

Untuk menguji situs web di komputer lokal sebelum didorong ke GitHub:
1. Pastikan Anda sudah membuat file `.env.local` yang berisi kredensial Supabase, Gemini, Pinecone, dll.
2. Jalankan perintah:
   ```bash
   go run cmd/dev/main.go
   ```
3. Buka **`http://localhost:8080`** di peramban (browser) Anda.
