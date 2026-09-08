# Belajar DJPb

<p align="center">
  <strong>Bank Soal DJPb Paket 1–9</strong><br>
  Aplikasi latihan mandiri untuk mempelajari materi perbendaharaan, mengerjakan try out, dan mengulang soal berdasarkan progres belajar.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%2B%20CSS%20%2B%20JS-1E88E5" alt="Frontend HTML, CSS, dan JavaScript">
  <img src="https://img.shields.io/badge/Hosting-GitHub%20Pages-335CA7" alt="Hosting GitHub Pages">
  <img src="https://img.shields.io/badge/Materi-270%20Soal%20%7C%209%20Paket-3949AB" alt="270 soal dalam 9 paket">
  <img src="https://img.shields.io/badge/Penyimpanan-localStorage-5E35B1" alt="Penyimpanan lokal di browser">
  <img src="https://img.shields.io/badge/License-MIT-278E64" alt="Lisensi MIT">
</p>

---

## Ringkasan

Belajar DJPb, dengan nama tampilan **DJPb Study**, menyediakan 270 soal versi **Case & Analitis** dalam 9 paket beserta kunci jawaban dan pembahasan. Materi mengikuti pembaruan `readme.md` dari repository `basis_data/Assessment Administrator`, dengan soal kasus, pilihan jawaban terbaik (*best answer*), dan urutan opsi sesuai sumber terbaru. Pengguna dapat belajar per paket, menjalankan try out, menandai soal penting, dan mengulang jawaban yang masih salah.

Aplikasi berjalan sepenuhnya di browser menggunakan HTML, CSS, dan JavaScript. Tidak memerlukan backend, database, instalasi dependensi, atau proses build. Progres disimpan melalui `localStorage` pada browser yang digunakan.

---

## Fitur Utama

- **Mode Belajar** — kunci jawaban dan pembahasan muncul setelah pengguna memilih jawaban.
- **Try Out** — latihan dari satu paket atau seluruh paket, dengan pilihan jumlah soal dan pengacakan urutan soal. Hasil dan pembahasan ditampilkan setelah sesi selesai.
- **Progres Belajar** — ringkasan jumlah soal dikerjakan, akurasi, jawaban salah, dan soal ditandai.
- **Mode Review** — ulangi soal yang terakhir dijawab salah atau buka kumpulan soal yang ditandai.
- **Pencarian Topik** — cari paket berdasarkan judul, isi soal, atau pembahasan.
- **Navigasi Soal** — pindah melalui peta nomor soal, tombol navigasi, atau pintasan keyboard pada mode Belajar.
- **Tampilan Responsif** — layout desktop dan ponsel, tema terang/gelap, serta palet biru dan font Segoe UI yang mengikuti SATRIA.
- **Hosting Statis** — dapat dibuka langsung dari file lokal atau dipublikasikan melalui GitHub Pages.

---

## Cara Menggunakan

1. Buka aplikasi, lalu pilih **Mulai belajar** atau salah satu kartu paket.
2. Pilih jawaban untuk melihat kunci dan pembahasan.
3. Gunakan **Tandai soal** untuk menyimpan soal yang ingin dipelajari kembali.
4. Gunakan **Berikutnya**, **Sebelumnya**, atau peta nomor untuk berpindah soal.
5. Dari beranda, pilih **Try Out Acak** untuk latihan lintas paket; untuk satu paket, buka tab **Try Out** pada halaman belajar.
6. Tinjau hasil, lalu gunakan **Review Salah** atau **Bookmark** untuk mengulang materi.

Pintasan keyboard pada mode Belajar:

| Tombol | Fungsi |
| --- | --- |
| `1`–`4` | Memilih jawaban A–D pada soal yang belum dijawab |
| `←` | Membuka soal sebelumnya |
| `→` | Membuka soal berikutnya |

---

## Menjalankan Secara Lokal

Cara paling sederhana adalah membuka [index.html](index.html) langsung di browser modern.

Untuk menjalankan melalui server lokal, gunakan Git untuk mengambil repository dan Python 3 sebagai server file statis:

```bash
git clone https://github.com/cakgup/assessmentdjpb.git
cd assessmentdjpb
python -m http.server 8000 --bind 127.0.0.1
```

