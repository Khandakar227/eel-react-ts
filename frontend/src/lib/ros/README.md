# ROS Integration Module

This document provides an overview of the ROS integration module and how to use it in your components.

## Architecture

The ROS module is built with a modular architecture:

```
lib/ros/
├── rosTopics.ts          # Topic configuration (names and message types)
├── rosAtoms.ts           # Jotai atoms for state management
├── rosManager.ts         # Core ROS connection and subscription logic
├── useRosConnection.ts   # React hook for connection lifecycle
└── useRosData.ts         # Custom hooks for accessing ROS data

lib/settings/
└── settingsAtoms.ts      # Settings state (modal, ROS URL)

components/
├── SettingsModal.tsx     # UI for settings
└── RosConnectionButton.tsx # Connection control button

types/
└── rosTypes.ts           # TypeScript interfaces for ROS messages
```

## Usage

### Connecting to ROS

The ROS connection is managed through the UI:

1. **Configure ROS URL**: Click the settings (gear) icon in the navbar
2. **Set URL**: Enter your ROS WebSocket URL (default: `ws://localhost:9090`)
3. **Save**: Click "Save" to persist the URL 
4. **Connect**: Click the "Connect to ROS" button in the navbar

### Accessing ROS Data in Components

Import the hooks you need from `useRosData.ts`:

```typescript
import { 
  useGps, 
  useRotationVector, 
  useRoverStatus, 
  useTargets,
  useRoverPathStack 
} from '@/lib/ros/useRosData';

function MyComponent() {
  const gps = useGps();
  const rotationVector = useRotationVector();
  const roverStatus = useRoverStatus();
  const targets = useTargets();
  const pathStack = useRoverPathStack();

  return (
    <div>
      {gps && (
        <p>
          Position: {gps.latitude}, {gps.longitude}
        </p>
      )}
    </div>
  );
}
```

### Available Hooks

- `useRosConnected()` - Returns connection status (boolean)
- `useGps()` - Returns GPS data (IGPS | null)
- `useRotationVector()` - Returns rotation vector (IRotationVector | null)
- `useRoverStatus()` - Returns rover status (IRoverStatus | null)
- `useTargets()` - Returns target waypoints (ITarget[])
- `useRoverPathStack()` - Returns rover path history (IRoverPathPoint[])

## Topic Configuration

All ROS topics are defined in `lib/ros/rosTopics.ts`. To add or modify topics:

1. Update `ROS_TOPICS` object with topic name and message type
2. Add atom in `rosAtoms.ts`
3. Add subscription in `rosManager.ts`
4. Create custom hook in `useRosData.ts`

## Data Flow

```
ROS Topics → rosManager → Jotai Atoms → Custom Hooks → Components
```

This architecture ensures:
- **Separation of concerns**: ROS logic separate from UI
- **Centralized state**: All components access the same data
- **Type safety**: TypeScript interfaces throughout
- **Modularity**: Easy to add new topics or modify existing ones
