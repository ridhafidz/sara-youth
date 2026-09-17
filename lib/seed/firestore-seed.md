# Firestore Seed Guide — SARA

Panduan setup collections dan dokumen contoh untuk SARA.
Tidak perlu script khusus — paste JSON langsung di Firebase Console.

---

## 1. Buat Collections

Di [Firebase Console](https://console.firebase.google.com) → Firestore Database → **Start collection**:

### `schedules`

**Dokumen 1** — Upcoming meeting

```json
{
  "title": "Impact Review Meeting",
  "description": "Q3 SDG impact score review with program leads",
  "date": "2026-09-18T09:00:00Z",
  "month": "Sep",
  "year": 2026,
  "is_upcoming": true
}
```

**Dokumen 2** — Past review

```json
{
  "title": "SDG Progress Review",
  "description": "Annual SDG alignment assessment",
  "date": "2024-08-24T09:00:00Z",
  "month": "Aug",
  "year": 2024,
  "is_upcoming": false
}
```

---

### `activities`

> Field `created_at` gunakan type **Timestamp** di Console, atau paste ISO string.

**Dokumen 1**
```json
{
  "title": "SDG 4 Impact Report Submitted",
  "status": "active",
  "icon": "FileCheck",
  "created_at": "2026-09-14T08:00:00Z"
}
```

**Dokumen 2**
```json
{
  "title": "SDG 13 Mapping Panel Updated",
  "status": "pending",
  "icon": "Map",
  "created_at": "2026-09-14T06:00:00Z"
}
```

**Dokumen 3**
```json
{
  "title": "Impact Score Recalculated",
  "status": "done",
  "icon": "BarChart2",
  "created_at": "2026-09-13T10:00:00Z"
}
```

**Dokumen 4**
```json
{
  "title": "New Program: Clean Energy Drive",
  "status": "pending",
  "icon": "Zap",
  "created_at": "2026-09-12T14:00:00Z"
}
```

> **Icon values yang valid:** `FileCheck`, `Map`, `BarChart2`, `Zap`

---

### `notifications`

**Dokumen 1**
```json
{
  "message": "SDG 4 Impact Report Successfully Submitted",
  "is_read": false,
  "created_at": "2026-09-14T08:00:00Z"
}
```

---

## 2. Firestore Security Rules (Development)

Sementara untuk development, gunakan rules terbuka:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ **Ganti** dengan rules berbasis Auth sebelum deploy production.

---

## 3. Verifikasi Real-time

1. Buka dashboard SARA di browser
2. Edit field `message` di dokumen `notifications` di Console
3. Perubahan akan muncul **langsung** di UI tanpa refresh

---

## 4. Field `icon` — Nilai yang Didukung

| Value | Lucide Icon |
|---|---|
| `FileCheck` | ✅ |
| `Map` | 🗺️ |
| `BarChart2` | 📊 |
| `Zap` | ⚡ |

Tambah icon baru di `components/dashboard/ActivitiesList.tsx` → `ICON_MAP`.
