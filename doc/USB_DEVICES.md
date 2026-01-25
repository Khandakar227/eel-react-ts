# USB Device Detection - Backend Setup

## Installation

Install the required Python dependencies for USB device detection:

```bash
cd backend
pip install -r requirements.txt
```

### Platform-Specific Notes

**Windows:**
- The backend will automatically use Windows Management Instrumentation (WMI) as a fallback
- `pyusb` requires libusb drivers for full functionality
- For better results, install [Zadig](https://zadig.akeo.ie/) to set up libusb drivers for your USB devices

**Linux:**
- `pyusb` requires libusb-1.0
- Install with: `sudo apt-get install libusb-1.0-0`
- Most devices work out of the box via `/sys/bus/usb/devices`

**macOS:**
- `pyusb` requires libusb
- Install with: `brew install libusb`
- Falls back to `system_profiler` command

## Backend API

The backend exposes two Eel functions:

### `get_connected_usb_devices()`
Returns detailed information about all connected USB devices.

**Response:**
```python
{
    'success': True,
    'devices': [
        {
            'vendor_id': '0x1234',
            'product_id': '0x5678',
            'manufacturer': 'Device Manufacturer',
            'product': 'Device Name',
            'serial': 'ABC123',
            'bus': 1,
            'address': 5
        },
        ...
    ],
    'count': 2
}
```

### `get_usb_count()`
Returns only the count of connected USB devices.

**Response:**
```python
{
    'success': True,
    'count': 2
}
```

## Frontend Integration

The frontend component (`UsbDevicesPanel`) automatically calls the backend every 10 seconds to refresh the device list.

### Usage in Components

```typescript
import { useAtom } from 'jotai';
import { usbDevicesAtom, usbDeviceCountAtom } from '@/lib/usb/usbAtoms';

function MyComponent() {
  const [devices] = useAtom(usbDevicesAtom);
  const [count] = useAtom(usbDeviceCountAtom);
  
  return <div>USB Devices: {count}</div>;
}
```

## Troubleshooting

If USB devices are not detected:

1. **Check permissions** (Linux): User may need to be in the `plugdev` group
2. **Install libusb drivers** (Windows): Use Zadig to install WinUSB drivers
3. **Check console output**: The backend logs errors to the console
4. **Test with lsusb**: Verify devices are visible at OS level
   - Linux/macOS: `lsusb`
   - Windows: Device Manager

## Files

**Backend:**
- `backend/usb_devices.py` - USB detection module
- `backend/main.py` - Eel integration
- `backend/requirements.txt` - Python dependencies

**Frontend:**
- `frontend/src/lib/usb/usbAtoms.ts` - State management
- `frontend/src/components/UsbDevicesPanel.tsx` - UI component
