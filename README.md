# Posyandu Lansia Mobile App 🏥👴👵

**Aplikasi Mobile untuk Posyandu Lansia** - Sistem informasi kesehatan berbasis mobile untuk melayani pemeriksaan kesehatan rutin lansia dengan teknologi QR Code.

## 📋 Deskripsi Proyek

Posyandu Lansia adalah aplikasi mobile yang dirancang khusus untuk membantu petugas kesehatan di Posyandu dalam melakukan pendaftaran, pemeriksaan kesehatan, dan pencatatan riwayat medis lansia. Aplikasi ini menggunakan teknologi QR Code untuk identifikasi pasien yang cepat dan akurat, serta menyediakan fitur-fitur lengkap untuk manajemen kesehatan lansia.

### 🎯 Target Pengguna
- **Petugas Kesehatan Posyandu** - Pengguna utama yang melakukan pemeriksaan dan pencatatan
- **Administrator Sistem** - Mengelola data dan keamanan sistem
- **Lansia** - Sebagai pasien yang dilayani

## ✨ Fitur Utama

### 🆔 Pendaftaran & Identifikasi
- **Pendaftaran Lansia Baru** - Form lengkap dengan validasi data
- **Generate QR Code Unik** - Setiap lansia mendapat QR Code untuk identifikasi cepat
- **Scan QR Code** - Akses profil dan riwayat kesehatan dengan scan
- **Upload Foto Profil** - Dokumentasi visual pasien

### 🩺 Pemeriksaan Kesehatan
- **Pemeriksaan Fisik Awal**
  - Tinggi badan (100-200 cm)
  - Berat badan (30-150 kg)
  - Tekanan darah sistolik & diastolik
  - Kalkulasi BMI otomatis
- **Pemeriksaan Lanjutan**
  - Kadar asam urat (2.0-15.0 mg/dL)
  - Kadar gula darah (50-500 mg/dL)
  - Kadar kolesterol (100-400 mg/dL)
- **Grafik Tren Kesehatan** - Visualisasi data 3-5 pemeriksaan terakhir
- **Notifikasi Peringatan** - Alert untuk nilai di luar batas normal

### 💊 Pengobatan & Rujukan
- **Resep Digital** - Buat dan kelola resep obat
- **Surat Rujukan** - Generate PDF rujukan ke Puskesmas/klinik
- **Export PDF** - Cetak atau share dokumen medis
- **Riwayat Tindakan** - Pencatatan lengkap semua tindakan

### 📊 Manajemen Data
- **Enkripsi Data** - Keamanan data sensitif pasien
- **Offline Mode** - Sinkronisasi otomatis saat online
- **Activity Logging** - Pencatatan semua aktivitas sistem
- **Backup & Restore** - Perlindungan data

## 🛠 Teknologi yang Digunakan

### Frontend (Mobile App)
- **React Native** `0.79.5` - Framework utama
- **Expo** `~53.0.20` - Development platform
- **Expo Router** `~5.1.4` - File-based routing
- **TypeScript** `~5.8.3` - Type safety

### UI/UX Components
- **React Native Reanimated** `~3.17.4` - Animasi smooth
- **React Native Gesture Handler** `~2.24.0` - Gesture handling
- **Expo Haptics** `~14.1.4` - Haptic feedback
- **React Native Safe Area Context** `5.4.0` - Safe area handling

### Camera & QR Code
- **Expo Camera** `~16.1.11` - Akses kamera device
- **React Native QRCode SVG** `^6.3.0` - Generate QR Code
- **QRCode** `^1.5.4` - QR Code utilities

### Data Visualization
- **React Native Gifted Charts** `^1.4.12` - Grafik tren kesehatan
- **React Native SVG** `15.11.2` - Vector graphics

### Storage & Security
- **React Native MMKV** `^2.12.2` - High-performance storage
- **Async Storage** `^2.2.0` - Persistent storage
- **Crypto-js** `^4.2.0` - Data encryption

### Forms & Validation
- **React Hook Form** `^7.62.0` - Form management
- **Hookform Resolvers** `^3.10.0` - Form validation
- **Zod** `^3.25.76` - Schema validation

### PDF & Document
- **React Native HTML to PDF** `^0.12.0` - Generate PDF
- **React Native PDF** `^6.7.7` - PDF viewer
- **Expo Print** `~14.1.4` - Print functionality
- **Expo Sharing** `^13.1.5` - Share documents

### Network & Connectivity
- **NetInfo** `^11.4.1` - Network status monitoring
- **React Native WebView** `13.13.5` - Web content display

## 🚀 Instalasi dan Setup

### Prasyarat
- Node.js (versi 18 atau lebih baru)
- npm atau yarn
- Expo CLI
- Android Studio (untuk Android development)
- Xcode (untuk iOS development - Mac only)

### 1. Clone Repository
```bash
git clone <repository-url>
cd lansia-mobile/client
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
Pastikan file konfigurasi sudah sesuai dengan environment Anda.

### 4. Start Development Server
```bash
# Start Expo development server
npm start

# Atau langsung ke platform tertentu
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run web        # Web browser
```

## 📱 Cara Menjalankan Aplikasi

### Development Mode
1. **Expo Go** (Recommended untuk testing)
   - Install Expo Go dari Play Store/App Store
   - Scan QR code dari terminal
   
2. **Android Emulator**
   - Buka Android Studio
   - Start AVD (Android Virtual Device)
   - Tekan 'a' di terminal Expo
   
3. **iOS Simulator** (Mac only)
   - Buka Xcode
   - Tekan 'i' di terminal Expo

### Production Build
```bash
# Build untuk Android
expo build:android

