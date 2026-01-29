// HM30 UDP Connection Types

export interface HM30ConnectionResponse {
    success: boolean;
    message?: string;
    local_port?: number;
    error?: string;
}

export interface HM30SendDataResponse {
    success: boolean;
    bytes_sent?: number;
    message?: string;
    error?: string;
}

export interface HM30ReceiveDataResponse {
    success: boolean;
    data?: string;
    raw_data?: string;
    bytes_received?: number;
    source_ip?: string;
    source_port?: number;
    error?: string;
    timeout?: boolean;
}

export interface HM30StatusResponse {
    status: string;
    connected: boolean;
    remote_ip?: string;
    remote_port?: number;
    local_port?: number;
    error_message?: string;
}

// Extend Window interface for all Eel functions
declare global {
    interface Window {
        eel?: {
            // USB functions
            get_connected_usb_devices?: () => () => Promise<{
                success: boolean;
                devices: any[];
                count: number;
                error?: string;
            }>;

            // HM30 functions
            connect_hm30?: (remoteIp: string, remotePort: number, localPort?: number) => () => Promise<HM30ConnectionResponse>;
            disconnect_hm30?: () => () => Promise<HM30ConnectionResponse>;
            send_hm30_data?: (data: string, encoding?: string) => () => Promise<HM30SendDataResponse>;
            receive_hm30_data?: (timeout?: number) => () => Promise<HM30ReceiveDataResponse>;
            get_hm30_status?: () => () => Promise<HM30StatusResponse>;
        };
    }
}
