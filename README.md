# Budget Tracker Projesi - Detaylı Analiz Raporu

## 📋 Genel Bakış

Budget Tracker, kullanıcıların gelir-gider takibi yapabileceği, cüzdan yönetimi ve borç takibi yapabileceği full-stack bir web uygulamasıdır. Proje **monorepo** yapısında, **budget-api** (Backend) ve **budget-web** (Frontend) olmak üzere iki ana modülden oluşmaktadır.

---

## 🏗️ Proje Mimarisi

### Backend (budget-api)
- **Framework:** Express.js v5.2.1
- **Veritabanı:** SQLite (Prisma ORM ile)
- **Kimlik Doğrulama:** JWT (JSON Web Token)
- **Port:** 5000 (varsayılan)

### Frontend (budget-web)
- **Framework:** React v19.2.1
- **Routing:** React Router DOM v7.10.1
- **HTTP Client:** Axios v1.13.2
- **Port:** 3000 (varsayılan, Create React App)

---

## 📁 Proje Yapısı

### Backend Yapısı (`budget-api/`)

```
budget-api/
├── src/
│   ├── app.js                    # Express uygulaması ve route tanımları
│   ├── server.js                 # Sunucu başlatma
│   ├── prismaClient.js          # Prisma client (kullanılmıyor - her controller kendi instance'ını oluşturuyor)
│   ├── controllers/              # İş mantığı
│   │   ├── auth.controller.js   # Kayıt/Giriş
│   │   ├── category.controller.js
│   │   ├── debt.controller.js    # Borç yönetimi
│   │   ├── record.controller.js  # Gelir/Gider kayıtları
│   │   ├── summary.controller.js # Aylık özet
│   │   └── wallet.controller.js # Cüzdan yönetimi
│   ├── routes/                   # API endpoint tanımları
│   │   ├── auth.routes.js
│   │   ├── category.routes.js
│   │   ├── debt.routes.js
│   │   ├── record.routes.js
│   │   ├── summary.routes.js
│   │   └── wallet.routes.js
│   ├── middleware/
│   │   └── auth.js               # JWT doğrulama middleware'i
│   └── services/
│       └── debt.service.js       # Borç simülasyon servisi
├── prisma/
│   ├── schema.prisma             # Veritabanı şeması
│   ├── dev.db                    # SQLite veritabanı dosyası
│   └── migrations/               # Veritabanı migration'ları
└── package.json
```

### Frontend Yapısı (`budget-web/`)

```
budget-web/
├── src/
│   ├── App.js                    # Ana routing yapısı
│   ├── index.js                  # React entry point
│   ├── pages/                    # Sayfa bileşenleri
│   │   ├── Dashboard.js          # Ana sayfa (basit)
│   │   ├── Login.js              # Giriş sayfası
│   │   ├── Register.js           # Kayıt sayfası
│   │   ├── Wallets.js            # Cüzdan yönetimi
│   │   ├── Debts.js              # Borç yönetimi
│   │   ├── Records.js            # Kayıtlar (boş)
│   │   └── DebtDetails.js        # Borç detayları
│   ├── components/               # Yeniden kullanılabilir bileşenler
│   │   ├── Navbar.js              # Navigasyon çubuğu
│   │   ├── ProtectedRoute.js    # Route koruma
│   │   ├── WalletCard.js
│   │   ├── DebtCard.js
│   │   └── RecordCard.js
│   ├── context/
│   │   └── AuthContext.js        # Authentication context
│   ├── hooks/
│   │   └── useAuth.js            # Auth hook
│   └── api/                      # API çağrıları
│       ├── axiosInstance.js     # Axios konfigürasyonu
│       ├── auth.js
│       ├── wallet.js
│       └── debt.js
└── package.json
```

---

## 🗄️ Veritabanı Şeması

### Modeller

1. **User**
   - `id` (Int, Primary Key)
   - `email` (String, Unique)
   - `password` (String, hashed)
   - İlişkiler: `records`, `wallets`, `debts`

2. **Category**
   - `id` (Int, Primary Key)
   - `name` (String)
   - İlişkiler: `records`

3. **Record** (Gelir/Gider Kayıtları)
   - `id` (Int, Primary Key)
   - `amount` (Float)
   - `type` (String: "income" | "expense")
   - `note` (String, Optional)
   - `date` (DateTime)
   - `categoryId` (Int, Foreign Key)
   - `userId` (Int, Foreign Key)
   - `walletId` (Int, Optional, Foreign Key)
   - İlişkiler: `category`, `user`, `wallet`

4. **Wallet** (Cüzdan)
   - `id` (Int, Primary Key)
   - `name` (String)
   - `type` (String: "cash" | "bank_account" | "credit_card")
   - `balance` (Decimal, Default: 0)
   - `userId` (Int, Foreign Key)
   - İlişkiler: `user`, `records`, `debts`

