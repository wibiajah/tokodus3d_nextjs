"use client";
import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Group, Transformer, Circle, Text } from "react-konva";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { ToolMode, useDesignStore } from "@/store/design-store";
import { ModelRenderer } from "./model-renderer";
import { useDesignModel } from "@/hooks/use-design-model";
import { exportModelTextures } from "@/models/export";
import CanvasTextItem from "./text-render";
import CanvasImageItem from "./image-render";
import HolesRender from "./holes-render";
import HolesOutlineRender from "./holes-outline-render";
import FacecolorPopover from "./facecolor-popover";
import RighttopButton from "./righttop-button";
import FacecolorFillRender from "./facecolorfill-render";
import FacecolorHitnhoverRender from "./facecolor-hitnhover-render";
import { Boundary } from "@/models/types";
export default function DielineStage() {
  const loadImages = useDesignStore((s) => s.loadImagesFromStorage);
  const loadListImages = useDesignStore((s) => s.loadListImagesFromStorage);
  useEffect(() => {
    loadImages();
    loadListImages();
  }, [loadImages, loadListImages]);
  const model = useDesignModel();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [mode, setMode] = useState<ToolMode>("pan");
  const [rotation, setRotation] = useState(0);
  const [size, setSize] = useState({ width: 300, height: 300 });
  const [scale, setScale] = useState(1);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const modelBox = useDesignStore((s) => s.model);
  const side = useDesignStore((s) => s.side);
  const material = useDesignStore((s) => s.material);
  const pw = useDesignStore((s) => s.pw);
  const texts = useDesignStore((s) => s.texts);
  const images = useDesignStore((s) => s.images);
  const insertImageFromList = useDesignStore((s) => s.insertImageFromList);
  const selectedId = useDesignStore((s) => s.selectedId);
  const setSelectedId = useDesignStore((s) => s.setSelectedId);
  const setIsVisible = useDesignStore((s) => s.setIsVisible);
  const removeImage = useDesignStore((s) => s.removeImage);
  const removeText = useDesignStore((s) => s.removeText);
  const printing1 = useDesignStore((s) => s.printing1);
  const printing2 = useDesignStore((s) => s.printing2);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.cursor = mode === "pan" ? "grab" : "default";
    }
  }, [mode]);
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);
  const [deletePos, setDeletePos] = useState<{ x: number; y: number } | null>(
    null,
  );
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    const stage = stageRef.current;
    const applySelection = () => {
      if (!selectedId || !mainGroupRef.current) {
        transformerRef.current!.nodes([]);
        transformerRef.current!.getLayer()?.batchDraw();
        setDeletePos(null);
        return;
      }
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current!.nodes([selectedNode]);
        transformerRef.current!.getLayer()?.batchDraw();
        const box = selectedNode.getClientRect({
          relativeTo: mainGroupRef.current,
        });
        setDeletePos({
          x: box.x + box.width * 0.75,
          y: box.y,
        });
      } else {
        transformerRef.current!.nodes([]);
        transformerRef.current!.getLayer()?.batchDraw();
        setDeletePos(null);
      }
    };
    applySelection();
    const tr = transformerRef.current;
    tr?.on("transform", applySelection);
    tr?.on("dragmove", applySelection);
    const handleDelete = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedId) {
        removeImage(selectedId);
        removeText(selectedId);
        clearSelection();
      }
    };
    window.addEventListener("keydown", handleDelete);
    return () => {
      window.removeEventListener("keydown", handleDelete);
      tr?.off("transform", applySelection);
      tr?.off("dragmove", applySelection);
    };
  }, [selectedId, removeImage, removeText]);
  const clearSelection = () => {
    transformerRef.current?.nodes([]);
    transformerRef.current?.getLayer()?.batchDraw();
    setSelectedId(null);
  };
  const handleMouseDown = (e: any) => {
    if (mode === "pan") {
      const pos = e.target.getStage().getPointerPosition();
      if (pos) dragStart.current = pos;
    }
  };
  const handleMouseMove = (e: any) => {
    if (mode === "pan" && dragStart.current && containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
      const stage = stageRef.current;
      const pos = e.target.getStage().getPointerPosition();
      if (stage && pos) {
        const dx = pos.x - dragStart.current.x;
        const dy = pos.y - dragStart.current.y;
        stage.x(stage.x() + dx);
        stage.y(stage.y() + dy);
        dragStart.current = pos;
      }
    }
  };
  const handleMouseUp = () => {
    dragStart.current = null;
    if (containerRef.current)
      containerRef.current.style.cursor = mode === "pan" ? "grab" : "default";
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    const onDropImage = e.dataTransfer.getData("image/list-id");
    if (!file || !onDropImage) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top * 2;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = transform.point({
      x: pointerX,
      y: pointerY,
    });
    insertImageFromList(onDropImage, side, pos.x, pos.y);
  };
  useEffect(() => {
    clearSelection();
  }, [side]);
  const [flipX, setFlipX] = useState(scale);
  useEffect(() => {
    setFlipX(side === "inner" ? -scale : scale);
  }, [side, scale]);
  const rotate = (dir: "cw" | "ccw") =>
    setRotation((r) => (dir === "cw" ? r + 90 : r - 90));
  const scaleBy = 1.1;
  const zoomIn  = () => setScale((s) => Math.min(s * scaleBy, 2));
  const zoomOut = () => setScale((s) => Math.max(s / scaleBy, 0.8));
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    e.evt.deltaY < 0
      ? setScale((s) => Math.min(s * 1.01, 2))
      : setScale((s) => Math.max(s / 1.01, 0.8));
  };
  const switchMode = (newMode: ToolMode) => {
    setMode(newMode);
    setSelectedId(null);
  };
  const handleSelect = (id: string) => {
    setSelectedId(id);
  };
  const handleTextDblClick = (id: string) => {
    setSelectedId(id);
    setIsVisible(true);
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "v" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        switchMode("select");
      }
      if (e.key.toLowerCase() === "h" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        switchMode("pan");
      }
      if ((e.key === "=" || e.key === "+") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        zoomIn();
      }
      if (e.key === "-" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        zoomOut();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [switchMode, zoomIn, zoomOut]);
  const width = 800 * 0.45;
  const height = 500 * 0.4;
  const exportGroupRef = useRef<Konva.Group>(null);
  const mainGroupRef = useRef<Konva.Group>(null);
  const setTexture = useDesignStore((s) => s.setTexture);
  const doExport = () => {
    if (!exportGroupRef.current || !mainGroupRef.current) return;
    exportModelTextures({
      drag: stageRef.current,
      model,
      main: mainGroupRef.current,
      group: exportGroupRef.current,
      width,
      height,
      side,
      setTexture,
    });
  };
  const faceColors = useDesignStore((s) => s.faceColors);
  useEffect(() => {
    if (images.length > 0) {
      setTimeout(() => {
        doExport();
      }, 50);
      return;
    }
    doExport();
  }, [texts, images, printing1, side, faceColors]);
  const updateText = useDesignStore((s) => s.updateText);
  const updateImage = useDesignStore((s) => s.updateImage);
  const holes = model.getHoles();
  const shapeMap = model.getShapes();
  const shapeEntries = Object.entries(shapeMap) as [string, Boundary[]][];
  return (
    <div className="flex-1 overflow-hidden flex items-center justify-center h-full relative">
      <div
        ref={containerRef}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="w-full h-full relative bg-gray-200"
      >
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onClick={(e) => {
            if (e.target === e.target.getStage()) setSelectedId(null);
          }}
        >
          <Layer>
            <Group
              ref={mainGroupRef}
              scaleX={flipX}
              scaleY={scale}
              rotation={rotation}
              x={size.width / 2}
              y={size.height / 2}
              offsetX={width}
              offsetY={height}
            >
              <ModelRenderer model={model} side={side} />
              <FacecolorHitnhoverRender shapeEntries={shapeEntries} />
              <Group ref={exportGroupRef}>
                <FacecolorFillRender
                  main={mainGroupRef.current!}
                  mode={mode}
                  side={side}
                  shapeEntries={shapeEntries}
                />
                {texts
                  .filter((el) => el.side === side)
                  .map((el) => (
                    <CanvasTextItem
                      key={el.id}
                      el={el}
                      mode={mode}
                      flip={flipX}
                      // dielineGuides={dielineGuides}
                      // setGuides={setGuides}
                      onSelect={handleSelect}
                      onDblClick={handleTextDblClick}
                      updateText={updateText}
                    />
                  ))}
                {images
                  .filter((el) => el.side === side && el.visible !== false) // hanya tampilkan yang visible
                  .map((el) => (
                    <CanvasImageItem
                      key={el.id}
                      el={el}
                      mode={mode}
                      flip={flipX}
                      printing={printing1}
                      setSelectedId={handleSelect}
                      updateImage={updateImage}
                      // dielineGuides={dielineGuides}
                      // setGuides={setGuides}
                    />
                  ))}
                <HolesRender holes={holes} />
              </Group>
              <HolesOutlineRender holes={holes} />
              {selectedId && mode === "select" && (
                <>
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 20 || newBox.height < 20) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                  {deletePos && (
                    <Group
                      x={deletePos.x}
                      y={deletePos.y}
                      onClick={() => {
                        removeImage(selectedId);
                        removeText(selectedId);
                        clearSelection();
                      }}
                    >
                      <Circle
                        radius={10}
                        fill="red"
                        stroke="white"
                        strokeWidth={2}
                      />
                      <Text
                        text="×"
                        fontSize={30}
                        fill="white"
                        align="center"
                        verticalAlign="middle"
                        offsetX={8.5}
                        offsetY={15}
                      />
                    </Group>
                  )}
                </>
              )}
            </Group>
          </Layer>
        </Stage>
        {(modelBox === "shopping" ||
          modelBox === "mailer" ||
          modelBox === "shipping" ||
          pw[side] ||
          printing1[side] === "blok" ||
          printing2[side] === "blok") &&
          material.outer.id !== "20" && (
          <FacecolorPopover side={side} />
        )}
      </div>
      <RighttopButton
        mode={mode}
        switchMode={switchMode}
        rotate={rotate}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
      />
    </div>
  );
}