import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { hm30ModalOpenAtom } from '@/lib/hm30/hm30ModalAtom';
import { hm30ConfigAtom, hm30ConnectionStatusAtom } from '@/lib/hm30/hm30Atoms';
import type { HM30ConnectionResponse, HM30StatusResponse } from '@/types/hm30Types';
import { X, Wifi, WifiOff, Loader2 } from 'lucide-react';

export function HM30ConnectionModal() {
    const [isOpen, setIsOpen] = useAtom(hm30ModalOpenAtom);
    const [config, setConfig] = useAtom(hm30ConfigAtom);
    const [connectionStatus, setConnectionStatus] = useAtom(hm30ConnectionStatusAtom);

    const [remoteIp, setRemoteIp] = useState(config.remoteIp);
    const [remotePort, setRemotePort] = useState(config.remotePort.toString());
    const [localPort, setLocalPort] = useState(config.localPort?.toString() || '');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch status on open
    useEffect(() => {
        if (isOpen && window.eel?.get_hm30_status) {
            fetchStatus();
        }
    }, [isOpen]);

    const fetchStatus = async () => {
        try {
            const result: HM30StatusResponse = await (window.eel as any).get_hm30_status()();
            setConnectionStatus({
                status: result.status as any,
                connected: result.connected,
                remoteIp: result.remote_ip,
                remotePort: result.remote_port,
                localPort: result.local_port,
                errorMessage: result.error_message,
            });
        } catch (err) {
            console.error('Failed to fetch HM30 status:', err);
        }
    };

    const handleConnect = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            if (!window.eel?.connect_hm30) {
                setError('Not running in Eel environment');
                setIsConnecting(false);
                return;
            }

            const portNum = parseInt(remotePort);
            const localPortNum = localPort ? parseInt(localPort) : undefined;

            if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
                setError('Invalid port number (1-65535)');
                setIsConnecting(false);
                return;
            }

            if (localPort && (isNaN(localPortNum!) || localPortNum! < 1 || localPortNum! > 65535)) {
                setError('Invalid local port number (1-65535)');
                setIsConnecting(false);
                return;
            }

            const result: HM30ConnectionResponse = await window.eel.connect_hm30(
                remoteIp,
                portNum,
                localPortNum
            )();

            if (result.success) {
                setConfig({
                    remoteIp,
                    remotePort: portNum,
                    localPort: result.local_port,
                });
                setConnectionStatus({
                    status: 'connected',
                    connected: true,
                    remoteIp,
                    remotePort: portNum,
                    localPort: result.local_port,
                });
                setError(null);
            } else {
                setError(result.error || 'Connection failed');
                setConnectionStatus({
                    status: 'error',
                    connected: false,
                    errorMessage: result.error,
                });
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMsg);
            setConnectionStatus({
                status: 'error',
                connected: false,
                errorMessage: errorMsg,
            });
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            if (!window.eel?.disconnect_hm30) {
                setError('Not running in Eel environment');
                setIsConnecting(false);
                return;
            }

            const result: HM30ConnectionResponse = await window.eel.disconnect_hm30()();

            if (result.success) {
                setConnectionStatus({
                    status: 'disconnected',
                    connected: false,
                });
                setError(null);
            } else {
                setError(result.error || 'Disconnect failed');
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMsg);
        } finally {
            setIsConnecting(false);
        }
    };

    if (!isOpen) return null;

    const isConnected = connectionStatus.connected;

    return (
        <div className="fixed inset-0 bg-[#00000080] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">HM30 UDP Connection</h2>
                        {isConnected ? (
                            <Wifi className="w-5 h-5 text-green-500" />
                        ) : (
                            <WifiOff className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Connection Status */}
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-700">
                        Status: <span className={`font-semibold ${isConnected ? 'text-green-600' :
                            connectionStatus.status === 'error' ? 'text-red-600' :
                                'text-gray-600'
                            }`}>
                            {connectionStatus.status.toUpperCase()}
                        </span>
                    </p>
                    {isConnected && connectionStatus.localPort && (
                        <p className="text-xs text-gray-500 mt-1">
                            Local Port: {connectionStatus.localPort}
                        </p>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Info Note */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs text-blue-700">
                        <strong>Note:</strong> UDP connections don't require baudrate.
                        Only IP address and port are needed.
                    </p>
                </div>

                {/* Connection Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ground Unit IP Address
                        </label>
                        <input
                            type="text"
                            value={remoteIp}
                            onChange={(e) => setRemoteIp(e.target.value)}
                            disabled={isConnected || isConnecting}
                            placeholder="192.168.144.12"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ground Unit Port
                        </label>
                        <input
                            type="number"
                            value={remotePort}
                            onChange={(e) => setRemotePort(e.target.value)}
                            disabled={isConnected || isConnecting}
                            placeholder="19856"
                            min="1"
                            max="65535"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Local Port (Optional)
                        </label>
                        <input
                            type="number"
                            value={localPort}
                            onChange={(e) => setLocalPort(e.target.value)}
                            disabled={isConnected || isConnecting}
                            placeholder="Auto-assign"
                            min="1"
                            max="65535"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Leave empty to auto-assign a local port
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                    {isConnected ? (
                        <button
                            onClick={handleDisconnect}
                            disabled={isConnecting}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Disconnect
                        </button>
                    ) : (
                        <button
                            onClick={handleConnect}
                            disabled={isConnecting || !remoteIp || !remotePort}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Connect
                        </button>
                    )}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
