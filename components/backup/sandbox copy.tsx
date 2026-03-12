import { MaterialType, useDesignStore } from "@/store/design-store";
import { Text, useTexture } from "@react-three/drei";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { createRoundedChannelPlanes } from "./utility";
import { a } from "@react-spring/three";
import { PlaneHelper } from "./box";
import { useFrame } from "@react-three/fiber";

// export default function SandboxFlap() {
//   // init variabel
//   const w = 2;
//   const h = 2;
//   const t = 0.03;
//   const c = "fff";
//   const f = "back";
//   const l = 2;
//   const boxW = 2;
//   const boxH = 2;
//   const s = 2;
//   const p = [0, 0, 0] as [number, number, number];
//   const rx = 0;
//   const ry = 0;
//   const rz = 0;
//   const o = [0, 0, 0] as [number, number, number];
//   const mrx = 0;
//   const mry = 0;
//   const mrz = 0;
//   const startX = useDesignStore((s) => s.startX);
//   const startY = useDesignStore((s) => s.startY);
//   const texts = useDesignStore((s) => s.texts);
//   const material = useDesignStore((s) => s.material);

//   const radius = 0.5; // radius sudut bawah melengkung

//    // === ⛏️ Membuat bentuk flap (Shape) ===
//   const flapShape = useMemo(() => {
//     const shape = new THREE.Shape();
//     const halfW = w / 2;

//     // Mulai dari kiri atas
//     shape.moveTo(-halfW, 0);

//     // Garis vertikal kiri
//     shape.lineTo(-halfW, -h + radius);

//     // Sudut kiri bawah melengkung (1/4 lingkaran)
//     shape.absarc(-halfW + radius, -h + radius, radius, Math.PI, Math.PI / 2, true);

//     // Garis bawah (antara dua lengkungan)
//     shape.lineTo(halfW - radius, -h);

//     // Sudut kanan bawah melengkung
//     shape.absarc(halfW - radius, -h + radius, radius, Math.PI / 2, 0, true);

//     // Garis vertikal kanan
//     shape.lineTo(halfW, 0);

//     // Tutup shape
//     shape.lineTo(-halfW, 0);

//     return shape;
//   }, [w, h, radius]);

//   // === Membuat geometry extrude ===
//   const extrudeGeom = useMemo(() => {
//     return new THREE.ExtrudeGeometry(flapShape, {
//       depth: t,
//       bevelEnabled: false,
//     });
//   }, [flapShape, t]);

//   const textureMap = {
//     brown_kraft: {
//       inner: "/textures/carton.png",
//       outer: "/textures/carton.png",
//     },
//     white_kraft: {
//       inner: "/textures/kraft.png",
//       outer: "/textures/white.png",
//     },
//     premium_white: {
//       inner: "/textures/white.png",
//       outer: "/textures/white.png",
//     },
//   } as const;
//   const selected =
//     textureMap[material as MaterialType] || textureMap.brown_kraft;

//   const [innerTexture, outerTexture, edgeTexture] = useTexture([
//     selected.inner,
//     selected.outer,
//     "/textures/edge.jpeg",
//   ]);

//   const [edgeTex, setEdgeTex] = useState<THREE.Texture>();
//   useEffect(() => {
//     if (!edgeTexture) return;
//     const tex = edgeTexture.clone();
//     tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
//     tex.repeat.set(1, 0.1);
//     tex.needsUpdate = true;
//     setEdgeTex(tex);
//   }, [edgeTexture]);

//    // === Membuat material ===
//   const materials = useMemo(() => {
//     if (!innerTexture || !outerTexture || !edgeTex) return [];

//     const frontMat = new THREE.MeshStandardMaterial({
//       map: outerTexture,
//       color: new THREE.Color(c),
//     });
//     const backMat = new THREE.MeshStandardMaterial({
//       map: innerTexture,
//     });
//     const sideMat = new THREE.MeshStandardMaterial({
//       map: edgeTex,
//     });

//     return [sideMat, backMat, frontMat];
//   }, [innerTexture, outerTexture, edgeTex]);

// //   const localPlanes: Record<string, THREE.Plane[]> = useMemo(() => {
// //     const basePlanes = (width: number, height: number) => [
// //       new THREE.Plane(new THREE.Vector3(width, 0, 0), width / 2),
// //       new THREE.Plane(new THREE.Vector3(-width, 0, 0), width / 2),
// //       new THREE.Plane(new THREE.Vector3(0, height, 0), height / 2),
// //       new THREE.Plane(new THREE.Vector3(0, -height, 0), height / 2),
// //     ];

// //     return {
// //       back: createRoundedChannelPlanes(
// //         w - t, // lebar channel
// //         h * 0.9, // kedalaman channel
// //         t, // radius kelengkungan (15% dari lebar)
// //         16, // segments untuk smooth curve
// //         0, // centerX
// //         h / 2 // centerY (bagian atas flap)
// //       ),
// //     };
// //   }, [w, h]);

// //   const rasio = 100;
// //   const flapBounds: Record<
// //     string,
// //     { xMin: number; xMax: number; yMin: number; yMax: number }
// //   > = {
// //     back_top: {
// //       xMin: startX,
// //       xMax: l * rasio,
// //       yMin: startY,
// //       yMax: 1.5 * startY + h * rasio,
// //     },
// //   };

// //   useEffect(() => {
// //     // apply clipping planes ke semua material jika ada
// //     materials.forEach((mat) => {
// //       if (mat instanceof THREE.MeshStandardMaterial) {
// //         const planes = localPlanes[f] ?? null; // ambil array plane sesuai flap
// //         mat.clippingPlanes = planes;
// //         mat.clipIntersection = false; // biar bagian yang disilangkan di-clip
// //         mat.needsUpdate = true;
// //       }
// //     });
// //   }, [localPlanes, materials, f]);

