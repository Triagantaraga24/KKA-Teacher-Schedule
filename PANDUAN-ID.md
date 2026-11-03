# Panduan Penggunaan & Publikasi — KKA Teacher Schedule

## 1. Isi paket

Aplikasi ini merupakan PWA statis untuk mengelola jadwal pribadi guru Koding dan Kecerdasan Artifisial (KKA). Aplikasi dibuat dengan HTML, CSS, Vanilla JavaScript ES Modules, IndexedDB, LocalStorage, Service Worker, Web Notifications, dan SheetJS. Tidak ada backend, database server, Firebase, Supabase, atau fungsi serverless.

Fitur yang tersedia:

- Dashboard untuk jadwal hari ini, sesi berikutnya, hitung mundur, dan ringkasan mingguan.
- Daftar jadwal, tampilan mingguan, serta kalender bulanan.
- Tambah, ubah, hapus, batalkan, dan jadwalkan ulang sesi.
- Pengecualian untuk satu pertemuan pada jadwal mingguan tanpa mengubah pertemuan lainnya.
- Impor Excel `.xlsx` dan `.xls`, multi-file, multi-worksheet, deteksi header, pemetaan kolom manual, preview, dan laporan validasi.
- Filter impor berdasarkan ID/nama guru dan mata pelajaran KKA.
- Pengingat lokal ketika aplikasi aktif, serta ekspor `.ics` untuk kalender eksternal.
- Backup dan restore JSON, riwayat perubahan, serta dukungan offline setelah aplikasi dimuat.

**Tidak ada jadwal awal yang diisikan.** Workbook jadwal tidak disertakan bersama instruksi, jadi impor file Excel milik Anda sendiri untuk mengisi data. Aplikasi tidak membuat atau menebak jadwal.

## 2. Menjalankan secara lokal

Karena aplikasi menggunakan JavaScript ES Modules dan Service Worker, jalankan melalui HTTP localhost, bukan dengan membuka file `index.html` langsung.

Contoh menggunakan Python sebagai server file statis lokal (bukan backend aplikasi):

```powershell
cd "$HOME\Downloads\KKA-Teacher-Schedule"
py -m http.server 8000
```

Buka `http://localhost:8000`. Alternatifnya gunakan ekstensi VS Code Live Server. Untuk menghentikan server lokal, tekan `Ctrl+C` pada terminal.

## 3. Konfigurasi dan impor jadwal

1. Buka menu **Settings** dan verifikasi nama serta ID guru.
2. Buka **Import Excel**, pilih satu atau beberapa workbook.
3. Periksa worksheet dan hasil deteksi header. Gunakan **Pemetaan kolom** bila kolom tidak terdeteksi dengan tepat.
4. Periksa ringkasan baris valid, tidak cocok, ambigu, dan invalid.
5. Hanya data yang cocok dengan identitas guru dan mapel KKA serta memiliki kelas, tanggal/pola yang sah, dan rentang waktu valid yang dapat disimpan.
6. Tekan **Konfirmasi & simpan** setelah preview benar.

ID guru menjadi acuan utama bila ID tersedia di workbook. Bila tidak ada kolom/nilai ID, aplikasi membandingkan nama guru yang sudah dinormalisasi. Baris ambigu tidak otomatis dimasukkan.

Hari tanpa tanggal tidak otomatis dijadikan jadwal mingguan. Pola berulang hanya dibuat ketika workbook secara eksplisit mengindikasikan jadwal mingguan/rutin/berulang. Data ujian (misalnya STS, SAS, PG, Essay, atau kode ruang) membutuhkan tanggal pasti.

## 4. Pengingat dan lintas perangkat

Izin notifikasi hanya diminta setelah Anda menekan tombol aktivasi. Pengingat lokal diperiksa ketika aplikasi dan konteks JavaScript-nya aktif. Tanpa backend/push server, browser tidak dapat menjamin pengingat ketika browser ditutup atau proses dihentikan sistem operasi.

