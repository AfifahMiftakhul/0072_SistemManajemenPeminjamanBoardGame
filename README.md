 BoardGameKu

 Sistem Manajemen Peminjaman Board Game

Afifah Miftakhul — 20240140072

 Deskripsi Proyek

BoardGameKu merupakan aplikasi yang dikembangkan untuk membantu Admin dalam mengelola peminjaman board game. Aplikasi ini menyediakan pengelolaan data board game, data peminjam, transaksi peminjaman, serta proses pengembalian dan pembaruan stok secara terintegrasi.

 Teknologi yang Digunakan

- Backend: Node.js dan Express.js
- Database: PostgreSQL (Supabase)
- ORM: Sequelize
- Authentication: JWT Access Token dan Refresh Token
- Password Security: bcryptjs
- API: REST API

 Progress Pengembangan

 Pertemuan 10 — Inisialisasi Backend dan Model Database

- Melakukan inisialisasi proyek backend BoardGameKu menggunakan Node.js dan Express.js.
- Mengatur dependensi dan konfigurasi server.
- Menghubungkan backend dengan database PostgreSQL melalui Supabase.
- Menyiapkan model Admin, BoardGame, Peminjam, Peminjaman, dan RefreshToken menggunakan Sequelize.
- Mengatur relasi antar-model database.

 Pertemuan 11 — Implementasi Controller, Middleware, dan Routes

- Mengimplementasikan controller untuk proses registrasi, login, refresh token, dan logout Admin.
- Mengimplementasikan controller untuk pengelolaan data Board Game, meliputi tambah, tampil, ubah, hapus, dan pencarian.
- Mengimplementasikan controller untuk pengelolaan data Peminjam, meliputi tambah, tampil, dan hapus.
- Mengimplementasikan controller untuk transaksi Peminjaman dan proses pengembalian board game.
- Membuat middleware untuk memverifikasi Access Token dalam melindungi endpoint API.
- Menyiapkan routes untuk authentication, Board Game, Peminjam, dan Peminjaman.
- Mengintegrasikan seluruh routes dan middleware ke dalam server Express.js.
- Menambahkan skrip untuk sinkronisasi model database menggunakan Sequelize.
