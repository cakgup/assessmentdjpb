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

Belajar DJPb, dengan nama tampilan **DJPb Study**, menyediakan 270 soal versi **Case & Analitis** dalam 9 paket beserta kunci jawaban dan pembahasan. Materi mengikuti pembaruan `readme.md` dari repository `basis_data/Assessment Administrator`, dengan urutan opsi dan kunci sesuai edisi tersebut. Narasi telah disunting agar pertanyaan langsung ke inti, konteks kasus tetap relevan, dan kalimat generik yang berulang dihilangkan. Pengguna dapat belajar per paket, menjalankan try out, menandai soal penting, dan mengulang jawaban yang masih salah.

Aplikasi berjalan sepenuhnya di browser menggunakan HTML, CSS, dan JavaScript. Tidak memerlukan backend, database, instalasi dependensi, atau proses build. Progres disimpan melalui `localStorage` pada browser yang digunakan.

---

## Fitur Utama

- **Mode Belajar** — kunci jawaban dan pembahasan muncul setelah pengguna memilih jawaban.
- **Try Out** — latihan dari satu paket atau seluruh paket, dengan pilihan jumlah soal dan pengacakan urutan soal. Hasil dan pembahasan ditampilkan setelah sesi selesai.
- **Lanjutkan Otomatis** — posisi terakhir per paket, jawaban, bookmark, dan sesi try out disimpan saat digunakan. Membuka aplikasi kembali akan memulihkan aktivitas terakhir.
- **Hasil Belajar** — tombol **Selesai & Lihat Hasil** di nomor terakhir menampilkan nilai, jumlah benar, salah, belum dijawab, dan pembahasan.
- **Progres Belajar** — ringkasan jumlah soal dikerjakan, akurasi, jawaban salah, dan soal ditandai.
- **Mode Review** — ulangi soal yang terakhir dijawab salah atau buka kumpulan soal yang ditandai.
- **Pencarian Topik** — cari paket berdasarkan judul, isi soal, atau pembahasan.
- **Navigasi Soal** — pindah melalui peta nomor soal, tombol navigasi, atau pintasan keyboard pada mode Belajar.
- **Treasury Learning Hub** — navbar navy, hero dengan ilustrasi pegawai, font Plus Jakarta Sans, kartu paket berwarna, serta layout desktop/tablet/ponsel dan tema terang/gelap.
- **Target dan Motivasi Belajar** — target harian 5/10/20 soal atau target khusus, streak, XP, level belajar, serta milestone dari aktivitas nyata.
- **Filter Paket** — tampilkan semua paket, yang belum selesai, yang perlu review, atau yang sudah dikuasai.
- **Progres dan Profil Lokal** — grafik aktivitas 7 hari, penjelasan mastery, kabar belajar, serta nama panggilan dan preferensi tanpa akun.
- **Hosting Statis** — dapat dibuka langsung dari file lokal atau dipublikasikan melalui GitHub Pages.

---

## Cara Menggunakan

