# 🚀 Panduan Setup CI/CD Vercel — najinkyou.dev (kyouchan.vercel.app)

Ada dua metode utama untuk melakukan otomatisasi deploy (CI/CD) ke Vercel ketika Anda melakukan `git push` ke branch `main`.

---

## 🛠️ Metode 1: Integrasi Native Vercel (Rekomendasi & Paling Mudah)
Vercel memiliki sistem integrasi Git bawaan yang sangat kuat dan tanpa konfigurasi manual (Zero Config).

### Langkah-langkah:
1. Masuk ke **[Vercel Dashboard](https://vercel.com/)**.
2. Klik tombol **"Add New"** -> **"Project"**.
3. Hubungkan akun GitHub Anda jika belum, lalu cari repositori proyek **`NajinKyou`**.
4. Klik **"Import"**.
5. Pada bagian **Environment Variables**, masukkan variabel environment Supabase Anda:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
6. Klik **"Deploy"**.

**Selesai!** Setiap kali Anda melakukan `git push origin main` dari komputer lokal, Vercel akan otomatis mendeteksi perubahan tersebut, membangun (build) aplikasi, dan merilisnya secara langsung ke domain Anda (`kyouchan.vercel.app`).

---

## ⚙️ Metode 2: GitHub Actions Workflow (Kustomisasi & Keamanan Ekstra)
Jika Anda ingin menjalankan pengecekan build/test terlebih dahulu sebelum deploy dimulai, kami telah menyediakan file workflow otomatis di:
👉 [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)

Agar workflow ini berjalan dengan sukses, Anda perlu menambahkan 3 buah **Secrets** di repositori GitHub Anda.

### Cara Mendapatkan Kunci (Secrets):
1. **`VERCEL_TOKEN` (Vercel Personal Access Token)**:
   * Buka **Vercel Dashboard** -> **Account Settings** -> **Tokens**.
   * Klik **"Create"**, beri nama (misal: `GitHub Action Token`), pilih scope, lalu salin kodenya.
2. **`VERCEL_ORG_ID` & `VERCEL_PROJECT_ID`**:
   * Instal Vercel CLI di komputer lokal Anda jika belum:
     ```bash
     npm install -g vercel
     ```
   * Masuk ke akun Vercel Anda lewat terminal:
     ```bash
     vercel login
     ```
   * Hubungkan proyek lokal dengan proyek di Vercel:
     ```bash
     vercel link
     ```
     *(Ikuti petunjuknya. Setelah selesai, Vercel akan membuat folder `.vercel` di proyek Anda).*
   * Buka file `.vercel/project.json` untuk melihat nilai `orgId` (untuk `VERCEL_ORG_ID`) dan `projectId` (untuk `VERCEL_PROJECT_ID`).

### Cara Memasukkan Kunci ke GitHub:
1. Buka repositori proyek Anda di **GitHub**.
2. Masuk ke tab **Settings** -> **Secrets and variables** -> **Actions**.
3. Klik tombol **"New repository secret"** untuk menambahkan masing-masing kunci berikut:
   * `VERCEL_TOKEN`
   * `VERCEL_ORG_ID`
   * `VERCEL_PROJECT_ID`
   * *(Opsional)* `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` (jika ingin build verification menggunakan database asli).

---

## 💡 Tips & Rekomendasi
* **Gunakan Metode 1** jika Anda hanya ingin deploy cepat dan otomatis tanpa repot menyalin Token.
* **Gunakan Metode 2** jika Anda ingin memastikan bahwa kode lokal Anda wajib lolos pengecekan build (`npm run build`) terlebih dahulu agar tidak memicu error *production crash* di Vercel saat dideploy.