5. **Debt** (Borç)
   - `id` (Int, Primary Key)
   - `name` (String)
   - `type` (String: "loan" | "credit_card")
   - `principal` (Decimal) - Başlangıç borcu
   - `interestRate` (Decimal) - Aylık faiz oranı
   - `termMonths` (Int, Optional) - Vade (kredi için)
   - `minPaymentRate` (Decimal, Optional) - Asgari ödeme oranı (kredi kartı için)
   - `currentBalance` (Decimal) - Kalan borç
   - `walletId` (Int, Optional, Foreign Key)
   - `userId` (Int, Foreign Key)
   - `createdAt` (DateTime)
   - İlişkiler: `user`, `wallet`, `payments`

6. **DebtPayment** (Borç Ödemeleri)
   - `id` (Int, Primary Key)
   - `debtId` (Int, Foreign Key)
   - `amount` (Decimal)
   - `paidAt` (DateTime)

---

## 🔌 API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - Kullanıcı kaydı
- `POST /auth/login` - Kullanıcı girişi

### Categories (`/api/categories`)
- `GET /api/categories` - Tüm kategorileri listele
- `POST /api/categories` - Yeni kategori oluştur
- `PUT /api/categories/:id` - Kategori güncelle
- `DELETE /api/categories/:id` - Kategori sil

### Records (`/api/records`)
- `GET /api/records` - Tüm kayıtları listele (query: `year`, `month`)
- `GET /api/records/:id` - Tek kayıt getir
- `POST /api/records` - Yeni kayıt oluştur
- `PUT /api/records/:id` - Kayıt güncelle
- `DELETE /api/records/:id` - Kayıt sil

### Wallets (`/api/wallets`)
- `GET /api/wallets` - Kullanıcının cüzdanlarını listele
- `POST /api/wallets` - Yeni cüzdan oluştur
- `DELETE /api/wallets/:id` - Cüzdan sil

### Debts (`/api/debts`)
- `GET /api/debts` - Kullanıcının borçlarını listele
- `POST /api/debts` - Yeni borç oluştur
- `POST /api/debts/:id/payments` - Borca ödeme ekle
- `POST /api/debts/:id/simulate` - Borç simülasyonu yap
- `DELETE /api/debts/:id` - Borç sil (controller'da tanımlı ama route'da eksik)

### Summary (`/api/summary`)
- `GET /api/summary/monthly` - Aylık özet (query: `year`, `month`)

---

## ⚠️ Tespit Edilen Sorunlar ve İyileştirme Önerileri

### 🔴 Kritik Sorunlar

1. **PrismaClient Instance Yönetimi**
   - **Sorun:** Her controller dosyasında ayrı `PrismaClient` instance'ı oluşturuluyor. Bu performans sorunlarına yol açabilir.
   - **Çözüm:** `prismaClient.js` dosyası var ama kullanılmıyor. Tüm controller'larda singleton pattern kullanılmalı.

2. **Module System Uyumsuzluğu**
   - **Sorun:** `debt.service.js` dosyasında ES6 `export` kullanılmış, ancak `debt.controller.js`'de `require` ile import ediliyor. Bu çalışmayacaktır.
   - **Çözüm:** Ya tüm proje CommonJS (`module.exports`) ya da ES6 modules (`export/import`) kullanmalı.

3. **Eksik Route Tanımı**
   - **Sorun:** `debt.controller.js`'de `deleteDebt` fonksiyonu var ama `debt.routes.js`'de route tanımlı değil.
   - **Çözüm:** Route eklenmeli: `router.delete("/:id", auth, debtController.deleteDebt);`

4. **Güvenlik: JWT Secret**
   - **Sorun:** JWT_SECRET hardcoded fallback değeri var (`"dev_secret"`). Production'da environment variable zorunlu olmalı.
   - **Çözüm:** `.env` dosyası oluşturulmalı ve `.env.example` eklenmeli.

5. **Veritabanı Bağlantı URL'i**
   - **Sorun:** `.env` dosyası yok, `DATABASE_URL` tanımlı değil.
   - **Çözüm:** `.env` dosyası oluşturulmalı.

### 🟡 Orta Öncelikli Sorunlar

6. **Prisma Client Dependency**
   - **Sorun:** `@prisma/client` ve `prisma` `devDependencies`'de. `@prisma/client` production'da gerekli.
   - **Çözüm:** `@prisma/client`'ı `dependencies`'e taşı.

7. **Error Handling**
   - **Sorun:** Bazı controller'larda hata yönetimi tutarsız. Bazı yerlerde detaylı, bazı yerlerde genel hata mesajları.
   - **Çözüm:** Merkezi error handling middleware'i eklenebilir.

8. **Input Validation**
   - **Sorun:** Bazı endpoint'lerde yeterli validasyon yok (ör: email formatı, sayısal değer kontrolü).
   - **Çözüm:** Express-validator veya Joi gibi bir validation kütüphanesi eklenebilir.

