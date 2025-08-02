import { supabase } from './supabase'

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...')
  
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('Environment Variables:')
  console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('- SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables!')
    return false
  }
  
  try {
    // Test 1: Simple query
    console.log('\n📊 Test 1: Testing basic connection...')
    const { data: test1, error: error1 } = await supabase
      .from('app_users')
      .select('count')
      .limit(1)
    
    if (error1) {
      console.error('❌ Basic connection failed:', error1.message)
      return false
    }
    console.log('✅ Basic connection successful')
    
    // Test 2: Auth check
    console.log('\n📊 Test 2: Testing auth...')
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Auth status:', user ? '✅ Authenticated' : '⚠️ Not authenticated')
    
    // Test 3: Tables exist
    console.log('\n📊 Test 3: Checking tables...')
    const tables = ['app_users', 'students', 'payments', 'expenses', 'user_sessions']
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}' - Error: ${error.message}`)
      } else {
        console.log(`✅ Table '${table}' - OK`)
      }
    }
    
    console.log('\n✨ Supabase connection test completed!')
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error during connection test:', error)
    return false
  }
}

// Debug helper for queries
export function debugQuery(tableName: string, operation: string, data?: any, error?: any) {
  if (error) {
    console.error(`❌ Query Error [${tableName}.${operation}]:`, {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
  } else {
    console.log(`✅ Query Success [${tableName}.${operation}]:`, {
      rowCount: Array.isArray(data) ? data.length : 1,
      data: data
    })
  }
}