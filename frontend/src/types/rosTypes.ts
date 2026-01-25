export interface IGPS {
    latitude: number;
    longitude: number;
    altitude: number;
}

export interface IRotationVector {
    x: number;
    y: number;
    z: number;
}

export interface IRoverStatus {
    battery_level?: number;
    state?: string;
    speed?: number;
    [key: string]: any;
}

export interface ITarget {
    latitude: number;
    longitude: number;
    [key: string]: any;
}

export interface IRoverPathPoint {
    latitude: number;
    longitude: number;
}
