# Belajar DJPb

<p align="center">
  <img src="assets/treasury-team.svg" alt="Ilustrasi pegawai belajar perbendaharaan bersama" width="240">
</p>

<p align="center">
  <strong>DJPb Study · Treasury Learning Hub</strong><br>
  Kuasai materi DJPb, satu kasus demi satu kasus.<br>
  Platform latihan mandiri dengan 270 soal, pembahasan, try out, dan progres belajar yang tersimpan otomatis.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%2B%20CSS%20%2B%20JS-3157D5" alt="Frontend HTML, CSS, dan JavaScript">
  <img src="https://img.shields.io/badge/Hosting-GitHub%20Pages-172554" alt="Hosting GitHub Pages">
  <img src="https://img.shields.io/badge/Materi-270%20Soal%20%7C%209%20Paket-536DFE" alt="270 soal dalam 9 paket">
  <img src="https://img.shields.io/badge/Penyimpanan-localStorage-7451BE" alt="Penyimpanan lokal di browser">
  <img src="https://img.shields.io/badge/License-MIT-15803D" alt="Lisensi MIT">
</p>

---

## Ringkasan

**DJPb Study** membantu pengguna mempelajari materi perbendaharaan, mengerjakan latihan assessment, dan meninjau konsep yang masih perlu perhatian. Bank soal terdiri atas **9 paket × 30 soal** edisi **Case & Analitis**, lengkap dengan pilihan jawaban, kunci, dan pembahasan.

Tampilan **Treasury Learning Hub** mengutamakan langkah belajar berikutnya: melanjutkan aktivitas terakhir, memilih paket, melakukan review, atau mencoba try out. Progres melingkar, status paket, target harian, dan gamifikasi ringan memberi konteks pada perjalanan belajar.

