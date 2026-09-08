# Belajar DJPb

Aplikasi belajar statis berbasis HTML/CSS/JavaScript yang dapat langsung dipublikasikan melalui **GitHub Pages**. Tidak memerlukan backend, database, framework, atau proses build.

## Fitur

- 270 soal dalam 9 paket dari `Bank_Soal_DJPb_Paket_1-9_REVISI_TERVERIFIKASI.md`.
- Mode **Belajar**: pilih jawaban lalu lihat kunci dan pembahasan singkat.
- Mode **Try Out**: kunci ditahan sampai sesi selesai.
- Progress, akurasi, jawaban salah, dan bookmark tersimpan di `localStorage` browser.
- Review khusus soal salah dan soal yang ditandai.
- Pencarian paket/topik.
- Tampilan responsif desktop/mobile dan dark mode.
- Tanpa dependensi eksternal sehingga cocok untuk GitHub Pages.

## Jalankan secara lokal

Cara paling sederhana, buka `index.html` langsung di browser. Untuk pengalaman yang sama dengan GitHub Pages, jalankan server lokal:

```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000`.

## Publish ke GitHub Pages

1. Buat repository GitHub baru, misalnya `djpb-study`.
2. Upload seluruh isi folder ini ke root repository (`index.html`, folder `assets`, folder `source`, dan `.nojekyll`).
3. Commit dan push ke branch `main`.
4. Buka **Settings → Pages**.
5. Pada **Build and deployment**, pilih **Deploy from a branch**.
6. Pilih branch **main** dan folder **/(root)**, lalu **Save**.
7. Tunggu deployment selesai. GitHub akan menampilkan URL Pages aplikasi.

## Struktur

```text
djpb-belajar/
├── index.html
├── .nojekyll
├── README.md
├── assets/
│   ├── app.js
│   ├── questions.js
│   └── styles.css
└── source/
    └── Bank_Soal_DJPb_Paket_1-9_REVISI_TERVERIFIKASI.md
```

## Memperbarui bank soal

`assets/questions.js` adalah data yang dibaca aplikasi. Data saat ini digenerate dari file Markdown revisi terverifikasi dan tidak membutuhkan proses fetch, sehingga aplikasi tetap bekerja saat dibuka secara lokal maupun di GitHub Pages.

> Catatan: progress pengguna bersifat lokal pada browser/perangkat. GitHub Pages adalah hosting statis dan tidak menyediakan database pengguna.