Untuk pengingat lintas perangkat, ekspor file `.ics` dari menu **Reminders**, lalu impor ke Google Calendar, Apple Calendar, atau Outlook. File `.ics` adalah snapshot; ekspor ulang setelah jadwal berubah. Data IndexedDB/LocalStorage tidak otomatis tersinkron antardevais. Gunakan backup JSON untuk memindahkan seluruh data aplikasi.

## 5. Publikasi GitHub Pages — full CLI (Windows PowerShell)

### A. Instal Git dan GitHub CLI

Jalankan PowerShell:

```powershell
winget install --id Git.Git -e
winget install --id GitHub.cli -e
```

Tutup dan buka kembali PowerShell, lalu verifikasi:

```powershell
git --version
gh --version
```

### B. Login ke GitHub dari terminal

```powershell
gh auth login --hostname github.com --git-protocol https --web
gh auth status
```

Ikuti proses autentikasi yang dibuka oleh GitHub CLI.

### C. Masuk ke folder hasil ekstrak ZIP

```powershell
cd "$HOME\Downloads\KKA-Teacher-Schedule"
Test-Path .\index.html
```

Pastikan perintah kedua menghasilkan `True`.

### D. Inisialisasi Git dan buat commit

```powershell
git init -b main
git add .
git status
git commit -m "Initial release: KKA Teacher Schedule PWA"
```

Jika Git belum memiliki identitas commit, atur sekali lalu ulangi commit:

```powershell
git config --global user.name "Nama Anda"
git config --global user.email "email-github-anda@example.com"
git commit -m "Initial release: KKA Teacher Schedule PWA"
```

### E. Buat repository GitHub dan push

Untuk GitHub Free, gunakan repository publik:

```powershell
gh repo create KKA-Teacher-Schedule --public --source . --remote origin --push
```

Bila paket GitHub Anda mendukung GitHub Pages untuk repository privat, Anda dapat mengganti `--public` dengan `--private`. Ingat bahwa situs GitHub Pages yang dipublikasikan tetap dapat diakses publik, meskipun repository sumber privat.

Verifikasi remote dan branch:

```powershell
git remote -v
git status -sb
gh repo view --web
```

### F. Aktifkan GitHub Pages dari CLI

Konfigurasi agar GitHub Pages menerbitkan branch `main` dari folder root (`/`):

```powershell
$repo = gh repo view --json nameWithOwner --jq .nameWithOwner
$pagesConfig = '{"build_type":"legacy","source":{"branch":"main","path":"/"}}'
$pagesConfig | gh api --method POST "repos/$repo/pages" --input -
```

Jika API mengembalikan HTTP `409` karena Pages sudah terkonfigurasi, perbarui konfigurasi dengan:

```powershell
$pagesConfig | gh api --method PUT "repos/$repo/pages" --input -
```

Periksa status dan URL situs:

```powershell
gh api "repos/$repo/pages" --jq '{status: .status, url: .html_url, source: .source}'
```

Gunakan nilai `url`/`html_url` dari respons sebagai alamat resmi situs. Untuk repository bernama `KKA-Teacher-Schedule`, alamat proyek biasanya berbentuk `https://USERNAME.github.io/KKA-Teacher-Schedule/`.

Periksa aktivitas deployment:

```powershell
gh run list --repo $repo --limit 5
```

### G. Push pembaruan berikutnya

Setelah mengedit aplikasi di komputer:

```powershell
git status
git add .
git commit -m "Update KKA Teacher Schedule"
git push origin main
gh run list --repo $repo --limit 5
```

GitHub Pages akan menerbitkan ulang file statis dari branch `main`.

### H. Jika repository GitHub sudah dibuat sebelumnya

Jangan jalankan `gh repo create` lagi. Tambahkan remote repository yang sudah ada:

```powershell
git remote add origin https://github.com/USERNAME/KKA-Teacher-Schedule.git
git push -u origin main
```

Ganti `USERNAME` dengan nama akun/organisasi GitHub. Jika `origin` sudah ada, periksa dengan `git remote -v`; untuk mengganti URL:

```powershell
git remote set-url origin https://github.com/USERNAME/KKA-Teacher-Schedule.git
git push -u origin main
```

## 6. Pemeriksaan privasi sebelum push

