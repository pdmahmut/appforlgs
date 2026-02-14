# Vercel Deployment Talimatları

## 1. Vercel CLI Kurulu Olduğundan Emin Olun

```bash
npm install -g vercel
# veya
npx vercel
```

## 2. Proje Dizinine Girin

```bash
cd c:\Users\mahmut\Desktop\app
```

## 3. İlk Deployment (Interactive Setup)

```bash
vercel
```

Sorular:
- "Set up and deploy": Y (evet)
- Project name: `appforlgs` (veya tercih ettiğiniz ad)
- Framework preset: Other (basit static site)
- Output directory: `.` (root — veya boş bırakın)

## 4. Environment Variables (Vercel Dashboard veya CLI)

**Seçenek A — Vercel CLI ile:**

```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add DATABASE_URL
vercel env add VITE_APP_TITLE
vercel env add VITE_LOGIN_PASSWORD
```

Her bir değişken için istenen değeri girin.

**Seçenek B — Vercel Dashboard üzerinden:**

1. https://vercel.com/dashboard adresine gidin.
2. Projenizi seçin.
3. Settings → Environment Variables.
4. Production, Preview, Development ortamları için `.env.example` dosyasındaki değişkenleri ekleyin.

## 5. `.env.local` Güvenliği

`.env.local` dosyası `.gitignore` içinde olduğundan, repodan yüklenmez. Vercel'de ortam değişkenlerini ayrıca tanımlamanız gerekir.

## 6. Daha Sonraki Deployments

Kodu güncelledikten sonra:

```bash
git add .
git commit -m "Your message"
git push origin main
```

Vercel otomatik olarak algılar ve deploy eder (GitHub entegrasyonu aktifse).

## 7. Local Development

Yerel olarak test etmek için `run_migrate.js` ve HTTP server kullanın:

```bash
# Terminal 1: Database migration (isteğe bağlı)
node run_migrate.js

# Terminal 2: Local server
python -m http.server 8000
# veya
npx http-server . -p 8000
```

Sonra: http://localhost:8000

## Not

- `DATABASE_URL` migration betikleri için gereklidir; frontend'de doğrudan kullanılmaz.
- Supabase `ANON_KEY` frontend'de güvenlidir (public key); gizli anahtarları frontend'de asla kullanmayın.
- Login şifresi şu anda hardcoded (`1234`); production için bunu kaldırmalısınız.
