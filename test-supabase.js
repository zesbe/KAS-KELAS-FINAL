const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Check if environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Environment variables not set!')
  console.error('Please create .env.local file with:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your-supabase-url')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
  console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')

  try {
    // Test 1: Check app_users table
    console.log('📊 Test 1: Checking app_users table...')
    const { data: users, error: usersError } = await supabase
      .from('app_users')
      .select('id, username, email, role')
      .limit(3)
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
    } else {
      console.log('✅ Users found:', users.length)
      console.table(users)
    }

    // Test 2: Check students table
    console.log('\n📊 Test 2: Checking students table...')
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, nama, nomor_absen')
      .limit(3)
    
    if (studentsError) {
      console.error('❌ Error fetching students:', studentsError.message)
    } else {
      console.log('✅ Students found:', students?.length || 0)
      if (students?.length > 0) console.table(students)
    }

    // Test 3: Check transactions table
    console.log('\n📊 Test 3: Checking transactions table...')
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('id, type, amount, status')
      .limit(3)
    
    if (transError) {
      console.error('❌ Error fetching transactions:', transError.message)
    } else {
      console.log('✅ Transactions found:', transactions?.length || 0)
      if (transactions?.length > 0) console.table(transactions)
    }

    // Test 4: Check expense_categories table
    console.log('\n📊 Test 4: Checking expense_categories table...')
    const { data: categories, error: catError } = await supabase
      .from('expense_categories')
      .select('id, name, color')
      .limit(5)
    
    if (catError) {
      console.error('❌ Error fetching categories:', catError.message)
    } else {
      console.log('✅ Categories found:', categories?.length || 0)
      if (categories?.length > 0) console.table(categories)
    }

    console.log('\n✨ Connection test completed!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testConnection()