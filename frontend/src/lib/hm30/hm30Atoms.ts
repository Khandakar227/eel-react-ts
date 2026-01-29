import { atom } from 'jotai';

export interface HM30Config {
    remoteIp: string;
    remotePort: number;
    localPort?: number;
}

export interface HM30Message {
    id: string;
    timestamp: number;
    direction: 'ground-to-air' | 'air-to-ground';
    data: string;
    rawData?: string;
    bytesTransferred: number;
    format: 'text' | 'hex';
}

export interface HM30ConnectionStatus {
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    connected: boolean;
    remoteIp?: string;
    remotePort?: number;
    localPort?: number;
    errorMessage?: string;
}

export interface HM30StatusResponse {
    status: string;
    connected: boolean;
    remote_ip?: string;
    remote_port?: number;
    local_port?: number;
    error_message?: string;
}

/**
 * Atom to store HM30 connection configuration
 */
export const hm30ConfigAtom = atom<HM30Config>({
    remoteIp: '192.168.144.12',
    remotePort: 19856,
});

/**
 * Atom to store HM30 connection status
 */
export const hm30ConnectionStatusAtom = atom<HM30ConnectionStatus>({
    status: 'disconnected',
    connected: false,
});

/**
 * Atom to store message history
 */
export const hm30MessageHistoryAtom = atom<HM30Message[]>([]);

/**
 * Atom to store last received message
 */
export const hm30LastMessageAtom = atom<HM30Message | null>(null);

/**
 * Atom to track auto-refresh for receiving data
 */
export const hm30AutoRefreshAtom = atom<boolean>(false);
