import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import {
    hm30DataPanelOpenAtom
} from '@/lib/hm30/hm30ModalAtom';
import {
    hm30ConnectionStatusAtom,
    hm30MessageHistoryAtom,
    hm30AutoRefreshAtom
} from '@/lib/hm30/hm30Atoms';
import type {
    HM30SendDataResponse,
    HM30ReceiveDataResponse
} from '@/types/hm30Types';
import {
    X,
    Send,
    RefreshCw,
    Trash2,
    ArrowDown,
    ArrowUp,
    Copy,
    CheckCheck
} from 'lucide-react';

export function HM30DataPanel() {
    const [isOpen, setIsOpen] = useAtom(hm30DataPanelOpenAtom);
    const [connectionStatus] = useAtom(hm30ConnectionStatusAtom);
    const [messageHistory, setMessageHistory] = useAtom(hm30MessageHistoryAtom);
    const [autoRefresh, setAutoRefresh] = useAtom(hm30AutoRefreshAtom);

    const [sendData, setSendData] = useState('');
    const [dataFormat, setDataFormat] = useState<'text' | 'hex'>('text');
    const [isSending, setIsSending] = useState(false);
    const [isReceiving, setIsReceiving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const messageEndRef = useRef<HTMLDivElement>(null);
    const autoRefreshIntervalRef = useRef<number | null>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messageHistory]);

    // Auto-refresh receive data
    useEffect(() => {
        if (autoRefresh && connectionStatus.connected) {
            autoRefreshIntervalRef.current = setInterval(() => {
                handleReceive();
            }, 2000);
        } else {
            if (autoRefreshIntervalRef.current) {
                clearInterval(autoRefreshIntervalRef.current);
                autoRefreshIntervalRef.current = null;
            }
        }

        return () => {
            if (autoRefreshIntervalRef.current) {
                clearInterval(autoRefreshIntervalRef.current);
            }
        };
    }, [autoRefresh, connectionStatus.connected]);

    const handleSend = async () => {
        if (!sendData.trim()) {
            setError('Please enter data to send');
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            if (!window.eel?.send_hm30_data) {
                setError('Not running in Eel environment');
                setIsSending(false);
                return;
            }

            const result: HM30SendDataResponse = await window.eel.send_hm30_data(
                sendData,
                dataFormat
            )();

            if (result.success) {
                // Add to message history
                const newMessage = {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    direction: 'ground-to-air' as const,
                    data: sendData,
                    bytesTransferred: result.bytes_sent || 0,
                    format: dataFormat,
                };
                setMessageHistory([...messageHistory, newMessage]);
                setSendData('');
                setError(null);
            } else {
                setError(result.error || 'Failed to send data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsSending(false);
        }
    };

    const handleReceive = async () => {
        setIsReceiving(true);
        setError(null);

        try {
            if (!window.eel?.receive_hm30_data) {
                setError('Not running in Eel environment');
                setIsReceiving(false);
                return;
            }

            const result: HM30ReceiveDataResponse = await window.eel.receive_hm30_data(1.0)();

            if (result.success && result.data) {
                // Add to message history
                const newMessage = {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    direction: 'air-to-ground' as const,
                    data: result.data,
                    rawData: result.raw_data,
                    bytesTransferred: result.bytes_received || 0,
                    format: 'text' as const,
                };
                setMessageHistory([...messageHistory, newMessage]);
                setError(null);
            } else if (!result.timeout) {
                // Only show error if it's not a timeout
                setError(result.error || 'Failed to receive data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsReceiving(false);
        }
    };

    const handleClearHistory = () => {
        setMessageHistory([]);
    };

    const handleCopyMessage = (message: string, id: string) => {
        navigator.clipboard.writeText(message);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    };

    if (!isOpen) return null;

    const isConnected = connectionStatus.connected;

    return (
        <div className="fixed inset-0 bg-[#00000080] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[600px] flex flex-col p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">HM30 Data Communication</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!isConnected && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-700">
                            Not connected to HM30. Please connect first.
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Send Data Section */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold mb-2 text-gray-700">Send Data to Air Unit</h3>
                    <div className="flex gap-2">
                        <select
                            value={dataFormat}
                            onChange={(e) => setDataFormat(e.target.value as 'text' | 'hex')}
                            disabled={!isConnected || isSending}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                        >
                            <option value="text">Text</option>
                            <option value="hex">Hex</option>
                        </select>
                        <input
                            type="text"
                            value={sendData}
                            onChange={(e) => setSendData(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={!isConnected || isSending}
                            placeholder={dataFormat === 'hex' ? 'e.g., 48656c6c6f' : 'Enter message...'}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!isConnected || isSending || !sendData.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Send
                        </button>
                    </div>
                </div>

                {/* Receive Data Section */}
                <div className="mb-4 flex gap-2">
                    <button
                        onClick={handleReceive}
                        disabled={!isConnected || isReceiving}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isReceiving ? 'animate-spin' : ''}`} />
                        Receive Data
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            disabled={!isConnected}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">Auto-refresh (2s)</span>
                    </label>
                    <button
                        onClick={handleClearHistory}
                        disabled={messageHistory.length === 0}
                        className="ml-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear History
                    </button>
                </div>

                {/* Message History */}
                <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {messageHistory.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">
                            No messages yet. Send or receive data to see history.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {messageHistory.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-3 rounded-md border ${msg.direction === 'ground-to-air'
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-green-50 border-green-200'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            {msg.direction === 'ground-to-air' ? (
                                                <ArrowUp className="w-4 h-4 text-blue-600" />
                                            ) : (
                                                <ArrowDown className="w-4 h-4 text-green-600" />
                                            )}
                                            <span className={`text-xs font-semibold ${msg.direction === 'ground-to-air'
                                                ? 'text-blue-700'
                                                : 'text-green-700'
                                                }`}>
                                                {msg.direction === 'ground-to-air' ? 'GROUND → AIR' : 'AIR → GROUND'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatTimestamp(msg.timestamp)}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                ({msg.bytesTransferred} bytes)
                                            </span>
                                            <span className="text-xs text-gray-500 uppercase">
                                                [{msg.format}]
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleCopyMessage(msg.data, msg.id)}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            title="Copy message"
                                        >
                                            {copiedId === msg.id ? (
                                                <CheckCheck className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-sm font-mono bg-white p-2 rounded border border-gray-200 break-all">
                                        {msg.data}
                                    </p>
                                    {msg.rawData && (
                                        <p className="text-xs font-mono text-gray-500 mt-1">
                                            Hex: {msg.rawData}
                                        </p>
                                    )}
                                </div>
                            ))}
                            <div ref={messageEndRef} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
