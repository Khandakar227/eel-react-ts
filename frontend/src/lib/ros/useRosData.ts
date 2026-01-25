/**
 * Custom hooks for accessing ROS data from Jotai atoms
 * Use these hooks in your components to access ROS data
 */

import { useAtom, useAtomValue } from 'jotai';
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

/**
 * Hook to access ROS instance
 * Returns: [rosInstance, setRosInstance]
 */
export const useRosInstance = () => useAtom(rosInstanceAtom);

/**
 * Hook to check if ROS is connected
 * Returns: boolean
 */
export const useRosConnected = () => useAtomValue(rosConnectedAtom);

/**
 * Hook to access ROS URL
 * Returns: [rosUrl, setRosUrl]
 */
export const useRosUrl = () => useAtom(rosUrlAtom);

/**
 * Hook to access GPS data
 * Returns: IGPS | null
 */
export const useGps = () => useAtomValue(gpsAtom);

/**
 * Hook to access rotation vector data
 * Returns: IRotationVector | null
 */
export const useRotationVector = () => useAtomValue(rotationVectorAtom);

/**
 * Hook to access rover status data
 * Returns: IRoverStatus | null
 */
export const useRoverStatus = () => useAtomValue(roverStatusAtom);

/**
 * Hook to access target waypoints
 * Returns: ITarget[]
 */
export const useTargets = () => useAtomValue(targetsAtom);

/**
 * Hook to access rover path history
 * Returns: IRoverPathPoint[]
 */
export const useRoverPathStack = () => useAtomValue(roverPathStackAtom);
