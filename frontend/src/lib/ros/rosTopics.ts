/**
 * ROS Topic Configuration
 * Centralized configuration for all ROS topics and their message types
 */

export const ROS_TOPICS = {
    GPS: {
        name: '/gps/fix',
        messageType: 'sensor_msgs/NavSatFix',
    },
    ROTATION_VECTOR: {
        name: '/rotation_vector',
        messageType: 'geometry_msgs/Vector3',
    },
    ROVER_STATUS: {
        name: '/rover_status',
        messageType: 'custom_interfaces/RoverStatus',
    },
    GLOBAL_PLAN: {
        name: '/global_plan',
        messageType: 'custom_interfaces/TargetArray',
    },
} as const;

export type TopicConfig = typeof ROS_TOPICS[keyof typeof ROS_TOPICS];
