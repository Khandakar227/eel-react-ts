import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { rosInstanceAtom, rosConnectedAtom } from '@/lib/ros/rosAtoms';
import { rosNodesAtom } from '@/lib/ros/rosNodesAtom';
import { RefreshCw, Circle } from 'lucide-react';
import { Service } from 'roslib';

export function RosNodesPanel() {
    const [ros] = useAtom(rosInstanceAtom);
    const [connected] = useAtom(rosConnectedAtom);
    const [nodes, setNodes] = useAtom(rosNodesAtom);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchNodes = () => {
        if (!ros || !connected) {
            setNodes([]);
            return;
        }

        setIsRefreshing(true);

        const getNodesService = new Service({
            ros: ros,
            name: '/rosapi/nodes',
            serviceType: 'rosapi/Nodes',
        });

        getNodesService.callService(
            {},
            (result: any) => {
                setNodes(result.nodes || []);
                setIsRefreshing(false);
            },
            (error: unknown) => {
                console.error('Failed to get ROS nodes:', error);
                setNodes([]);
                setIsRefreshing(false);
            }
        );
    };

    // Fetch nodes when connection status changes
    useEffect(() => {
        if (connected) {
            fetchNodes();
            // Poll every 5 seconds
            const interval = setInterval(fetchNodes, 5000);
            return () => clearInterval(interval);
        } else {
            setNodes([]);
        }
    }, [connected, ros]);

    if (!connected) {
        return (
            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">ROS Nodes</h3>
                </div>
                <p className="text-xs text-gray-500">Not connected to ROS</p>
            </div>
        );
    }

    return (
        <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">
                    ROS Nodes ({nodes.length})
                </h3>
                <button
                    onClick={fetchNodes}
                    disabled={isRefreshing}
                    className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                    title="Refresh nodes list"
                >
                    <RefreshCw
                        className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                </button>
            </div>

            {nodes.length === 0 ? (
                <p className="text-xs text-gray-500">No nodes running</p>
            ) : (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                    {nodes.map((node, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 text-xs text-gray-700 hover:bg-gray-50 px-2 py-1 rounded"
                        >
                            <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                            <span className="font-mono truncate" title={node}>
                                {node}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