9. **CORS Konfigürasyonu**
   - **Sorun:** CORS tüm origin'lere açık. Production'da sadece frontend URL'i izin verilmeli.
   - **Çözüm:** Environment variable ile CORS origin kontrolü.

10. **Password Hashing**
    - **Sorun:** Hem `bcrypt` hem `bcryptjs` yüklü. Sadece biri kullanılmalı.
    - **Çözüm:** Gereksiz dependency kaldırılmalı.

### 🟢 İyileştirme Önerileri

11. **Kod Organizasyonu**
    - `getUserId` helper fonksiyonu her controller'da tekrar ediliyor. Ortak bir utility dosyasına taşınabilir.

12. **API Response Standardizasyonu**
    - API response'ları standart bir format'ta olmalı (ör: `{ success: boolean, data: any, error?: string }`).

13. **Frontend State Management**
    - React Context kullanılıyor ama sadece auth için. Daha kompleks state yönetimi için Redux veya Zustand düşünülebilir.

14. **Loading States**
    - Frontend'de bazı sayfalarda loading state yok veya tutarsız.

15. **Error Messages**
    - Frontend'de hata mesajları kullanıcı dostu değil, teknik mesajlar gösteriliyor.

16. **Dashboard Sayfası**
    - Dashboard sayfası çok basit, özet bilgiler gösterilmiyor.

17. **Records Sayfası**
    - `Records.js` dosyası boş. Gelir/gider kayıtlarını görüntüleme ve yönetme özelliği eksik.

18. **Wallet Balance Güncelleme**
    - Record oluşturulduğunda wallet balance'ı otomatik güncellenmiyor.

19. **Migration History**
    - İki migration var: `init` ve `add_wallet_and_debt_models`. Schema'da bazı tutarsızlıklar olabilir (ör: `walletId` field'ı Record'ta migration'da yok gibi görünüyor).

20. **Testing**
    - Test dosyası yok. Unit test ve integration test eklenebilir.

21. **Documentation**
    - API dokümantasyonu yok. Swagger/OpenAPI eklenebilir.

22. **Environment Variables**
    - `.env.example` dosyası oluşturulmalı.

23. **Scripts**
    - `package.json`'da sadece test script'i var. `start`, `dev` gibi script'ler eklenmeli.

24. **TypeScript**
    - Proje JavaScript ile yazılmış. Type safety için TypeScript'e geçiş düşünülebilir.

---

## ✅ Güçlü Yönler

1. **İyi Organize Edilmiş Yapı**
   - MVC benzeri bir yapı kullanılmış (controllers, routes, services ayrımı).

2. **Authentication Sistemi**
   - JWT tabanlı authentication düzgün implement edilmiş.

3. **Prisma ORM Kullanımı**
   - Modern bir ORM kullanılmış, type-safe database işlemleri.

4. **React Router Koruması**
   - Protected routes düzgün implement edilmiş.

5. **Axios Interceptors**
   - Token'ın otomatik header'a eklenmesi güzel bir yaklaşım.

6. **Borç Simülasyonu**
   - Kredi ve kredi kartı için simülasyon özelliği var.

---

## 📊 Teknoloji Stack Özeti

### Backend
- Node.js
- Express.js 5.2.1
- Prisma 6.19.0
- SQLite
- JWT (jsonwebtoken 9.0.3)
- bcryptjs 3.0.3
- CORS 2.8.5
- dotenv 17.2.3

### Frontend
- React 19.2.1
- React Router DOM 7.10.1
- Axios 1.13.2
- React Scripts 5.0.1

---

## 🚀 Çalıştırma Adımları

### Backend
```bash
cd budget-api
npm install
# .env dosyası oluştur: DATABASE_URL="file:./prisma/dev.db" ve JWT_SECRET="your_secret"
npx prisma generate
npx prisma migrate dev
node src/server.js
```

### Frontend
```bash
cd budget-web
npm install
npm start
```

---

## 📝 Sonuç

Proje genel olarak iyi organize edilmiş ve temel özellikleri içeriyor. Ancak production'a hazır olması için yukarıda belirtilen kritik sorunların çözülmesi gerekiyor. Özellikle PrismaClient instance yönetimi, module system uyumsuzluğu ve eksik route tanımları acil olarak düzeltilmelidir.

**Proje Durumu:** ⚠️ Geliştirme Aşamasında - Production'a hazır değil

**Öncelikli Aksiyonlar:**
1. PrismaClient singleton pattern'e geçir
2. debt.service.js module system'ini düzelt
3. deleteDebt route'unu ekle
4. .env dosyası ve environment variable yönetimi
5. Prisma client'ı dependencies'e taşı

---

*Rapor Tarihi: 2025-01-XX*
*Analiz Eden: AI Assistant*

