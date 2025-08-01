/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pakasir.zone.id', 'supabase.co'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PAKASIR_API_KEY: process.env.PAKASIR_API_KEY,
    PAKASIR_SLUG: process.env.PAKASIR_SLUG,
    WAPANELS_APPKEY: process.env.WAPANELS_APPKEY,
    WAPANELS_AUTHKEY: process.env.WAPANELS_AUTHKEY,
  }
}

module.exports = nextConfig