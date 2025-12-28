import { createClient } from '@/lib/supabase/server'

export default async function TestSupabase() {
  const supabase = await createClient()
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
  
  if (error) {
    return <div>Error: {error.message}</div>
  }
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Prueba de Supabase</h1>
      <h2>Categorías:</h2>
      <pre>{JSON.stringify(categories, null, 2)}</pre>
    </div>
  )
}