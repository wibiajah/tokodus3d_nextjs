"use client";

import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useDesignStore } from "@/store/design-store";
import CorrugatedBox from "./box";
import { Slider } from "../ui/slider";
import SandboxFlap from "./sandbox";

export default function ThreePreview() {
  const mode = useDesignStore((s) => s.mode);
  const boxColor = useDesignStore((s) => s.boxColor);
  const size = useDesignStore((s) => s.size);
  const openClose = useDesignStore((s) => s.openClose);
  const setOpenClose = useDesignStore((s) => s.setOpenClose);

  const controlsRef = useRef<any>(null);

  function zoomCamera(factor: number) {
    const controls = controlsRef.current;
    if (!controls) return;
    const cam: THREE.PerspectiveCamera = controls.object;
    const target: THREE.Vector3 = controls.target;
    const dir = new THREE.Vector3().subVectors(cam.position, target);
    const newDir = dir.multiplyScalar(factor);
    cam.position.copy(new THREE.Vector3().addVectors(target, newDir));
    cam.updateProjectionMatrix();
    controls.update?.();
  }

  const cm = 0.1;
  const l = size.length * cm;
  const w = size.width * cm;
  const h = size.height * cm;
  const t = size.depth * cm;

  return (
    <div className="h-full w-full relative">
      <Canvas
        camera={{ position: [0.5, 0.5, 5], fov: 45 }}
        // camera={{ position: [0.5, 0.5, 0.1], fov: 45 }}
        gl={{ localClippingEnabled: true }}
        // onCreated={(state) => (state.gl.localClippingEnabled = true)}
      >
        {/* Lighting and env */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 2]} intensity={0.7} />

        {/* <Environment preset="studio" /> */}

        {/* Ground */}
        {/* <mesh rotation-x={-Math.PI / 2} position={[0, -0.6, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#e6e6e6" />
        </mesh> */}

        {/* Box corrugated */}
        <CorrugatedBox
          l={l}
          w={w}
          h={h}
          t={t}
          boxColor={boxColor}
          openClose={openClose}
        />

        {/* <SandboxFlap /> */}
        <OrbitControls
          ref={controlsRef}
          enablePan
          enableZoom
          enableRotate
          minDistance={1.5}
          maxDistance={10}
        />
      </Canvas>

      {/* Overlay control: open/close slider */}
      <div className="absolute left-1/2 bottom-3 z-10 -translate-x-1/2 rounded-md border bg-background/90 px-3 py-2 text-xs shadow-sm text-center">
        {/* Persentase di atas */}
        <div className="mb-1">{Math.round(openClose * 100)}%</div>

        {/* Slider + Label kiri/kanan */}
        <div className="flex items-center gap-2">
          <span className="w-8 text-left text-muted-foreground">Buka</span>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[Math.round(openClose * 100)]}
            onValueChange={(v) => setOpenClose(v[0] / 100)}
            className="w-40"
            aria-label="Open/Close lid"
          />
          <span className="w-8 text-right text-muted-foreground">Tutup</span>
        </div>
      </div>

      {mode === "3d" && (
        <div className="absolute right-3 top-30 z-10 flex flex-col gap-2">
          <button
            className="rounded-md border bg-background/90 px-3 py-2 text-sm shadow-sm"
            onClick={() => zoomCamera(0.85)}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            className="rounded-md border bg-background/90 px-3 py-2 text-sm shadow-sm"
            onClick={() => zoomCamera(1.15)}
            aria-label="Zoom out"
          >
            −
          </button>
        </div>
      )}
    </div>
  );
}
