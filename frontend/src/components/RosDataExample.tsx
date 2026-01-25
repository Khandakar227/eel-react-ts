/**
 * Example component demonstrating how to use ROS data
 * This shows how other components can access ROS data through Jotai
 */

import {
    useGps,
    useRotationVector,
    useRoverStatus,
    useTargets,
    useRoverPathStack,
    useRosConnected
} from '@/lib/ros/useRosData';

export function RosDataExample() {
    const connected = useRosConnected();
    const gps = useGps();
    const rotationVector = useRotationVector();
    const roverStatus = useRoverStatus();
    const targets = useTargets();
    const pathStack = useRoverPathStack();

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">ROS Data Example</h2>

            <div className="space-y-3">
                <div>
                    <p className="text-sm font-medium text-gray-700">Connection Status:</p>
                    <p className={`text-sm ${connected ? 'text-green-600' : 'text-gray-500'}`}>
                        {connected ? 'Connected' : 'Disconnected'}
                    </p>
                </div>

                {gps && (
                    <div>
                        <p className="text-sm font-medium text-gray-700">GPS Position:</p>
                        <p className="text-sm text-gray-600">
                            Lat: {gps.latitude.toFixed(6)}, Lon: {gps.longitude.toFixed(6)}, Alt: {gps.altitude.toFixed(2)}m
                        </p>
                    </div>
                )}

                {rotationVector && (
                    <div>
                        <p className="text-sm font-medium text-gray-700">Rotation Vector:</p>
                        <p className="text-sm text-gray-600">
                            X: {rotationVector.x.toFixed(3)}, Y: {rotationVector.y.toFixed(3)}, Z: {rotationVector.z.toFixed(3)}
                        </p>
                    </div>
                )}

                {roverStatus && (
                    <div>
                        <p className="text-sm font-medium text-gray-700">Rover Status:</p>
                        <p className="text-sm text-gray-600">
                            {JSON.stringify(roverStatus, null, 2)}
                        </p>
                    </div>
                )}

                <div>
                    <p className="text-sm font-medium text-gray-700">Targets:</p>
                    <p className="text-sm text-gray-600">{targets.length} waypoints</p>
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-700">Path History:</p>
                    <p className="text-sm text-gray-600">{pathStack.length} points</p>
                </div>
            </div>
        </div>
    );
}
