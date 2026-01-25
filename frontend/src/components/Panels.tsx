import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import MapPanel from "./MapPanel";
import { RosNodesPanel } from "./RosNodesPanel";

export function Panels() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="border border-gray-300 min-h-screen w-full"
    >
      <ResizablePanel className="border border-gray-300" defaultSize={40}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel className="border border-gray-300" defaultSize={60}>
            <MapPanel />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel className="border border-gray-300 p-4" defaultSize={40}>
            <RosNodesPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel className="border border-gray-300" defaultSize={40}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel className="border border-gray-300" defaultSize={60}>
            <span className="font-semibold">Three</span>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel className="border border-gray-300" defaultSize={40}>
            <span className="font-semibold">Four</span>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel className="border border-gray-300 p-4" defaultSize={20}>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
