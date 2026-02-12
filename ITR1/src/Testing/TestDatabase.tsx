import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function TestDatabase() {
  const [status, setStatus] = useState<string>('Testing connection...')
  const [data, setData] = useState<any>(null)

  console.log('TestDatabase component rendered')
  console.log('Current status:', status)
  console.log('Current data:', data)

  useEffect(() => {
    async function testConnection() {
      console.log('Starting connection test...')
      try {
        const { data, error } = await supabase
          .from('Test')
          .select('*')
          .limit(5)

        console.log('Response:', { data, error })

        if (error) {
          setStatus('Error: ' + error.message)
          console.error('Supabase error:', error)
        } else {
          setStatus('Connected successfully!')
          setData(data)
          console.log('Success! Data:', data)
        }
      } catch (err) {
        setStatus('Error: ' + (err as Error).message)
        console.error('Catch error:', err)
      }
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      <h2>Database Connection Test</h2>
      <p>{status}</p>
      {data && (
        <div>
          <h3>Data from database:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default TestDatabase