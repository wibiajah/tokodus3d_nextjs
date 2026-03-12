"use client";
import React, { useEffect, useRef, useState } from "react";
import { TrackballControls } from "@react-three/drei";
import * as THREE from "three";
import { useDesignStore } from "@/store/design-store";
import { ThreeCanvas } from "./canvas";
import ModelRenderer from "./model-render";
import SandboxFlap from "../sandbox/decal-sandbox";
import Slider3D from "../design/slider-3d";
interface ThreePreviewProps {
  isFooter?: boolean;
}
export default function ThreePreview({ isFooter = false }: ThreePreviewProps) {
  const mode = useDesignStore((s) => s.mode);
  const innerColor = useDesignStore((s) => s.innerColor);
  const outerColor = useDesignStore((s) => s.outerColor);
  const size = useDesignStore((s) => s.size);
  const openClose = useDesignStore((s) => s.openClose);
  const model = useDesignStore((s) => s.model);
  const controlsRef = useRef<any>(null);
  const min = 1.5;
  const max = 4.0;
  const initialDistRef = useRef<number>(
    new THREE.Vector3(0.5, 0.5, 5).distanceTo(new THREE.Vector3(0, 0, 0)), // hitung langsung
  );
  function zoomCamera(factor: number) {
    const controls = controlsRef.current;
    if (!controls) return;
    const cam: THREE.PerspectiveCamera = controls.object;
    const target: THREE.Vector3 = controls.target;
    const dir = new THREE.Vector3().subVectors(cam.position, target);
    const currentDist = dir.length();
    const newDist = currentDist * factor;
    const minDist = initialDistRef.current / min;
    const maxDist = initialDistRef.current * max;
    if (newDist >= minDist && newDist <= maxDist) {
      const newDir = dir.multiplyScalar(factor);
      cam.position.copy(new THREE.Vector3().addVectors(target, newDir));
      cam.updateProjectionMatrix();
      controls.update?.();
    }
  }
  const cm = 0.1;
  const l = size.length * cm;
  const w = size.width * cm;
  const h = size.height * cm;
  const t = size.depth * cm;
  return (
    <div className="h-full w-full relative">
      <ThreeCanvas>
        <ModelRenderer
          model={model}
          l={l}
          w={w}
          h={h}
          t={t}
          innerColor={innerColor}
          outerColor={outerColor}
          openClose={openClose}
        />
        {/* <SandboxFlap /> */}
        <TrackballControls
          ref={controlsRef}
          rotateSpeed={2.5}
          panSpeed={2.0}
          zoomSpeed={3.0}
          minDistance={initialDistRef.current / min}
          maxDistance={initialDistRef.current * max}
          staticMoving={true}
        />
      </ThreeCanvas>
      {mode === "2d" && <Slider3D isFooter={isFooter} />}
      {mode === "3d" && (
        <div className="absolute right-3 top-30 z-10 flex flex-col gap-2">
          <button
            className="rounded-md border bg-background/90 px-3 py-2 text-sm shadow-sm"
            onClick={() => zoomCamera(0.95)}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            className="rounded-md border bg-background/90 px-3 py-2 text-sm shadow-sm"
            onClick={() => zoomCamera(1.05)}
            aria-label="Zoom out"
          >
            −
          </button>
        </div>
      )}
    </div>
  );
}