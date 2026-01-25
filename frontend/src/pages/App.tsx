import Navbar from '@/components/Navbar'
import { SettingsModal } from '@/components/SettingsModal'
import { UsbDevicesModal } from '@/components/UsbDevicesModal'
import '../css/App.css'
import { Panels } from '@/components/Panels'

function App() {

  return (
    <div className='bg-secondary min-h-screen'>
      <Navbar />
      <Panels />
      <SettingsModal />
      <UsbDevicesModal />
    </div>
  )
}

export default App
