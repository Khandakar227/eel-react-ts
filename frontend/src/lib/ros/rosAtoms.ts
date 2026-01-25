import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Ros } from 'roslib';
import type { IGPS, IRotationVector, IRoverStatus, ITarget, IRoverPathPoint } from '@/types/rosTypes';

/**
 * ROS Instance and Connection State
 */
export const rosInstanceAtom = atom<Ros | null>(null);
export const rosConnectedAtom = atom<boolean>(false);

/**
 * ROS URL with localStorage persistence
 * Default: ws://localhost:9090
 */
export const rosUrlAtom = atomWithStorage<string>(
    'ros-url',
    'ws://localhost:9090'
);

/**
 * ROS Data Atoms
 */
export const gpsAtom = atom<IGPS | null>(null);
export const rotationVectorAtom = atom<IRotationVector | null>(null);
export const roverStatusAtom = atom<IRoverStatus | null>(null);
export const targetsAtom = atom<ITarget[]>([]);
export const roverPathStackAtom = atom<IRoverPathPoint[]>([]);
