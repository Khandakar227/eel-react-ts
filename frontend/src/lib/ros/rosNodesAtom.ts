import { atom } from 'jotai';

/**
 * Atom to store the list of running ROS nodes
 */
export const rosNodesAtom = atom<string[]>([]);
