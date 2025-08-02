# Setup Supabase untuk Kas Kelas

## Langkah-langkah Setup

### 1. Persiapan Supabase Project
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Buat project baru atau gunakan yang sudah ada
3. Catat informasi berikut dari Settings > API:
   - Project URL
   - Anon Key
   - Service Role Key

### 2. Setup Database di Supabase
1. Buka SQL Editor di Supabase Dashboard
2. Jalankan script SQL yang sudah ada secara berurutan:
   - `database-setup.sql`
   - `users-table.sql`
   - `expense-categories.sql`
   - `sample-data.sql`
   - `update-expenses-data.sql`

### 3. Konfigurasi Environment Variables
Buat file `.env.local` dengan isi:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URL (dari Supabase Settings > Database)
DATABASE_URL=your-database-url
```

### 4. Update lib/supabase.ts
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Menjalankan Aplikasi

1. Install dependencies:
   ```bash
   npm install
   ```

2. Jalankan development server:
   ```bash
   npm run dev
   ```

3. Buka http://localhost:3000

## Tips Debugging

### Melihat Log di Supabase
1. Buka Supabase Dashboard
2. Pergi ke Logs > API Logs untuk melihat request
3. Pergi ke Logs > Postgres Logs untuk melihat query database

### Test Koneksi Database
Buat file `test-connection.js`:
```javascript
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testConnection() {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Connection successful! Data:', data)
  }
}

testConnection()
```

Jalankan dengan: `node test-connection.js`

## Troubleshooting

### Error: relation "app_users" does not exist
- Pastikan sudah menjalankan semua script SQL di Supabase SQL Editor

### Error: Invalid API key
- Periksa kembali API keys di Supabase Dashboard
- Pastikan menggunakan key yang benar (anon key vs service role key)

### Error: CORS
- Tambahkan domain localhost:3000 di Supabase Authentication > URL Configuration