- File Excel `.xlsx` / `.xls`, `.ics`, dan file backup JSON aplikasi sudah dicantumkan di `.gitignore`.
- Jangan menyalin workbook, file backup, token, password, API key, atau data siswa ke folder repository.
- Nama guru dan ID awal ada di `js/core/config.js`. Keduanya merupakan bagian dari source code dan dapat dilihat publik jika repository atau situs dibuka untuk umum. Ubah konfigurasi tersebut sebelum push jika tidak ingin identitas itu tampil di source.
- Jadwal yang diimpor disimpan di browser/perangkat dan tidak otomatis diunggah ke GitHub.

## 7. Batasan penting

- Browser/PWA harus dijalankan melalui HTTPS saat dipublikasikan; GitHub Pages menyediakan HTTPS.
- SheetJS Community Edition dimuat dari CDN resmi saat impor Excel. Impor pertama membutuhkan koneksi internet agar library dapat dimuat; Service Worker berusaha menyimpan file library untuk penggunaan berikutnya.
- Service Worker menyediakan cache aplikasi, tetapi bukan server push dan bukan timer yang selalu berjalan di latar belakang.
- Tidak ada sinkronisasi dua arah antara aplikasi dan kalender eksternal.
- Setiap perangkat memiliki penyimpanan lokal sendiri. Pindahkan data dengan backup JSON atau ekspor kalender `.ics`.


## Fitur v1.1.0

- **Verifikasi JP 1:** Setiap Senin, Rabu, dan Jumat, konfirmasi salah satu kondisi: tidak ada kegiatan khusus, Upacara, GSS, Pramuka, atau Literasi. Verifikasi tersimpan per tanggal di perangkat.
- **Catatan perubahan jadwal:** Verifikasi tidak otomatis menggeser/menghapus sesi. Jika sekolah menggunakan jadwal alternatif, cocokkan dengan jadwal alternatif resmi lalu edit jadwal secara manual.
- **Dark/Light:** Saat pertama digunakan, tema mengikuti preferensi sistem/browser. Tombol tema di topbar beralih antara terang dan gelap.
- **Bahasa:** Pilih ID atau EN dari kontrol bahasa di topbar.
- **Collapse sidebar:** Tombol panel di topbar mengecilkan sidebar desktop; pilihan tersimpan di perangkat.
- Riwayat verifikasi JP 1 ikut disertakan dalam backup JSON.


## Pembaruan v1.5.0

- Tema gelap/terang sekarang menormalkan lebih banyak komponen, termasuk kartu statistik, kalender, tabel, modal, toast, form, dan panel import.
- Tema sistem tetap menjadi default; pilihan manual terang/gelap tetap tersimpan pada perangkat.
- Kamus terjemahan ID/EN diperluas untuk pesan dinamis, validasi import, backup, notifikasi, pengaturan, serta label kalender.
- Label hari pada kalender dan ringkasan mingguan mengikuti bahasa antarmuka aktif.
- Cache PWA diperbarui ke v1.5.0.


### Pembaruan v1.5.0 — perbaikan lanjutan

- Lapisan tema diperluas untuk komponen dinamis, termasuk dialog verifikasi JP 1, pilihan radio, panel settings/import, tabel, dropdown, input tanggal/waktu, badge, alert, dan toast.
- Warna browser/status bar mengikuti tema yang aktif sejak halaman mulai dimuat.
- Terjemahan ID/EN diperluas untuk label navigasi desktop/mobile, status koneksi, preferensi tampilan, validasi, dan pesan dinamis.
- Teks nama guru, nama kelas, serta catatan pengguna tidak diterjemahkan otomatis.

## v1.6.0 — Pembesaran skala UI lintas perangkat
Pembaruan ini memperbesar tipografi, jarak antarelemen, navigasi, kartu dashboard, statistik, tombol, kontrol formulir, tabel, kalender, modal, serta notifikasi agar lebih nyaman dibaca dan disentuh. Penyesuaian berlaku untuk desktop, tablet, dan ponsel. Layout tetap responsif dan lapisan `css/ui-scale.css` kompatibel dengan tema terang maupun gelap.
