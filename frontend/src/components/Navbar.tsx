import { useAtom } from 'jotai';
import { settingsModalOpenAtom } from '@/lib/settings/settingsAtoms';
import { usbDevicesModalOpenAtom } from '@/lib/usb/usbModalAtom';
import { hm30ModalOpenAtom, hm30DataPanelOpenAtom } from '@/lib/hm30/hm30ModalAtom';
import { hm30ConnectionStatusAtom } from '@/lib/hm30/hm30Atoms';
import { RosConnectionButton } from './RosConnectionButton';
import { Settings, Usb, Radio } from 'lucide-react';

function Navbar() {
  const [, setSettingsOpen] = useAtom(settingsModalOpenAtom);
  const [, setUsbDevicesOpen] = useAtom(usbDevicesModalOpenAtom);
  const [, setHM30ModalOpen] = useAtom(hm30ModalOpenAtom);
  const [, setHM30DataPanelOpen] = useAtom(hm30DataPanelOpenAtom);
  const [hm30Status] = useAtom(hm30ConnectionStatusAtom);

  const handleHM30Click = () => {
    if (hm30Status.connected) {
      setHM30DataPanelOpen(true);
    } else {
      setHM30ModalOpen(true);
    }
  };

  return (
    <nav className="px-4 py-3 shadow bg-white flex items-center justify-between">
      <h1 className="text-xl font-semibold font-mono">Altair Mission Control</h1>

      <div className="flex items-center gap-2">
        <RosConnectionButton />

        <button
          onClick={handleHM30Click}
          className={`p-2 hover:bg-gray-100 rounded-md transition-colors relative ${hm30Status.connected ? 'bg-green-50' : ''
            }`}
          title={hm30Status.connected ? "HM30 Data Panel" : "HM30 UDP Connection"}
        >
          <Radio className={`w-5 h-5 ${hm30Status.connected ? 'text-green-600' : 'text-gray-700'
            }`} />
          {hm30Status.connected && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => setUsbDevicesOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Serial Devices"
        >
          <Usb className="w-5 h-5 text-gray-700" />
        </button>

        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;