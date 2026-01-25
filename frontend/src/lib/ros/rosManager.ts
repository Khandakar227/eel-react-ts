import { Ros, Topic } from 'roslib';
import { ROS_TOPICS } from './rosTopics';
import type { IGPS, IRotationVector, IRoverStatus, ITarget, IRoverPathPoint } from '@/types/rosTypes';

/**
 * Setter functions interface for ROS data
 */
export interface RosDataSetters {
    setRosInstance: (ros: Ros | null) => void;
    setConnected: (connected: boolean) => void;
    setGps: (gps: IGPS | null) => void;
    setRotationVector: (rv: IRotationVector | null) => void;
    setRoverStatus: (status: IRoverStatus | null) => void;
    setTargets: (targets: ITarget[]) => void;
    setRoverPathStack: (updater: (prev: IRoverPathPoint[]) => IRoverPathPoint[]) => void;
    getRoverPathStack: () => IRoverPathPoint[];
}

/**
 * Connect to ROS bridge WebSocket
 */
export function connectToRos(url: string, setters: RosDataSetters): Ros {
    const ros = new Ros({ url });

    ros.on('connection', () => {
        console.log('Connected to rosbridge WebSocket!');
        setters.setConnected(true);
    });

    ros.on('error', (error: unknown) => {
        console.error('Error connecting to rosbridge WebSocket:', error);
        setters.setConnected(false);
    });

    ros.on('close', () => {
        console.log('Connection to rosbridge WebSocket closed!');
        setters.setConnected(false);
    });

    setters.setRosInstance(ros);
    return ros;
}

/**
 * Subscribe to all ROS topics
 */
export function subscribeToTopics(ros: Ros, setters: RosDataSetters) {
    // GPS Topic
    const gpsTopic = new Topic({
        ros,
        name: ROS_TOPICS.GPS.name,
        messageType: ROS_TOPICS.GPS.messageType,
    });

    gpsTopic.subscribe((message: any) => {
        const gpsData: IGPS = {
            latitude: message.latitude,
            longitude: message.longitude,
            altitude: message.altitude,
        };

        setters.setGps(gpsData);

        // Update rover path stack
        const currentPath = setters.getRoverPathStack();
        const lastPoint = currentPath[currentPath.length - 1];

        if (
            !lastPoint ||
            `${lastPoint.latitude}` !== `${message.latitude}` ||
            `${lastPoint.longitude}` !== `${message.longitude}`
        ) {
            setters.setRoverPathStack((prev) => [
                ...prev,
                { latitude: message.latitude, longitude: message.longitude },
            ]);
        }
    });

    // Rotation Vector Topic
    const rotationVectorTopic = new Topic({
        ros,
        name: ROS_TOPICS.ROTATION_VECTOR.name,
        messageType: ROS_TOPICS.ROTATION_VECTOR.messageType,
    });

    rotationVectorTopic.subscribe((message: any) => {
        setters.setRotationVector({
            x: message.x,
            y: message.y,
            z: message.z,
        });
    });

    // Rover Status Topic
    const roverStatusTopic = new Topic({
        ros,
        name: ROS_TOPICS.ROVER_STATUS.name,
        messageType: ROS_TOPICS.ROVER_STATUS.messageType,
    });

    roverStatusTopic.subscribe((message: any) => {
        setters.setRoverStatus(message);
    });

    // Global Plan Topic
    const globalPlanTopic = new Topic({
        ros,
        name: ROS_TOPICS.GLOBAL_PLAN.name,
        messageType: ROS_TOPICS.GLOBAL_PLAN.messageType,
    });

    globalPlanTopic.subscribe((message: any) => {
        setters.setTargets(message.targets || []);
    });

    return {
        gpsTopic,
        rotationVectorTopic,
        roverStatusTopic,
        globalPlanTopic,
    };
}

/**
 * Disconnect from ROS and cleanup
 */
export function disconnectRos(ros: Ros | null) {
    if (ros) {
        ros.close();
    }
}
