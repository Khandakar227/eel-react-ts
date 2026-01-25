import { useEffect, useCallback, useRef } from 'react';
import { useAtom } from 'jotai';
import {
    rosInstanceAtom,
    rosConnectedAtom,
    rosUrlAtom,
    gpsAtom,
    rotationVectorAtom,
    roverStatusAtom,
    targetsAtom,
    roverPathStackAtom,
} from './rosAtoms';
import { connectToRos, subscribeToTopics, disconnectRos, type RosDataSetters } from './rosManager';

/**
 * Hook for managing ROS connection lifecycle
 */
export function useRosConnection() {
    const [rosInstance, setRosInstance] = useAtom(rosInstanceAtom);
    const [connected, setConnected] = useAtom(rosConnectedAtom);
    const [rosUrl] = useAtom(rosUrlAtom);
    const [, setGps] = useAtom(gpsAtom);
    const [, setRotationVector] = useAtom(rotationVectorAtom);
    const [, setRoverStatus] = useAtom(roverStatusAtom);
    const [, setTargets] = useAtom(targetsAtom);
    const [roverPathStack, setRoverPathStack] = useAtom(roverPathStackAtom);

    const topicsRef = useRef<any>(null);

    const connect = useCallback(() => {
        if (rosInstance && connected) {
            console.log('Already connected to ROS');
            return;
        }

        const setters: RosDataSetters = {
            setRosInstance,
            setConnected,
            setGps,
            setRotationVector,
            setRoverStatus,
            setTargets,
            setRoverPathStack,
            getRoverPathStack: () => roverPathStack,
        };

        const ros = connectToRos(rosUrl, setters);

        // Subscribe to topics when connected
        ros.on('connection', () => {
            topicsRef.current = subscribeToTopics(ros, setters);
        });
    }, [
        rosInstance,
        connected,
        rosUrl,
        setRosInstance,
        setConnected,
        setGps,
        setRotationVector,
        setRoverStatus,
        setTargets,
        setRoverPathStack,
        roverPathStack,
    ]);

    const disconnect = useCallback(() => {
        if (rosInstance) {
            disconnectRos(rosInstance);
            setRosInstance(null);
            setConnected(false);
            topicsRef.current = null;
        }
    }, [rosInstance, setRosInstance, setConnected]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        rosInstance,
        connected,
        rosUrl,
        connect,
        disconnect,
    };
}
