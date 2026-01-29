import Navbar from '@/components/Navbar'
import { SettingsModal } from '@/components/SettingsModal'
import { UsbDevicesModal } from '@/components/UsbDevicesModal'
import { HM30ConnectionModal } from '@/components/HM30ConnectionModal'
import { HM30DataPanel } from '@/components/HM30DataPanel'
import '../css/App.css'
import { Panels } from '@/components/Panels'

function App() {

  return (
    <div className='bg-secondary min-h-screen'>
      <Navbar />
      <Panels />
      <SettingsModal />
      <UsbDevicesModal />
      <HM30ConnectionModal />
      <HM30DataPanel />
    </div>
  )
}

export default App
