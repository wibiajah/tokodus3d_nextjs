"use client";
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  Stage,
  Layer,
  Line,
  Text,
  Image as KonvaImage,
  Transformer,
  Arc,
  Group,
  Rect,
} from "react-konva";
import { Button } from "@/components/ui/button";
import { MousePointer, Hand, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import Konva from "konva";
import {
  MaterialType,
  TextItem,
  TextureItem,
  useDesignStore,
} from "@/store/design-store";
import useImage from "use-image";
import generateDieline from "./dieline-model";
import CanvasImageItem from "./konva-image-render";
import CanvasTextItem from "./konva-text-render";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
type ToolMode = "select" | "pan";
const CorrugatedBoxDielineKonva: React.FC = () => {
  const loadImages = useDesignStore((s) => s.loadImagesFromStorage);
  const loadListImages = useDesignStore((s) => s.loadListImagesFromStorage);
  useEffect(() => {
    loadImages();
    loadListImages();
  }, [loadImages, loadListImages]);
  const [mode, setMode] = useState<ToolMode>("select");
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({
    x: [],
    y: [],
  });
  const boxColor = useDesignStore((s) => s.boxColor);
  const side = useDesignStore((s) => s.side);
  const setSide = useDesignStore((s) => s.setSide);
  const texts = useDesignStore((s) => s.texts);
  const selectedId = useDesignStore((s) => s.selectedId);
  const setSelectedId = useDesignStore((s) => s.setSelectedId);
  const setIsVisible = useDesignStore((s) => s.setIsVisible);
  const updateText = useDesignStore((s) => s.updateText);
  const removeText = useDesignStore((s) => s.removeText);
  const material = useDesignStore((s) => s.material);
  const textureMap: Record<string, string> = {
    brown_kraft: "/textures/carton.png",
    white_kraft: "/textures/white.png",
    premium_white: "/textures/white.png",
  };
  const selected = {
    inner: textureMap[material.inner.id] ?? textureMap["brown_kraft"],
    outer: textureMap[material.outer.id] ?? textureMap["brown_kraft"],
  };
  const [imageInner] = useImage(selected.inner);
  const [imageOuter] = useImage(selected.outer);
  const printing = useDesignStore((s) => s.printing);
  const imageRef = useRef(null);
  const images = useDesignStore((s) => s.images);
  const removeImage = useDesignStore((s) => s.removeImage);
  const updateImage = useDesignStore((s) => s.updateImage);
  const size = useDesignStore((s) => s.size);
  const sizeScale = 10;
  const boxDimensions = {
    length: size.length * sizeScale,
    width: size.width * sizeScale,
    height: size.height * sizeScale,
    depth: size.depth * sizeScale,
  };
  const startX = useDesignStore((s) => s.startX);
  const startY = useDesignStore((s) => s.startY);
  const fixedFlap = useDesignStore((s) => s.fixedFlap);
  const saveMargin = fixedFlap * 0.5;
  const s = Math.min(boxDimensions.length, boxDimensions.width);
  const widthStage = 800;
  const heightStage = 500;
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    const stage = stageRef.current;
    const applySelection = () => {
      if (!selectedId) {
        transformerRef.current!.nodes([]);
        transformerRef.current!.getLayer()?.batchDraw();
        return;
      }
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current!.nodes([selectedNode]);
        transformerRef.current!.getLayer()?.batchDraw();
      } else {
        transformerRef.current!.nodes([]);
        transformerRef.current!.getLayer()?.batchDraw();
      }
    };
    applySelection();
    const handleDelete = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedId) {
        // Hanya sembunyikan (tidak menghapus dari storage)
        removeImage(selectedId);
        removeText(selectedId);
        clearSelection();
      }
    };
    window.addEventListener("keydown", handleDelete);
    return () => {
      window.removeEventListener("keydown", handleDelete);
    };
  }, [selectedId, removeImage]);
  const clearSelection = () => {
    transformerRef.current?.nodes([]);
    transformerRef.current?.getLayer()?.batchDraw();
    setSelectedId(null);
  };
  const dielinePaths = generateDieline(
    boxDimensions,
    startX,
    startY,
    fixedFlap,
    scale
  );
  const dielineGuides = React.useMemo(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    dielinePaths.path.forEach((p) => {
      for (let i = 0; i < p.points.length; i += 2) {
        xs.push(p.points[i]);
        ys.push(p.points[i + 1]);
      }
    });
    return {
      x: Array.from(new Set(xs)),
      y: Array.from(new Set(ys)),
    };
  }, [dielinePaths]);
  const handleTextDblClick = (id: string) => {
    setSelectedId(id);
    setIsVisible(true);
  };
  const switchMode = (newMode: ToolMode) => {
    setMode(newMode);
    setSelectedId(null);
  };
  const rotate = (dir: "cw" | "ccw") =>
    setRotation((r) => (dir === "cw" ? r + 90 : r - 90));
  const zoomIn = () => setScale((s) => Math.min(s * 1.2, 2));
  const zoomOut = () => setScale((s) => Math.max(s / 1.2, 0.8));
  const handleMouseDown = (e: any) => {
    if (mode === "pan") {
      const pos = e.target.getStage().getPointerPosition();
      if (pos) dragStart.current = pos;
    }
  };
  const handleMouseUp = () => {
    dragStart.current = null;
  };
  const handleSelectText = (id: string) => {
    setSelectedId(id);
  };
  const handleSelectImage = (id: string) => {
    setSelectedId(id);
  };
  const handleMouseMove = (e: any) => {
    if (mode === "pan" && dragStart.current) {
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
  const backTopRef = useRef<Konva.Group>(null);
  const backRef = useRef<Konva.Group>(null);
  const backBottomRef = useRef<Konva.Group>(null);
  const rightTopRef = useRef<Konva.Group>(null);
  const rightRef = useRef<Konva.Group>(null);
  const rightBottomRef = useRef<Konva.Group>(null);
  const frontTopRef = useRef<Konva.Group>(null);
  const frontRef = useRef<Konva.Group>(null);
  const frontBottomRef = useRef<Konva.Group>(null);
  const leftTopRef = useRef<Konva.Group>(null);
  const leftRef = useRef<Konva.Group>(null);
  const leftBottomRef = useRef<Konva.Group>(null);
  const fixedRef = useRef<Konva.Group>(null);
  const setTexture = useDesignStore((s) => s.setTexture);
  const exportGroupRef = useRef<Konva.Group>(null);
  const designGroupRef = useRef<Konva.Group>(null);
  const refs = {
    back_top: backTopRef,
    back: backRef,
    back_bottom: backBottomRef,
    right_top: rightTopRef,
    right: rightRef,
    right_bottom: rightBottomRef,
    front_top: frontTopRef,
    front: frontRef,
    front_bottom: frontBottomRef,
    left_top: leftTopRef,
    left: leftRef,
    left_bottom: leftBottomRef,
    fixed: fixedRef,
  };
  const whenKonvaReady = (callback: () => void) => {
    callback();
  };
  const renderTexture = () => {
    const group = exportGroupRef.current;
    const dgroup = designGroupRef.current;
    if (!group || !dgroup || images.length === 0) return;
    const original = {
      rotation: dgroup.rotation(),
      scaleX: dgroup.scaleX(),
      scaleY: dgroup.scaleY(),
      x: dgroup.x(),
      y: dgroup.y(),
    };
    dgroup.rotation(0);
    // dgroup.scaleX(1);
    dgroup.scaleX(flipX);
    dgroup.scaleY(1);
    dgroup.x(0);
    dgroup.y(0);
    whenKonvaReady(() => {
      Object.entries(refs).forEach(([key, ref]) => {
        const node = ref.current;
        if (!node) return;
        const rect = node.getClientRect();
        const uri = group.toDataURL({
          pixelRatio: 2,
          x: rect.x,
          y: rect.y,
          width:
            key === "left_top" || key === "left_bottom"
              ? rect.width + boxDimensions.depth
              : rect.width, // correct
          height: rect.height,
        });
        const item: TextureItem = {
          id: key,
          design: uri,
          side,
        };
        setTexture(item);
      });
      dgroup.rotation(original.rotation);
      dgroup.scaleX(original.scaleX);
      dgroup.scaleY(original.scaleY);
      dgroup.x(original.x);
      dgroup.y(original.y);
    });
  };
  useEffect(() => {
    if (images.length > 0) {
      setTimeout(() => {
        renderTexture();
      }, 50);
      return;
    }
    renderTexture();
  }, [texts, images, printing]);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const insertImageFromList = useDesignStore((s) => s.insertImageFromList);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!stageContainerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setStageSize({ width, height });
    });

    observer.observe(stageContainerRef.current);
    return () => observer.disconnect();
  }, []);
  const [flipX, setFlipX] = useState(scale);
  useEffect(() => {
    setFlipX(side === "inner" ? -scale : scale);
  }, [side]);
  return (
    // <div className="relative flex flex-col h-full bg-gray-100">
    <div className="flex-1 overflow-hidden flex items-center justify-center h-full relative">
      <div
        ref={stageContainerRef}
        // className="relative"
        className="w-full h-full relative bg-gray-200"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const listId = e.dataTransfer.getData("image/list-id");
          if (!listId) return;
          const stage = stageRef.current;
          if (!stage) return;
          const rect = stageContainerRef.current!.getBoundingClientRect();
          // posisi mouse relatif ke container
          const pointerX = e.clientX - rect.left;
          const pointerY = e.clientY - rect.top * 2;
          // konversi ke koordinat Konva (memperhitungkan scale & posisi)
          const transform = stage.getAbsoluteTransform().copy();
          transform.invert();
          const pos = transform.point({
            x: pointerX,
            y: pointerY,
          });
          insertImageFromList(listId, side, pos.x, pos.y);
        }}
      >
        <Stage
          ref={stageRef}
          // width={widthStage}
          // height={heightStage}
          width={stageSize.width}
          height={stageSize.height}
          // scaleX={scale}
          // scaleY={scale}
          // x={widthStage / 2} // pindahkan pivot ke tengah
          // y={heightStage / 2}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={(e) => {
            if (e.target === e.target.getStage()) setSelectedId(null);
          }}
        >
          <Layer id="main">
            <Group
              ref={designGroupRef}
              rotation={rotation}
              // offsetX={widthStage / 2} // setengah dari width
              // offsetY={heightStage / 2} // setengah dari height
              // x={widthStage / 2} // pindahkan pivot ke tengah
              // y={heightStage / 2}
              x={stageSize.width / 2}
              y={stageSize.height / 2}
              offsetX={widthStage / 2}
              offsetY={heightStage / 2}
              // scaleX={scale}
              scaleX={flipX}
              scaleY={scale}
            >
              {(side === "inner" ? imageInner : imageOuter) && (
                <Group
                  name="clip"
                  clipFunc={(ctx: any) => {
                    const boundary = dielinePaths.boundary;
                    if (!boundary || boundary.length < 4) return;
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(boundary[0], boundary[1]);
                    for (let i = 2; i < boundary.length; i += 2) {
                      ctx.lineTo(boundary[i], boundary[i + 1]);
                    }
                    ctx.closePath();
                    ctx.restore();
                  }}
                >
                  <KonvaImage
                    image={side === "inner" ? imageInner : imageOuter}
                    x={startX - fixedFlap - saveMargin}
                    y={startY}
                    width={
                      fixedFlap +
                      2 * (boxDimensions.length + boxDimensions.width) +
                      9 * boxDimensions.depth
                    }
                    height={4 * boxDimensions.depth + boxDimensions.height + s}
                    ref={imageRef}
                    listening={false} // penting: biar clip tidak ganggu event
                  />
                  {/* COLOR OVERLAY with MULTIPLY */}
                  <Rect
                    x={startX - fixedFlap - saveMargin}
                    y={startY}
                    width={
                      fixedFlap +
                      2 * (boxDimensions.length + boxDimensions.width) +
                      9 * boxDimensions.depth
                    }
                    height={4 * boxDimensions.depth + boxDimensions.height + s}
                    fill={boxColor}
                    globalCompositeOperation="multiply"
                    listening={false}
                  />
                </Group>
              )}
              <Group ref={backTopRef}>
                {dielinePaths.backTopLines.map((path, i) => {
                  return (
                    <Line
                      key={i}
                      points={path.points}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      dash={path.dash}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                  );
                })}
              </Group>
              <Group ref={backRef}>
                {dielinePaths.backLines.map((path, i) => {
                  return (
                    <Line
                      key={i}
                      points={path.points}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      dash={path.dash}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                  );
                })}
                {dielinePaths.backArcs.map((arc, i) => {
                  return (
                    <Arc
                      key={i}
                      x={arc.x}
                      y={arc.y}
                      innerRadius={arc.radius || 0}
                      outerRadius={arc.radius || 0}
                      angle={arc.angle || 0}
                      rotation={arc.rotation}
                      stroke={arc.stroke}
                      strokeWidth={arc.strokeWidth}
                      dash={arc.dash}
                      listening={false}
                    />
                  );
                })}
              </Group>
              <Group ref={backBottomRef}>
                {dielinePaths.backBottomLines.map((path, i) => {
                  return (
                    <Line
                      key={i}
                      points={path.points}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      dash={path.dash}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                  );
                })}
              </Group>
              <Group ref={rightTopRef}>
                {dielinePaths.rightTopLines.map((path, i) => {
                  return (
                    <Line
                      key={i}
                      points={path.points}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      dash={path.dash}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                  );
                })}
                {dielinePaths.rightTopArcs.map((arc, i) => {
                  return (
                    <Arc
                      key={i}
                      x={arc.x}
                      y={arc.y}
                      innerRadius={arc.radius || 0}
                      outerRadius={arc.radius || 0}
                      angle={arc.angle || 0}
                      rotation={arc.rotation}
                      stroke={arc.stroke}
                      strokeWidth={arc.strokeWidth}
                      dash={arc.dash}
                      listening={false}
                    />
                  );
                })}
              </Group>
              <Group ref={rightRef}>
                {dielinePaths.rightLines.map((path, i) => {
                  return (
                    <Line
                      key={i}
                      points={path.points}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      dash={path.dash}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                  );
                })}
              </Group>
              <Group ref={rightBottomRef}>
                {dielinePaths.rightBottomLines.map((path, i) => {
                  return (
                    <Line
                      key={i}
                      points={path.points}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      dash={path.dash}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                  );
                })}
                {dielinePaths.rightBottomArcs.map((arc, i) => {
                  return (
                    <Arc
                      key={i}
                      x={arc.x}
                      y={arc.y}
                      innerRadius={arc.radius || 0}
                      outerRadius={arc.radius || 0}
                      angle={arc.angle || 0}
                      rotation={arc.rotation}
                      stroke={arc.stroke}
                      strokeWidth={arc.strokeWidth}
                      dash={arc.dash}
                      listening={false}
                    />
                  );
                })}
              </Group>
              <Group ref={frontTopRef}>
                {dielinePaths.frontTopLines.map((path, i) => {
                  return (
                    <Line
                      key={i}
                      points={path.points}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      dash={path.dash}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                  );
                })}
              </Group>
              <Group ref={frontRef}>
                {dielinePaths.frontLines.map((path, i) => {
                  return (
                    <Line
                      key={i}
                      points={path.points}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      dash={path.dash}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                  );
                })}
                {dielinePaths.frontArcs.map((arc, i) => {
                  return (
                    <Arc
                      key={i}
                      x={arc.x}
                      y={arc.y}
                      innerRadius={arc.radius || 0}
                      outerRadius={arc.radius || 0}
                      angle={arc.angle || 0}
                      rotation={arc.rotation}
                      stroke={arc.stroke}
                      strokeWidth={arc.strokeWidth}
                      dash={arc.dash}
                      listening={false}
                    />
                  );
                })}
              </Group>
              <Group ref={frontBottomRef}>
                {dielinePaths.frontBottomLines.map((path, i) => {
                  return (
                    <Line
                      key={i}
                      points={path.points}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      dash={path.dash}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                  );
                })}
              </Group>
              <Group ref={leftTopRef}>
                {dielinePaths.leftTopLines.map((path, i) => {
                  return (
                    <Line
                      key={i}
                      points={path.points}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      dash={path.dash}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                  );
                })}
                {dielinePaths.leftTopArcs.map((arc, i) => {
                  return (
                    <Arc
                      key={i}
                      x={arc.x}
                      y={arc.y}
                      innerRadius={arc.radius || 0}
                      outerRadius={arc.radius || 0}
                      angle={arc.angle || 0}
                      rotation={arc.rotation}
                      stroke={arc.stroke}
                      strokeWidth={arc.strokeWidth}
                      dash={arc.dash}
                      listening={false}
                    />
                  );
                })}
              </Group>
              <Group ref={leftRef}>
                {dielinePaths.leftLines.map((path, i) => {
                  return (
                    <Line
                      key={i}
                      points={path.points}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      dash={path.dash}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                  );
                })}
              </Group>
              <Group ref={leftBottomRef}>
                {dielinePaths.leftBottomLines.map((path, i) => {
                  return (
                    <Line
                      key={i}
                      points={path.points}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      dash={path.dash}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                  );
                })}
                {dielinePaths.leftBottomArcs.map((arc, i) => {
                  return (
                    <Arc
                      key={i}
                      x={arc.x}
                      y={arc.y}
                      innerRadius={arc.radius || 0}
                      outerRadius={arc.radius || 0}
                      angle={arc.angle || 0}
                      rotation={arc.rotation}
                      stroke={arc.stroke}
                      strokeWidth={arc.strokeWidth}
                      dash={arc.dash}
                      listening={false}
                    />
                  );
                })}
              </Group>
              <Group ref={fixedRef}>
                {dielinePaths.fixedFlapLines.map((path, i) => {
                  return (
                    <Line
                      key={i}
                      points={path.points}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      dash={path.dash}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                  );
                })}
              </Group>
              {dielinePaths.path.map((path, i) => {
                return (
                  <Line
                    key={i}
                    points={path.points}
                    stroke={path.stroke}
                    strokeWidth={path.strokeWidth}
                    dash={path.dash}
                    lineCap="round"
                    lineJoin="round"
                    listening={false}
                  />
                );
              })}
              {/* dimensions */}
              {/* <Line
                  points={[
                    dielinePaths.dimensions.widthLine.start.x,
                    dielinePaths.dimensions.lengthLine.start.y + 2,
                    dielinePaths.dimensions.widthLine.end.x,
                    dielinePaths.dimensions.lengthLine.end.y + 2,
                  ]}
                  stroke="red"
                  listening={false}
                />
                <Line
                  points={[
                    dielinePaths.dimensions.lengthLine.start.x +
                      dielinePaths.dimensions.widthLine.value +
                      dielinePaths.dimensions.lengthLine.value,
                    dielinePaths.dimensions.lengthLine.start.y + 4,
                    dielinePaths.dimensions.lengthLine.end.x +
                      dielinePaths.dimensions.widthLine.value +
                      dielinePaths.dimensions.lengthLine.value,
                    dielinePaths.dimensions.lengthLine.end.y + 4,
                  ]}
                  stroke="green"
                  listening={false}
                />
                <Line
                  points={[
                    dielinePaths.dimensions.widthLine.start.x +
                      dielinePaths.dimensions.lengthLine.value +
                      +dielinePaths.dimensions.widthLine.value,
                    dielinePaths.dimensions.lengthLine.start.y + 6,
                    dielinePaths.dimensions.widthLine.end.x +
                      dielinePaths.dimensions.lengthLine.value +
                      +dielinePaths.dimensions.widthLine.value,
                    dielinePaths.dimensions.lengthLine.end.y + 6,
                  ]}
                  stroke="yellow"
                  listening={false}
                /> */}
              <Group id="legend">
                <Line
                  points={[
                    dielinePaths.dimensions.lengthLine.start.x,
                    dielinePaths.dimensions.lengthLine.start.y,
                    dielinePaths.dimensions.lengthLine.end.x,
                    dielinePaths.dimensions.lengthLine.end.y,
                  ]}
                  stroke="blue"
                  listening={false}
                />
                <Text
                  text={`${dielinePaths.dimensions.lengthLine.label} ${dielinePaths.dimensions.lengthLine.value} mm`}
                  x={
                    (dielinePaths.dimensions.lengthLine.start.x +
                      dielinePaths.dimensions.lengthLine.end.x) /
                    2
                  }
                  y={dielinePaths.dimensions.lengthLine.start.y + 3}
                  fontSize={12}
                  fill="blue"
                  listening={false}
                  scaleX={flipX}
                />
                <Line
                  points={[
                    dielinePaths.dimensions.widthLine.start.x,
                    dielinePaths.dimensions.widthLine.start.y,
                    dielinePaths.dimensions.widthLine.end.x,
                    dielinePaths.dimensions.widthLine.end.y,
                  ]}
                  stroke="blue"
                  listening={false}
                />
                <Text
                  text={`${dielinePaths.dimensions.widthLine.label} ${dielinePaths.dimensions.widthLine.value} mm`}
                  x={
                    (dielinePaths.dimensions.widthLine.start.x +
                      dielinePaths.dimensions.widthLine.end.x) /
                    2
                  }
                  y={dielinePaths.dimensions.widthLine.start.y + 3}
                  fontSize={12}
                  fill="blue"
                  listening={false}
                  scaleX={flipX}
                />
                <Line
                  points={[
                    dielinePaths.dimensions.heightLine.start.x,
                    dielinePaths.dimensions.heightLine.start.y,
                    dielinePaths.dimensions.heightLine.end.x,
                    dielinePaths.dimensions.heightLine.end.y,
                  ]}
                  stroke="blue"
                  listening={false}
                />
                <Text
                  text={`${dielinePaths.dimensions.heightLine.label} ${dielinePaths.dimensions.heightLine.value} mm`}
                  x={dielinePaths.dimensions.heightLine.start.x + 3}
                  y={
                    (dielinePaths.dimensions.heightLine.start.y +
                      dielinePaths.dimensions.heightLine.end.y) /
                    2
                  }
                  fontSize={12}
                  fill="blue"
                  listening={false}
                  scaleX={flipX}
                />
              </Group>
              {guides.x.map((x) => (
                <Line
                  key={`x-${x}`}
                  points={[x, 0, x, heightStage]}
                  stroke="red"
                  dash={[4, 4]}
                  strokeWidth={1}
                  listening={false}
                />
              ))}
              {guides.y.map((y) => (
                <Line
                  key={`y-${y}`}
                  points={[0, y, widthStage, y]}
                  stroke="red"
                  dash={[4, 4]}
                  strokeWidth={1}
                  listening={false}
                />
              ))}
              <Group ref={exportGroupRef}>
                {texts
                  .filter((el) => el.side === side)
                  .map((el) => (
                    <CanvasTextItem
                      key={el.id}
                      el={el}
                      mode={mode}
                      flip={flipX}
                      dielineGuides={dielineGuides}
                      setGuides={setGuides}
                      onSelect={handleSelectText}
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
                      printing={printing}
                      setSelectedId={handleSelectImage}
                      updateImage={updateImage}
                      dielineGuides={dielineGuides}
                      setGuides={setGuides}
                    />
                  ))}
              </Group>
              {selectedId && mode === "select" && (
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                />
              )}
            </Group>
          </Layer>
        </Stage>
      </div>
      <div className="absolute right-4 top-12 flex flex-col gap-2 z-50">
        <Button
          variant={mode === "select" ? "default" : "outline"}
          size="icon"
          onClick={() => switchMode("select")}
          title="Select Mode"
        >
          <MousePointer size={18} />
        </Button>
        <Button
          variant={mode === "pan" ? "default" : "outline"}
          size="icon"
          onClick={() => switchMode("pan")}
          title="Pan Mode"
        >
          <Hand size={18} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => rotate("cw")}
          title="Rotate Right"
        >
          <RotateCw size={18} />
        </Button>
        <Button variant="outline" size="icon" onClick={zoomIn} title="Zoom In">
          <ZoomIn size={18} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={zoomOut}
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </Button>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex rounded-md overflow-hidden shadow">
        {/* {material[side].id === "brown_kraft" || material[side].id === "white_kraft" ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={side === "inner" ? "secondary" : "default"}
                  className="rounded-none"
                  // disabled
                >
                  Sisi Dalam
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Material Brown Kraft atau White Kraft hanya bisa cetak sisi luar
              </TooltipContent>
            </Tooltip>
          ) : ( */}
        <Button
          variant={side === "inner" ? "secondary" : "default"}
          onClick={() => {
            if (side !== "inner") {
              // clearSelection();
              setSide("inner");
            }
          }}
          className="rounded-none"
          disabled={side === "inner"}
        >
          Sisi Dalam
        </Button>
        {/* )} */}
        <Button
          variant={side === "outer" ? "secondary" : "default"}
          onClick={() => {
            if (side !== "outer") {
              // clearSelection();
              setSide("outer");
            }
          }}
          className="rounded-none"
          disabled={side === "outer"}
        >
          Sisi Luar
        </Button>
      </div>
    </div>
    // </div>
  );
};
export default CorrugatedBoxDielineKonva;
