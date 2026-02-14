# Öğrenci Takip Sistemi (app)

Küçük bir frontend uygulaması — React (Babel UMD), Tailwind ve basit SDK'larla yerel olarak çalışır.

Önemli: `supabase.txt` dosyası DB bağlantı bilgisi içeriyordu; bu dosya repodan kaldırıldı. Eğer bu credential hâlâ geçerliyse, lütfen Supabase projenizde parola/credentials değiştirin.

Hızlı başlangıç

1. Depoyu klonlayın:

```bash
git clone https://github.com/pdmahmut/appforlgs.git
cd appforlgs
```

2. (İsteğe bağlı) Node/dep yükleyin (migrasyon scripti için):

```bash
npm install
```

3. Yerel olarak servis et (basit):

- Python:

```bash
python -m http.server 8000
# sonra tarayıcıda http://localhost:8000 açın
```

- veya Node (http-server):

```bash
npx http-server . -p 8000
```

4. Supabase entegrasyonu

- Veritabanı migrasyonu için `supabase.txt` içinde PostgreSQL bağlantı URL'si beklenir. Bu dosyayı repoda tutmuyoruz — yerel olarak `supabase.txt` oluşturun veya `DATABASE_URL` ortam değişkeni olarak sağlayın.
- Migrasyon çalıştırmak için:

```bash
node run_migrate.js
```

Güvenlik

- `supabase.txt` veya diğer gizli bilgileri asla herkese açık repoya koymayın. Eğer gizli bilgiler yanlışlıkla pushlandıysa, anahtarları/şifreleri değiştirin.