//   return (
//     <a.group rotation-x={Math.PI}>
//       <a.mesh geometry={extrudeGeom} material={materials}>
//         {/* tambahkan urutan material index:
//             0 = sides, 1 = back, 2 = front */}
//         <meshStandardMaterial attach="material-0" map={innerTexture} />
//         <meshStandardMaterial attach="material-1" map={outerTexture} color={c} />
//         <meshStandardMaterial attach="material-2" map={edgeTex} />
//       </a.mesh>

//       {/* Titik pivot untuk debugging */}
//       <mesh>
//         <sphereGeometry args={[0.1, 16, 16]} />
//         <meshBasicMaterial color="yellow" />
//       </mesh>
//     </a.group>
//   );

// //   return (
// //     <a.group position={p} rotation-x={rx} rotation-y={ry} rotation-z={rz}>
// //       <a.mesh
// //         material={materials}
// //         position={o}
// //         rotation-x={mrx}
// //         rotation-y={mry}
// //         rotation-z={mrz}
// //       >
// //         <boxGeometry args={[w, h, t]} />
// //       </a.mesh>
// //       {/* Pivot Point Indicator */}
// //       <mesh>
// //         <sphereGeometry args={[0.1, 16, 16]} />
// //         <meshBasicMaterial color="yellow" />
// //       </mesh>
// //       <group>
// //         {localPlanes[f] &&
// //           localPlanes[f].map((plane, i) => (
// //             <PlaneHelper
// //               key={`pl-${i}`}
// //               plane={plane}
// //               size={s * 0.9}
// //               color={0x0000ff}
// //             />
// //           ))}
// //       </group>

// //     </a.group>
// //   );
// }


const SandboxFlap: React.FC = () => {
  const flapRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const circleRef = useRef<THREE.Mesh>(null);

  // === Variabel lokal untuk dimensi flap ===
  const flapWidth = 6;   // panjang (sumbu X)
  const flapHeight = 4;  // tinggi (sumbu Y)
  const flapThickness = 0.3; // ketebalan (arah Z)
  const holeRadius = 1.2;

  // === Flap geometry dan material ===
  const { flapGeometry, flapMaterial, edgeGeometry, edgeMaterial } = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-flapWidth / 2, -flapHeight / 2);
    shape.lineTo(flapWidth / 2, -flapHeight / 2);
    shape.lineTo(flapWidth / 2, flapHeight / 2);
    shape.lineTo(-flapWidth / 2, flapHeight / 2);
    shape.lineTo(-flapWidth / 2, -flapHeight / 2);

    const holePath = new THREE.Path();
    holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, false);
    shape.holes.push(holePath);

     // Bentuk 3D dengan extrude
    const extrudeSettings = {
      depth: flapThickness,
      bevelEnabled: false,
    };

    // const flapGeometry = new THREE.ShapeGeometry(shape);
    const flapGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    flapGeometry.center();
    const flapMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9a86a,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    const edgeGeometry = new THREE.EdgesGeometry(flapGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x8b6f47,
      linewidth: 2,
    });

    return { flapGeometry, flapMaterial, edgeGeometry, edgeMaterial };
  }, []);

// === Custom shader material untuk text (berbasis color + discard hole) ===
  const textMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color("#ff3333") },
        holeCenter: { value: new THREE.Vector2(0, 0) },
        holeRadius: { value: holeRadius },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec2 holeCenter;
        uniform float holeRadius;
        varying vec3 vWorldPosition;

        void main() {
          vec2 worldPos = vWorldPosition.xy;
          float dist = length(worldPos - holeCenter);
          if (dist < holeRadius) discard;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, []);

  // === Geometry untuk circle helper ===
  const circleGeometry = useMemo(
    () => new THREE.RingGeometry(holeRadius - 0.02, holeRadius + 0.02, 64),
    []
  );
  const circleMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      }),
    []
  );

  // === Interaksi mouse dan animasi rotasi ===
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const mx = (e.clientX / window.innerWidth) * 2 - 1;
      const my = -(e.clientY / window.innerHeight) * 2 + 1;
      mouse.current.targetX = mx * 0.5;
      mouse.current.targetY = my * 0.3;
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  useFrame(() => {
    const flap = flapRef.current;
    const text = textRef.current;
    const circle = circleRef.current;
    const m = mouse.current;
    if (flap) {
      flap.rotation.y += (m.targetX - flap.rotation.y) * 0.05;
      flap.rotation.x += (m.targetY - flap.rotation.x) * 0.05;
    }
    if (text && flap) {
      text.rotation.copy(flap.rotation);
    }
    if (circle && flap) {
      circle.rotation.copy(flap.rotation);
    }
  });
// bisa dengan extrude geometry dan shader materia untuk lubang di tulisannya
  return (
    <>
      {/* Flap mesh */}
      <group ref={flapRef}>
        <mesh geometry={flapGeometry} material={flapMaterial} />
        <lineSegments geometry={edgeGeometry} material={edgeMaterial} />
      </group>

      <Text
        ref={textRef as React.RefObject<any>}
        position={[0, 1, flapThickness]}
        fontSize={0.6}
        letterSpacing={0.02}
        anchorX="center"
        anchorY="middle"
      >
        FRAGILE
        {textMaterial && <primitive attach="material" object={textMaterial} />}
      </Text>

      {/* Circle helper */}
      <mesh ref={circleRef} geometry={circleGeometry} material={circleMaterial} position={[0, 0, 0.05]} />
    </>
  );
};

export default SandboxFlap