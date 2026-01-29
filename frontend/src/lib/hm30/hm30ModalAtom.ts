import { atom } from 'jotai';

/**
 * Atom to control HM30 connection modal visibility
 */
export const hm30ModalOpenAtom = atom<boolean>(false);

/**
 * Atom to control HM30 data panel visibility
 */
export const hm30DataPanelOpenAtom = atom<boolean>(false);
