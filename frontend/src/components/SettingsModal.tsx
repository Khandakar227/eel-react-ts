import { useAtom } from 'jotai';
import { settingsModalOpenAtom, rosUrlAtom } from '@/lib/settings/settingsAtoms';
import { rosConnectedAtom } from '@/lib/ros/rosAtoms';
import { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';

export function SettingsModal() {
    const [isOpen, setIsOpen] = useAtom(settingsModalOpenAtom);
    const [rosUrl, setRosUrl] = useAtom(rosUrlAtom);
    const [connected] = useAtom(rosConnectedAtom);
    const [tempUrl, setTempUrl] = useState(rosUrl);

    useEffect(() => {
        setTempUrl(rosUrl);
    }, [rosUrl]);

    if (!isOpen) return null;

    const handleSave = () => {
        setRosUrl(tempUrl);
        setIsOpen(false);
    };

    return (
        <div className="fixed inset-0 bg-[#00000080] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        <h2 className="text-xl font-semibold">Settings</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {/* ROS URL Setting */}
                    <div>
                        <label htmlFor="ros-url" className="block text-sm font-medium text-gray-700 mb-1">
                            ROS WebSocket URL
                        </label>
                        <input
                            id="ros-url"
                            type="text"
                            value={tempUrl}
                            onChange={(e) => setTempUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="ws://localhost:9090"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            WebSocket URL for rosbridge server
                        </p>
                    </div>

                    {/* Connection Status */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Status:</span>
                        <span
                            className={`text-sm font-medium ${connected ? 'text-green-600' : 'text-gray-500'
                                }`}
                        >
                            {connected ? '● Connected' : '○ Disconnected'}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
