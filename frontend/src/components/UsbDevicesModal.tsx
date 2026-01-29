import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { usbDevicesModalOpenAtom } from '@/lib/usb/usbModalAtom';
import { usbDevicesAtom, usbDeviceCountAtom } from '@/lib/usb/usbAtoms';
import { X, RefreshCw, Circle } from 'lucide-react';

export function UsbDevicesModal() {
    const [isOpen, setIsOpen] = useAtom(usbDevicesModalOpenAtom);
    const [devices, setDevices] = useAtom(usbDevicesAtom);
    const [deviceCount, setDeviceCount] = useAtom(usbDeviceCountAtom);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsbDevices = async () => {
        setIsRefreshing(true);
        setError(null);

        try {
            // Check if running in Eel environment
            if (window.eel && window.eel.get_connected_usb_devices) {
                // Eel requires double parentheses: first () gets the function, second () calls it
                const result = await window.eel.get_connected_usb_devices()();

                if (result.success) {
                    setDevices(result.devices);
                    setDeviceCount(result.count);
                } else {
                    setError(result.error || 'Failed to fetch serial devices');
                    setDevices([]);
                    setDeviceCount(0);
                }
            } else {
                // Running in development mode without Eel
                setError('Not running in Eel environment');
                setDevices([]);
                setDeviceCount(0);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setDevices([]);
            setDeviceCount(0);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Fetch on open and every 5 seconds while modal is open
    useEffect(() => {
        if (isOpen) {
            fetchUsbDevices();
            const interval = setInterval(fetchUsbDevices, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#00000080] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">Serial Devices ({deviceCount})</h2>
                        <button
                            onClick={fetchUsbDevices}
                            disabled={isRefreshing}
                            className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                            title="Refresh devices"
                        >
                            <RefreshCw
                                className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
                            />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <p className="text-sm text-red-500 mb-3">Error: {error}</p>
                )}

                {/* Device List */}
                <div className="max-h-96 overflow-y-auto">
                    {devices.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">No serial devices detected</p>
                    ) : (
                        <div className="space-y-2">
                            {devices.map((device, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded px-3 py-2 hover:bg-gray-50"
                                >
                                    <div className="flex items-start gap-2">
                                        <Circle className="w-2 h-2 fill-blue-500 text-blue-500 mt-1 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 font-mono" title={device.port}>
                                                {device.port}
                                            </p>
                                            <p className="text-sm text-gray-600 truncate" title={device.description}>
                                                {device.description}
                                            </p>
                                            {device.manufacturer && device.manufacturer !== 'Unknown' && (
                                                <p className="text-xs text-gray-500 truncate" title={device.manufacturer}>
                                                    {device.manufacturer}
                                                </p>
                                            )}
                                            {device.vid && device.vid !== 'N/A' && (
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs font-mono text-gray-500" title="Vendor ID">
                                                        VID: {device.vid}
                                                    </span>
                                                    {device.pid && device.pid !== 'N/A' && (
                                                        <span className="text-xs font-mono text-gray-500" title="Product ID">
                                                            PID: {device.pid}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
