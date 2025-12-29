const bcrypt = require('bcryptjs')

async function test() {
  const password = 'admin123'
  const hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
  
  console.log('Password:', password)
  console.log('Hash:', hash)
  console.log('Testing...')
  
  const isValid = await bcrypt.compare(password, hash)
  
  console.log('Result:', isValid ? '✅ MATCH' : '❌ NO MATCH')
  
  // Generar nuevo hash
  console.log('\nGenerating new hash...')
  const newHash = await bcrypt.hash(password, 10)
  console.log('New hash:', newHash)
  
  const testNew = await bcrypt.compare(password, newHash)
  console.log('New hash valid:', testNew ? '✅ MATCH' : '❌ NO MATCH')
}

test()