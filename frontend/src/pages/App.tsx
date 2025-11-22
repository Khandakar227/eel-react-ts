import Navbar from '@/components/Navbar'
import '../css/App.css'
import { Panels } from '@/components/Panels'

function App() {

  return (
    <div className='bg-secondary min-h-screen'>
      <Navbar />
      <Panels />
    </div>
  )
}

export default App