1. Buka aplikasi, lalu pilih **Mulai belajar** atau salah satu kartu paket.
2. Pilih jawaban untuk melihat kunci dan pembahasan.
3. Gunakan **Tandai soal** untuk menyimpan soal yang ingin dipelajari kembali.
4. Gunakan **Berikutnya**, **Sebelumnya**, atau peta nomor untuk berpindah soal. Halaman otomatis kembali ke atas agar awal soal langsung terlihat. Di nomor terakhir, pilih **Selesai & Lihat Hasil**.
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
|   |-- learning.js       # Metrik aktivitas, XP, streak, status, dan ikon
|   |-- treasury-team.svg # Ilustrasi hero
|   |-- fonts/            # Plus Jakarta Sans dan lisensi SIL OFL
|   |-- questions.js       # Data soal, pilihan jawaban, kunci, dan pembahasan
|   `-- styles.css         # Tema, tipografi, dan layout responsif
|-- source/
|   |-- Bank_Soal_DJPb_Paket_1-9_CASE_ANALITIS.md  # Sumber aktif
|   `-- Bank_Soal_DJPb_Paket_1-9_REVISI_TERVERIFIKASI.md  # Arsip edisi lama
|-- scripts/
|   |-- build_questions.py  # Generator bank soal dari Markdown
|   `-- test_app.cjs        # Pengujian progres, navigasi, dan hasil
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
- ID soal mengikuti paket dan nomor soal. Versi data dihitung otomatis dari isi bank soal. `PROGRESS_VERSION` pada generator menentukan kompatibilitas progres: pertahankan untuk penyuntingan bahasa yang tidak mengubah makna atau posisi jawaban, dan ubah jika substansi soal atau urutan opsi berubah.
- Setelah memperbarui data, buka aplikasi dan periksa paket, jawaban, pembahasan, serta mode try out yang terdampak.
- Jika jumlah soal atau paket berubah, sesuaikan juga teks ringkasan pada aplikasi dan README.

---

## Catatan Penyimpanan

- Penyuntingan narasi mempertahankan progres dan bookmark edisi Case & Analitis. Data dari edisi sebelum Case & Analitis tetap terpisah karena urutan opsi berbeda.
- Jawaban, bookmark, posisi belajar per paket, sesi try out, hasil terakhir, aktivitas harian, dan preferensi profil tersimpan di `localStorage`. Aplikasi tidak menetapkan masa kedaluwarsa dan tidak menyinkronkan data ke server atau perangkat lain.
- Browser, profil, atau alamat akses yang berbeda memiliki penyimpanan masing-masing. Progres dari file lokal tidak otomatis berpindah ke GitHub Pages.
- Sesi try out dipulihkan beserta urutan soal, jawaban, dan posisi terakhir setelah halaman dimuat ulang atau browser dibuka kembali. Tombol **Keluar** menyimpan sesi untuk dilanjutkan nanti.
- Cache file aplikasi berbeda dari penyimpanan progres. Mode privat, penghapusan data situs, atau kebijakan penyimpanan browser dapat menghilangkan data lokal.
- Menghapus data situs pada browser akan menghapus progres lokal. **Reset progres belajar** pada menu profil menghapus jawaban, bookmark, posisi, sesi, dan hasil edisi aktif setelah konfirmasi.

---

## Pedoman Penyuntingan dan Validasi

Narasi mengikuti prinsip umum [kaidah penulisan soal Pusat Penilaian Pendidikan](https://pusmendik.kemendikdasmen.go.id/pdf/file-111): pokok soal jelas, informasi yang diperlukan saja, dan bahasa komunikatif. Kalimat kasus generik dan penutup berulang dihapus; pertanyaan hitungan tetap memuat angka dan kondisi yang dibutuhkan. Tambahan frasa pada opsi yang hanya memperpanjang teks juga dihapus dengan mempertahankan substansinya.

Untuk memeriksa hasil pembaruan:

```bash
python scripts/build_questions.py
node --check assets/app.js
node --check assets/learning.js
node --test scripts/test_app.cjs
```

Pengujian menggunakan data sementara, tanpa membaca atau mengubah progres browser pengguna. Cakupannya meliputi kompatibilitas progres, pemulihan posisi dan try out, perpindahan ke atas, hasil paket dengan soal kosong, struktur 270 soal, filter paket, migrasi aktivitas lama, serta XP/streak yang tidak dihitung ganda.

---

## Treasury Learning Hub

- **Beranda** mengutamakan aktivitas terakhir, ringkasan progres, quick action, target harian, pencarian, dan kartu paket.
- **Belajar** mengarahkan ke daftar paket. Kartu menyambung posisi terakhir atau menampilkan hasil jika paket selesai.
- **Review** membuka pilihan jawaban salah dan soal ditandai.
- **Progres** menampilkan aktivitas 7 hari, milestone, serta penjelasan perhitungan metrik.
- **Profil** mengatur nama panggilan dan target harian, sekaligus menyediakan reset progres dengan konfirmasi. Tombol lonceng desktop menampilkan kabar belajar lokal.

Mastery dihitung dari jawaban terakhir yang benar dibagi soal yang sudah dijawab. Status **Mastered** mensyaratkan semua soal paket selesai dan mastery minimal 95%. Progress ring menunjukkan persentase soal yang selesai, sehingga tidak tertukar dengan mastery.

Setiap soal unik memberikan 10 XP sekali, ditambah 5 XP sekali ketika dijawab benar. Mengulang soal tidak menggandakan XP. Target harian menghitung soal unik per tanggal lokal; streak menghitung hari aktif berturut-turut. Riwayat lama diinisialisasi dari timestamp jawaban yang tersedia, tanpa mengarang aktivitas yang tidak tersimpan. Gamifikasi tidak memengaruhi perhitungan nilai latihan.

Seluruh aset font, ikon, dan ilustrasi tersedia secara lokal. Tidak diperlukan layanan eksternal saat aplikasi digunakan. Fitur leaderboard bersama, target mingguan, dan rekomendasi otomatis dari tahap enhancement belum disertakan.

---

## Lisensi

Repository ini menggunakan [MIT License](LICENSE). Font Plus Jakarta Sans didistribusikan dengan [SIL Open Font License](assets/fonts/OFL.txt).

---

<p align="center">
  developed with love by cakgup
</p>
