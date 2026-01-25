import { useAtom } from 'jotai';
import { settingsModalOpenAtom } from '@/lib/settings/settingsAtoms';
import { usbDevicesModalOpenAtom } from '@/lib/usb/usbModalAtom';
import { RosConnectionButton } from './RosConnectionButton';
import { Settings, Usb } from 'lucide-react';

function Navbar() {
  const [, setSettingsOpen] = useAtom(settingsModalOpenAtom);
  const [, setUsbDevicesOpen] = useAtom(usbDevicesModalOpenAtom);

  return (
    <nav className="px-4 py-3 shadow bg-white flex items-center justify-between">
      <h1 className="text-xl font-semibold font-mono">Altair Mission Control</h1>

      <div className="flex items-center gap-2">
        <RosConnectionButton />

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