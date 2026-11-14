BOY STUDIO ANIMATION SPOOFER - PAKET REPOSITORY
================================================

ISI REPOSITORY
- index.html   : tampilan dan fungsi website.
- server.js    : backend Node.js untuk endpoint /api/animation.
- package.json : perintah menjalankan backend.
- README-ID.txt: petunjuk ini.

CARA UNGGAH DARI APLIKASI GITHUB DI HP
1. Buka repository BOY-STUDIO-ANIMATION-SPOOFER.
2. Buat backup atau pastikan file lama masih bisa dipulihkan.
3. Unggah ke folder utama/root repository (bukan ke dalam folder baru):
   index.html, server.js, package.json, README-ID.txt.
4. Jika GitHub menanyakan apakah index.html akan diganti, pastikan itu
   memang repository yang benar dan backup sudah tersedia.
5. Commit perubahan.

PENTING TENTANG WEBSITE PUBLIK DAN BACKEND
- GitHub menyimpan kode. GitHub Pages hanya menyajikan file statis dan
  TIDAK menjalankan server.js.
- Agar pembacaan ID melalui /api/animation bekerja, deploy repository ini
  sebagai aplikasi Node.js pada layanan hosting yang mendukung Node.js.
- Pada hosting Node.js, gunakan perintah build: (kosongkan/tidak perlu)
  dan start command: npm start.
- Hosting akan memberikan URL backend. Jika website dipasang di host
  yang sama dengan backend, endpoint default /api/animation otomatis
  menggunakan alamat host yang sama.
- Jika website dan backend berada di host berbeda, isi kolom Proxy URL
  pada website dengan URL backend lengkap sampai parameter id=.
  Contoh format: https://ALAMAT-BACKEND/api/animation?id=
  Ganti ALAMAT-BACKEND dengan alamat asli dari layanan hosting Anda.

BATASAN AKSES ANIMASI
- Backend hanya mencoba mengambil aset yang dapat diakses melalui layanan
  resmi Roblox Asset Delivery.
- Animation ID saja tidak berisi data keyframe dan tidak memberikan izin.
- Aset privat/tidak tersedia, atau respons binary yang tidak didukung,
  tidak dapat dibaca oleh parser ini. Tidak ada bypass izin/private asset.
- File RBXMX yang dihasilkan dapat dibuka di Roblox Studio; setelah itu
  gunakan Save to File bila membutuhkan format RBXM.

PENYIMPANAN AKUN
- Akun dan panel admin pada versi ini disimpan di localStorage browser.
- Akun tidak tersinkron antarperangkat/browser dan bukan sistem akun server.
- Hapus data situs/browser dapat menghapus akun lokal. Gunakan fitur backup.

PERSYARATAN
- Node.js 18 atau lebih baru untuk menjalankan backend.
- File website dan backend harus berada pada direktori aplikasi yang sama.
