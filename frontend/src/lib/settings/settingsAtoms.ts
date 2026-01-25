import { atom } from 'jotai';

/**
 * Settings Atoms
 */

// Settings modal visibility
export const settingsModalOpenAtom = atom<boolean>(false);

// ROS URL setting (already defined in rosAtoms, but re-exported here for convenience)
// This is the same atom, just imported for settings context
export { rosUrlAtom } from '../ros/rosAtoms';
