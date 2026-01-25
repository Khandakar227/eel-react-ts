import { atom } from 'jotai';

export interface UsbDevice {
    port: string;
    description: string;
    manufacturer: string;
    vid: string;
    pid: string;
    serial: string;
}

export interface UsbDevicesResponse {
    success: boolean;
    devices: UsbDevice[];
    count: number;
    error?: string;
}

/**
 * Atom to store USB devices list
 */
export const usbDevicesAtom = atom<UsbDevice[]>([]);

/**
 * Atom to store USB device count
 */
export const usbDeviceCountAtom = atom<number>(0);
