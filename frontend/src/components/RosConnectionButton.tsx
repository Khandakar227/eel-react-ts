import { useRosConnection } from '@/lib/ros/useRosConnection';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function RosConnectionButton() {
    const { connected, connect, disconnect } = useRosConnection();
    const [isConnecting, setIsConnecting] = useState(false);

    const handleClick = async () => {
        if (connected) {
            disconnect();
        } else {
            setIsConnecting(true);
            try {
                await connect();
            } catch (error) {
                console.error('Connection failed:', error);
            } finally {
                // Give a small delay for connection state to update
                setTimeout(() => setIsConnecting(false), 500);
            }
        }
    };

    const getButtonStyle = () => {
        if (connected) {
            return 'bg-green-600 hover:bg-green-700 text-white';
        }
        if (isConnecting) {
            return 'bg-yellow-600 text-white cursor-wait';
        }
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    };

    const getIcon = () => {
        if (isConnecting) {
            return <Loader2 className="w-4 h-4 animate-spin" />;
        }
        if (connected) {
            return <Wifi className="w-4 h-4" />;
        }
        return <WifiOff className="w-4 h-4" />;
    };

    const getLabel = () => {
        if (isConnecting) return 'Connecting to ROS...';
        if (connected) return 'Connected to ROS';
        return 'Connect to ROS';
    };

    return (
        <button
            onClick={handleClick}
            disabled={isConnecting}
            title={getLabel()}
            className={`p-1 rounded-md transition-colors ${getButtonStyle()}`}
        >
            {getIcon()}
            <p style={{ fontSize: '8px' }}>ROS</p>
        </button>
    );
}