Jika repository sudah tersedia, jalankan perintah server dari folder `assessmentdjpb`. Buka [aplikasi lokal](http://127.0.0.1:8000) dan hentikan server dengan `Ctrl+C` setelah selesai.

---

## Publikasi Ke GitHub Pages

Repository ini dapat disajikan langsung tanpa proses build:

1. Push file aplikasi ke branch yang akan digunakan sebagai sumber publikasi.
2. Buka **Settings → Pages** pada repository GitHub.
3. Pada **Build and deployment**, pilih **Deploy from a branch**.
4. Pilih branch sumber dan folder **/(root)**, lalu pilih **Save**.
5. Setelah deployment selesai, buka alamat aplikasi yang ditampilkan GitHub Pages.

File `.nojekyll` sudah tersedia di root repository. Pastikan `index.html` dan folder `assets/` ikut dipublikasikan.

---

## Struktur Repository

```text
assessmentdjpb/
|-- assets/
|   |-- app.js             # Navigasi, mode belajar, try out, dan progres
|   |-- questions.js       # Data soal, pilihan jawaban, kunci, dan pembahasan
|   `-- styles.css         # Tema, tipografi, dan layout responsif
|-- source/
|   |-- Bank_Soal_DJPb_Paket_1-9_CASE_ANALITIS.md  # Sumber aktif
|   `-- Bank_Soal_DJPb_Paket_1-9_REVISI_TERVERIFIKASI.md  # Arsip edisi lama
|-- scripts/
|   `-- build_questions.py  # Generator bank soal dari Markdown
|-- .nojekyll              # Menonaktifkan pemrosesan Jekyll di GitHub Pages
|-- index.html            # Halaman utama aplikasi
|-- LICENSE               # Lisensi MIT
`-- README.md
```

---

## Memperbarui Bank Soal

Materi sumber tersedia di [Bank Soal DJPb Paket 1–9 — Case & Analitis](source/Bank_Soal_DJPb_Paket_1-9_CASE_ANALITIS.md). Aplikasi membaca data dari [assets/questions.js](assets/questions.js) melalui `window.DJPB_QUESTION_BANK`.

Perbarui dokumen sumber aktif, lalu jalankan generator menggunakan Python 3:

```bash
python scripts/build_questions.py
```

Generator memeriksa urutan 9 paket × 30 soal, empat opsi A–D, kecocokan teks kunci dengan opsi, serta keberadaan pembahasan sebelum menulis data aplikasi. Penanda tebal Markdown diubah menjadi teks biasa untuk ditampilkan dengan aman di aplikasi. Tidak diperlukan Python saat aplikasi digunakan.

- Sertakan perubahan dokumen sumber dan hasil `assets/questions.js` dalam commit yang sama.
- ID soal mengikuti paket dan nomor soal. Versi data dihitung otomatis dari isi bank soal; perubahan materi menghasilkan ruang penyimpanan progres baru agar jawaban lama tidak tertukar dengan opsi baru.
- Setelah memperbarui data, buka aplikasi dan periksa paket, jawaban, pembahasan, serta mode try out yang terdampak.
- Jika jumlah soal atau paket berubah, sesuaikan juga teks ringkasan pada aplikasi dan README.

---

## Catatan Penyimpanan

- Progres edisi Case & Analitis terpisah dari edisi sebelumnya. Jawaban dan bookmark lama tetap berada di browser, tetapi tidak dimuat pada edisi baru.
- Jawaban dan bookmark tersimpan di `localStorage` browser; tidak disinkronkan ke server atau perangkat lain.
- Browser, profil, atau alamat akses yang berbeda memiliki penyimpanan masing-masing. Progres dari file lokal tidak otomatis berpindah ke GitHub Pages.
- Sesi try out yang sedang berjalan berada di memori dan tidak dipulihkan setelah halaman dimuat ulang.
- Menghapus data situs pada browser akan menghapus progres lokal. **Reset Progress** pada beranda menghapus jawaban dan bookmark setelah konfirmasi.

---

## Lisensi

Repository ini menggunakan [MIT License](LICENSE).

---

<p align="center">
  developed with love by cakgup
</p>