# Build untuk iOS
expo build:ios
```

## 🏗 Struktur Proyek

```
client/
├── app/                          # File-based routing (Expo Router)
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Home screen
│   │   └── explore.tsx          # Explore screen
│   ├── _layout.tsx              # Root layout
│   ├── login.tsx                # Login screen
│   ├── patient-registration.tsx  # Pendaftaran lansia
│   ├── qr-scanner.tsx           # Scan QR Code
│   ├── patient-profile.tsx      # Profil lansia
│   ├── physical-exam.tsx        # Pemeriksaan fisik
│   ├── advanced-exam.tsx        # Pemeriksaan lanjutan
│   ├── treatment.tsx            # Pengobatan & rujukan
│   └── +not-found.tsx          # 404 page
├── components/                   # Reusable components
│   ├── ui/                      # UI components
│   ├── AuthGuard.tsx           # Authentication guard
│   └── ...
├── constants/                    # App constants
├── contexts/                     # React contexts
│   └── AuthContext.tsx         # Authentication context
├── hooks/                        # Custom hooks
├── services/                     # API services
│   ├── api.ts                  # API client
│   ├── syncService.ts          # Offline sync
│   └── activityLogger.ts       # Activity logging
├── types/                        # TypeScript types
├── utils/                        # Utility functions
│   ├── encryption.ts           # Data encryption
│   ├── storage.ts              # Storage utilities
│   └── accessibility.ts       # Accessibility helpers
└── assets/                       # Static assets
    ├── images/
    └── fonts/
```

## 🔧 Konfigurasi

### App Configuration (`app.json`)
```json
{
  "expo": {
    "name": "Posyandu Lansia",
    "slug": "posyandu-lansia",
    "version": "1.0.0",
    "description": "Aplikasi Mobile untuk Posyandu Lansia"
  }
}
```

### Permissions
- **Camera** - Untuk scan QR Code dan foto profil
- **Storage** - Untuk menyimpan data dan dokumen
- **Internet** - Untuk sinkronisasi data
- **Vibration** - Untuk haptic feedback

## 📊 Fitur Keamanan

### Data Protection
- **Enkripsi AES-256** untuk data sensitif
- **Secure Storage** menggunakan MMKV
- **Authentication** dengan JWT tokens
- **Activity Logging** untuk audit trail

### Privacy Compliance
- Data pasien dienkripsi sebelum disimpan
- Akses terbatas berdasarkan role pengguna
- Log aktivitas untuk transparansi
- Backup data dengan enkripsi

## 🎨 UI/UX Guidelines

### Accessibility
- **Font size** yang dapat disesuaikan untuk lansia
- **High contrast** untuk visibilitas yang baik
- **Haptic feedback** untuk konfirmasi aksi
- **Voice over** support untuk screen reader

### Responsive Design
- Mendukung berbagai ukuran layar Android
- Orientasi portrait yang konsisten
- Touch target minimal 44px untuk kemudahan akses
- Loading indicators yang informatif

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Testing Strategy
- **Unit Tests** - Components dan utilities
- **Integration Tests** - API services
- **E2E Tests** - User workflows
- **Accessibility Tests** - WCAG compliance

## 📈 Performance

### Optimization
- **Code splitting** dengan Expo Router
- **Image optimization** dengan Expo Image
- **Lazy loading** untuk komponen besar
- **Offline caching** untuk data penting

### Monitoring
- **Performance metrics** tracking
- **Error reporting** dengan crash analytics
- **User analytics** untuk improvement insights

## 🔄 Offline Support

### Sync Strategy
- **Queue system** untuk operasi offline
- **Automatic sync** saat koneksi tersedia
- **Conflict resolution** untuk data consistency
- **Local storage** dengan MMKV

## 📚 API Integration

### Endpoints
- `POST /auth/login` - User authentication
- `GET /patients` - List patients
- `POST /patients` - Register new patient
- `GET /patients/:id` - Patient profile
- `POST /health-records` - Create health record
- `GET /health-records/:patientId` - Patient health history
- `POST /prescriptions` - Create prescription
- `POST /referrals` - Create referral

## 🚀 Deployment

### Build Process
```bash
# Development build
expo build:android --type apk

# Production build
expo build:android --type app-bundle
```

### Distribution
- **Internal testing** via Expo Go
- **Beta testing** dengan APK distribution
- **Production** via Google Play Store

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Make changes dengan testing
4. Submit pull request
5. Code review process

### Code Standards
- **TypeScript** untuk type safety
- **ESLint** untuk code quality
- **Prettier** untuk code formatting
- **Conventional commits** untuk commit messages

## 📞 Support & Documentation

### Resources
- [Expo Documentation](https://docs.expo.dev/) - Platform documentation
- [React Native Guide](https://reactnative.dev/docs/getting-started) - Framework guide
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type system guide

### Troubleshooting
- **Clear cache**: `expo start -c`
- **Reset project**: `npm run reset-project`
- **Reinstall dependencies**: `rm -rf node_modules && npm install`

## 📄 License

Proyek ini dikembangkan untuk keperluan Posyandu Lansia dengan fokus pada pelayanan kesehatan masyarakat.

---

**Dikembangkan dengan ❤️ untuk kesehatan lansia Indonesia**