Aplikasi berjalan sepenuhnya di browser. Tidak memerlukan backend, database, akun, instalasi dependensi, atau proses build. Font, ikon, dan ilustrasi tersedia di repository, sehingga aplikasi tidak bergantung pada layanan aset eksternal saat digunakan.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Menu Aplikasi](#menu-aplikasi)
- [Cara Menggunakan](#cara-menggunakan)
- [Progres dan Gamifikasi](#progres-dan-gamifikasi)
- [Penyimpanan dan Pemulihan Sesi](#penyimpanan-dan-pemulihan-sesi)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Publikasi ke GitHub Pages](#publikasi-ke-github-pages)
- [Struktur Repository](#struktur-repository)
- [Memperbarui Bank Soal](#memperbarui-bank-soal)
- [Validasi](#validasi)
- [Lisensi](#lisensi)

---

## Fitur Utama

- **Belajar per paket** dengan kunci dan pembahasan setelah memilih jawaban.
- **Try out** dari satu paket atau seluruh paket, pilihan jumlah soal, serta pengacakan urutan soal. Kunci dan hasil ditampilkan setelah sesi selesai.
- **Lanjutkan otomatis** dari posisi belajar atau sesi try out terakhir, termasuk setelah browser ditutup.
- **Hasil akhir paket** berisi nilai, jumlah benar, salah, belum dijawab, dan pembahasan.
- **Review dan bookmark** untuk meninjau jawaban yang belum tepat serta mengumpulkan soal penting.
- **Pencarian dan filter** berdasarkan topik, isi soal, opsi, pembahasan, serta status penyelesaian atau penguasaan paket.
- **Target harian, streak, XP, dan milestone** yang dihitung dari aktivitas nyata di browser.
- **Tampilan responsif** dengan navbar navy, ilustrasi pegawai, font Plus Jakarta Sans, kartu paket berwarna, tema terang/gelap, dan menu ponsel.
- **Akses keyboard** melalui focus state, label kontrol, pintasan soal, dan tautan untuk melewati navigasi.

---

## Menu Aplikasi

| Menu | Fungsi |
| --- | --- |
| **Beranda** | Aktivitas terakhir, ringkasan progres, aksi cepat, target harian, daftar paket, dan insight belajar. |
| **Belajar** | Menuju daftar paket. Kartu membuka posisi terakhir atau hasil jika paket telah selesai. |
| **Try Out** | Mengatur latihan dan melanjutkan sesi yang tersimpan untuk lingkup paket yang sama. |
| **Review** | Memilih kumpulan jawaban salah atau soal ditandai untuk ditinjau kembali. |
| **Progres** | Aktivitas 7 hari, milestone, XP, level, serta penjelasan perhitungan metrik. |
| **Profil** | Mengatur nama panggilan dan target harian; menyediakan reset progres dengan konfirmasi. |
| **Kabar belajar** | Tombol lonceng pada desktop menampilkan ringkasan target dan kebutuhan review secara lokal. |

Pada ponsel, menu utama tersedia melalui tombol hamburger. Tombol tema dan profil tetap dapat diakses dari navbar.

---

## Cara Menggunakan

1. Pilih **Mulai belajar**, **Lanjutkan belajar**, atau kartu paket. Jika ada aktivitas tersimpan, membuka aplikasi kembali dapat langsung memulihkan aktivitas tersebut.
2. Baca pertanyaan dan pilih jawaban. Pada mode Belajar, kunci dan pembahasan langsung ditampilkan.
3. Gunakan **Tandai soal** untuk menyimpan soal penting.
4. Gunakan **Berikutnya**, **Sebelumnya**, atau peta nomor. Saat berpindah soal, layar otomatis kembali ke atas.
5. Pada nomor terakhir, pilih **Selesai & Lihat Hasil**. Soal yang belum dijawab dicatat terpisah; tombol **Kerjakan yang belum dijawab** tersedia pada hasil paket yang belum lengkap.
6. Untuk latihan tanpa kunci langsung, pilih **Try Out Acak** dari beranda atau tab **Try Out** dalam paket. Atur jumlah dan pengacakan soal, lalu mulai sesi.
7. Tinjau hasil melalui **Review**, atau buka **Progres** untuk melihat perkembangan belajar.

Pintasan pada mode Belajar:

| Tombol | Fungsi |
| --- | --- |
| `1`–`4` | Memilih jawaban A–D pada soal yang belum dijawab. |
| `←` | Membuka soal sebelumnya. |
| `→` | Membuka soal berikutnya. |

---

## Progres dan Gamifikasi

| Metrik | Perhitungan |
| --- | --- |
| **Progres / Tuntas** | Jumlah soal yang sudah dijawab dibanding seluruh soal. Ditampilkan melalui progress ring dan bar paket. |
| **Mastery** | Persentase jawaban terakhir yang benar dari soal yang sudah dijawab. |
| **Nilai hasil** | Persentase jawaban benar dari seluruh soal dalam paket atau sesi, termasuk soal yang belum dijawab. |
| **XP** | 10 poin sekali untuk setiap soal unik yang dikerjakan, ditambah 5 poin sekali saat dijawab benar. Pengulangan tidak menggandakan XP. |
| **Target harian** | Jumlah soal unik yang dikerjakan pada tanggal lokal. Pilihan target: 5, 10, 20, atau angka khusus 1–270 soal. |
| **Streak** | Hari belajar berturut-turut. Jika belum belajar hari ini, rangkaian yang berakhir kemarin masih ditampilkan. |
| **Milestone** | Langkah pertama, pencapaian target harian, dan penyelesaian satu paket. |

Label mastery: **Perlu review** (0–49%), **Developing** (50–69%), **Good** (70–84%), **Strong** (85–94%), dan **Mastered** (95–100%). Status paket **Mastered** juga mensyaratkan seluruh soal paket sudah dijawab.

Level XP dimulai dari **Treasury Rookie**, lalu **Treasury Explorer** (300 XP), **Treasury Analyst** (1.000 XP), **Treasury Specialist** (2.000 XP), dan **Treasury Master** (3.500 XP).

Gamifikasi digunakan untuk motivasi belajar dan tidak mengubah perhitungan nilai latihan. Riwayat lama diinisialisasi dari timestamp jawaban yang tersedia. Aktivitas yang tidak pernah tersimpan tidak direkonstruksi.

---

## Penyimpanan dan Pemulihan Sesi

- Jawaban, bookmark, posisi per paket, sesi try out, hasil terakhir, aktivitas harian, dan preferensi profil disimpan di `localStorage`.
- Aplikasi tidak menetapkan masa kedaluwarsa untuk progres. Sesi try out dipulihkan beserta urutan soal, jawaban, dan posisi terakhir; tombol **Keluar** menyimpan sesi untuk dilanjutkan nanti.
- Penyimpanan terpisah menurut browser, profil, dan alamat akses. Gunakan alamat yang sama secara konsisten: `localhost`, `127.0.0.1`, file lokal, dan GitHub Pages tidak berbagi progres.
- Cache file aplikasi berbeda dari penyimpanan progres. Mode privat, penghapusan data situs, atau kebijakan penyimpanan browser dapat menghilangkan data lokal.
- **Reset progres belajar** pada menu profil menghapus data belajar dan preferensi edisi aktif setelah konfirmasi. Progres tidak disinkronkan ke server atau perangkat lain.
- Redesign dan penyuntingan narasi mempertahankan progres edisi Case & Analitis. Edisi sebelum Case & Analitis tetap terpisah karena urutan opsi berbeda.

---

## Menjalankan Secara Lokal

Cara paling sederhana adalah membuka [index.html](index.html) di browser modern. Untuk menggunakan server lokal, ambil repository dengan Git dan jalankan server file statis menggunakan Python 3:

```bash
git clone https://github.com/cakgup/assessmentdjpb.git
cd assessmentdjpb
python -m http.server 8000 --bind 127.0.0.1
```

Buka [aplikasi lokal](http://127.0.0.1:8000). Jika repository sudah tersedia, cukup jalankan perintah server dari folder proyek. Hentikan server dengan `Ctrl+C`.

Git dan Python hanya diperlukan untuk alur di atas. Node.js diperlukan jika menjalankan pengujian JavaScript, bukan untuk menggunakan aplikasi.

---

## Publikasi ke GitHub Pages

1. Push file aplikasi ke branch sumber publikasi.
2. Buka **Settings → Pages** pada repository GitHub.
3. Pada **Build and deployment**, pilih **Deploy from a branch**.
4. Pilih branch sumber dan folder **/(root)**, lalu pilih **Save**.
5. Setelah deployment selesai, buka alamat yang ditampilkan GitHub Pages.

Repository ini tidak memerlukan proses build. Sertakan `index.html`, seluruh folder `assets/` termasuk font dan ilustrasi, serta file `.nojekyll` di root repository.

---

## Struktur Repository

```text
assessmentdjpb/
|-- assets/
|   |-- app.js                # Navigasi, tampilan, belajar, try out, dan progres
|   |-- learning.js           # Aktivitas harian, XP, streak, status, dan ikon
|   |-- questions.js          # Bank soal yang dihasilkan dari Markdown
|   |-- styles.css            # Design token, tema, dan layout responsif
|   |-- treasury-team.svg     # Ilustrasi hero
|   `-- fonts/                # Plus Jakarta Sans dan lisensi SIL OFL
|-- source/
|   |-- Bank_Soal_DJPb_Paket_1-9_CASE_ANALITIS.md          # Sumber aktif
|   `-- Bank_Soal_DJPb_Paket_1-9_REVISI_TERVERIFIKASI.md  # Arsip edisi lama
|-- scripts/
|   |-- build_questions.py    # Generator dan validasi struktur bank soal
|   `-- test_app.cjs          # Pengujian perilaku aplikasi dan metrik belajar
|-- .nojekyll
|-- index.html
|-- LICENSE
`-- README.md
```

---

## Memperbarui Bank Soal

Sumber aktif adalah [Bank Soal DJPb — Case & Analitis](source/Bank_Soal_DJPb_Paket_1-9_CASE_ANALITIS.md), berdasarkan pembaruan `readme.md` pada repository `basis_data/Assessment Administrator`. Aplikasi membaca hasil generator dari [assets/questions.js](assets/questions.js).

Perbarui Markdown sumber, lalu jalankan:

```bash
python scripts/build_questions.py
```

Generator memeriksa 9 paket × 30 soal, empat opsi A–D, kecocokan teks kunci dengan opsi, dan keberadaan pembahasan sebelum menulis hasil. Penanda tebal Markdown diubah menjadi teks biasa untuk ditampilkan di aplikasi.

- Sertakan dokumen sumber dan hasil generator dalam commit yang sama.
- Pertahankan `PROGRESS_VERSION` pada generator untuk penyuntingan bahasa yang tidak mengubah makna atau posisi jawaban. Ubah penanda tersebut jika substansi soal atau urutan opsi berubah agar jawaban lama tidak tertukar.
- Jika jumlah soal, paket, atau kelompok materi berubah, sesuaikan validasi generator, metadata pada `assets/learning.js`, teks ringkasan, dan README.
- Narasi mengikuti prinsip umum [kaidah penulisan soal Pusat Penilaian Pendidikan](https://pusmendik.kemendikdasmen.go.id/pdf/file-111): pokok soal jelas, informasi yang diperlukan saja, dan bahasa komunikatif. Pertahankan angka serta konteks yang diperlukan untuk menjawab kasus.

---

## Validasi

```bash
python scripts/build_questions.py
node --check assets/app.js
node --check assets/learning.js
node --test scripts/test_app.cjs
```

Pengujian otomatis mencakup kompatibilitas progres, pemulihan posisi dan try out, navigasi ke atas, hasil paket dengan soal kosong, struktur 270 soal, filter paket, migrasi aktivitas lama, serta XP/streak yang tidak dihitung ganda. Pengujian menggunakan data sementara tanpa mengubah progres browser pengguna.

Setelah mengubah tampilan, periksa beranda, pencarian/filter, halaman soal, hasil akhir, menu ponsel, dan tema terang/gelap. Ukuran acuan redesign: desktop **1366×768** dan **1920×1080**, tablet, serta ponsel selebar **375 px**. Pastikan tombol lanjut terlihat tanpa scroll dan tidak ada scroll horizontal.

Implementasi mencakup komponen wajib dan fitur pendukung redesign, ditambah milestone serta grafik aktivitas lokal. Leaderboard bersama, target mingguan, dan rekomendasi otomatis belum tersedia.

---

## Lisensi

Kode aplikasi menggunakan [MIT License](LICENSE). Font Plus Jakarta Sans didistribusikan dengan [SIL Open Font License](assets/fonts/OFL.txt).

---

<p align="center">
  developed with love by cakgup
</p>
