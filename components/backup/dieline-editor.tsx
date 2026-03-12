"use client";
import React, { useState, useRef } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";
import { Button } from "@/components/ui/button";
import { Pencil, Save, Undo, Grid, Trash2 } from "lucide-react";

type Point = { x: number; y: number };
type PathType = "cut" | "fold";

interface DrawnPath {
  id: string;
  points: Point[];
  type: PathType;
  closed?: boolean;
}

type EditorMode = "draw-cut" | "draw-fold";

const DielineEditor: React.FC = () => {
  const [paths, setPaths] = useState<DrawnPath[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [mode, setMode] = useState<EditorMode>("draw-cut");
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [generatedCode, setGeneratedCode] = useState<string>("");

  const stageRef = useRef<any>(null);
  const gridSize = 20;

  const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize;

  const handleStageClick = (e: any) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    const x = snapToGrid(pointerPos.x);
    const y = snapToGrid(pointerPos.y);

    setCurrentPath((prev) => [...prev, { x, y }]);
  };

  const handleFinishPath = () => {
    if (currentPath.length < 2) {
      alert("Need at least 2 points to create a path");
      return;
    }

    const newPath: DrawnPath = {
      id: `path-${Date.now()}`,
      points: [...currentPath],
      type: mode === "draw-cut" ? "cut" : "fold",
      closed: false,
    };

    setPaths((prev) => [...prev, newPath]);
    setCurrentPath([]);
  };

  const handleClosePath = () => {
    if (currentPath.length < 3) {
      alert("Need at least 3 points to close a path");
      return;
    }

    const newPath: DrawnPath = {
      id: `path-${Date.now()}`,
      points: [...currentPath, currentPath[0]], // Close by connecting to first point
      type: mode === "draw-cut" ? "cut" : "fold",
      closed: true,
    };

    setPaths((prev) => [...prev, newPath]);
    setCurrentPath([]);
  };

  const handleDeletePath = (id: string) => {
    setPaths((prev) => prev.filter((p) => p.id !== id));
    if (selectedPathId === id) {
      setSelectedPathId(null);
    }
  };

  const handleDeleteLastPoint = () => {
    setCurrentPath((prev) => prev.slice(0, -1));
  };

  const handleGenerateCode = () => {
    if (paths.length === 0) {
      alert("No paths to generate code from");
      return;
    }

    const pointsToArray = (points: Point[]) =>
      points.map((p) => `${p.x}, ${p.y}`).join(", ");

    const pathsCode = paths
      .map((path) => {
        const pointsStr = pointsToArray(path.points);
        const type = path.type === "cut" ? "'cut'" : "'fold'";
        return `    createPath([${pointsStr}], ${type})`;
      })
      .join(",\n");

    const code = `const generateDieline = () => {
  const paths: { points: number[]; stroke: string; strokeWidth: number; dash?: number[] }[] = [];

  // Helper to create paths
  const createPath = (
    coords: number[],
    type: 'cut' | 'fold' = 'cut'
  ) => ({
    points: coords,
    stroke: type === 'cut' ? '#000' : '#0066cc',
    strokeWidth: type === 'cut' ? 0.5 : 1.5,
    ...(type === 'fold' && { dash: [8, 4] }),
  });

  // Generated paths
  paths.push(
${pathsCode}
  );

  return paths;
};`;

    setGeneratedCode(code);
  };

  const pointsToFlatArray = (points: Point[]) =>
    points.flatMap((p) => [p.x, p.y]);

  const renderGrid = () => {
    const lines = [];
    const width = 1200;
    const height = 800;

    // Vertical lines
    for (let i = 0; i <= width; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, height]}
          stroke="#e0e0e0"
          strokeWidth={0.5}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= height; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, width, i]}
          stroke="#e0e0e0"
          strokeWidth={0.5}
        />
      );
    }

    return lines;
  };

  const handleModeChange = (newMode: EditorMode) => {
    setMode(newMode);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Tools */}
      <div className="w-64 bg-white border-r p-4 flex flex-col gap-3">
        <h2 className="font-bold text-lg mb-2">Dieline Editor</h2>

        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">Drawing Mode</p>
          <Button
            variant={mode === "draw-cut" ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => handleModeChange("draw-cut")}
          >
            <Pencil size={16} className="mr-2" />
            Draw Cut Line
          </Button>
          <Button
            variant={mode === "draw-fold" ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => handleModeChange("draw-fold")}
          >
            <Pencil size={16} className="mr-2" />
            Draw Fold Line (Dashed)
          </Button>
          <p className="text-xs text-blue-600 mt-2">
            Current: {mode === "draw-cut" ? "Cut Line" : "Fold Line"}
          </p>
        </div>

        <div className="border-t pt-3 mt-2">
          <p className="text-sm text-gray-600 font-medium mb-2">Actions</p>
          <Button
            variant="outline"
            className="w-full justify-start mb-2"
            onClick={handleFinishPath}
            disabled={currentPath.length < 2}
          >
            Finish Path ({currentPath.length} points)
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start mb-2"
            onClick={handleClosePath}
            disabled={currentPath.length < 3}
          >
            Close Path (Connect to Start)
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start mb-2"
            onClick={handleDeleteLastPoint}
            disabled={currentPath.length === 0}
          >
            <Undo size={16} className="mr-2" />
            Undo Last Point
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid size={16} className="mr-2" />
            {showGrid ? "Hide" : "Show"} Grid
          </Button>
        </div>

        <div className="border-t pt-3 mt-2">
          <Button
            variant="default"
            className="w-full"
            onClick={handleGenerateCode}
            disabled={paths.length === 0}
          >
            <Save size={16} className="mr-2" />
            Generate Code
          </Button>
        </div>

        <div className="border-t pt-3 mt-2">
          <p className="text-sm text-gray-600 font-medium mb-2">Saved Paths</p>
          <div className="space-y-1 max-h-40 overflow-auto">
            {paths.map((path) => (
              <div
                key={path.id}
                className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded"
              >
                <span className={selectedPathId === path.id ? "font-bold" : ""}>
                  {path.type === "cut" ? "✂️" : "📏"} {path.points.length} pts
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => handleDeletePath(path.id)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-3 mt-auto">
          <p className="text-xs text-gray-500">Click canvas to add points</p>
          <p className="text-xs text-gray-500 mt-1">Grid snap: {gridSize}px</p>
          <p className="text-xs text-gray-500">
            Current points: {currentPath.length}
          </p>
          <p className="text-xs text-gray-500">Total paths: {paths.length}</p>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-lg shadow-lg inline-block">
          <Stage
            ref={stageRef}
            width={1200}
            height={800}
            onClick={handleStageClick}
          >
            <Layer>
              {/* Grid */}
              {showGrid && renderGrid()}

              {/* Drawn paths */}
              {paths.map((path) => (
                <React.Fragment key={path.id}>
                  <Line
                    points={pointsToFlatArray(path.points)}
                    stroke={path.type === "cut" ? "#000" : "#0066cc"}
                    strokeWidth={path.type === "cut" ? 2 : 2}
                    dash={path.type === "fold" ? [8, 4] : undefined}
                    lineCap="round"
                    lineJoin="round"
                    listening={false}
                  />

                  {/* Show points */}
                  {path.points.map((point, idx) => (
                    <Circle
                      key={`${path.id}-${idx}`}
                      x={point.x}
                      y={point.y}
                      radius={4}
                      fill={selectedPathId === path.id ? "#ff6b6b" : "#666"}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  ))}
                </React.Fragment>
              ))}

              {/* Current path being drawn */}
              {currentPath.length > 0 && (
                <>
                  <Line
                    points={pointsToFlatArray(currentPath)}
                    stroke={mode === "draw-cut" ? "#000" : "#00aaff"}
                    strokeWidth={2}
                    dash={mode === "draw-fold" ? [10, 6] : undefined}
                    lineCap="round"
                    lineJoin="round"
                    opacity={0.9}
                  />

                  {currentPath.map((point, idx) => (
                    <Circle
                      key={idx}
                      x={point.x}
                      y={point.y}
                      radius={5}
                      fill="#4CAF50"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </>
              )}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Right Panel - Generated Code */}
      {generatedCode && (
        <div className="w-96 bg-gray-900 text-white p-4 overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">Generated Code</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(generatedCode);
                alert("Code copied to clipboard!");
              }}
            >
              Copy
            </Button>
          </div>
          <pre className="text-xs bg-gray-800 p-3 rounded overflow-auto">
            <code>{generatedCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default DielineEditor;
