import { useDesignStore } from "@/store/design-store";
import { Image, Text, useTexture } from "@react-three/drei";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const SandboxFlap: React.FC = () => {
  const images = useDesignStore((s) => s.images);
  const [innerTexture, outerTexture, edgeTexture] = useTexture([
    "/textures/carton.png",
    "/textures/carton.png",
    "/textures/edge.jpeg",
  ]);

  [innerTexture, outerTexture, edgeTexture].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 0.7);
  });

  // === Variabel lokal untuk dimensi flap ===
  const w = 6; // panjang (sumbu X)
  const h = 4; // tinggi (sumbu Y)
  const t = 0.15; // ketebalan (arah Z)
  const holeRadius = 1.2;

  // === Flap geometry dan material ===
  const { flapGeometry, materials } = useMemo(() => {
    const shape = new THREE.Shape();
    // --- bentuk dasar flap ---
    // shape.moveTo(-w / 2, -h / 2);
    // shape.lineTo(w / 2, -h / 2);
    // shape.lineTo(w / 2, h / 2);
    // shape.lineTo(-w / 2, h / 2);
    // shape.lineTo(-w / 2, -h / 2);

    // Titik referensi: mulai dari kiri bawah (0,0) di tengah sumbu X
    // Jadi koordinat X akan dari -w/2 ke +w/2
    const halfW = w / 2;
    const upWidth = w - holeRadius;
    const r = holeRadius/2;

    // shape.moveTo(0, 0);
    // shape.lineTo(1, 1);
    // shape.lineTo(2, 2);
    // shape.lineTo(3, 3);
    // --- MULAI di kiri bawah ---
    // posisi awal di titik kiri bawah lengkungan
    shape.moveTo(r, 0);
    shape.lineTo(w-r, 0);
    shape.absarc(w, -h + r, r, Math.PI * 3, (Math.PI * 3) / 2, false);
    shape.lineTo(w, -h);
    shape.lineTo(0, -h);
    shape.absarc(0, -h + r, r, (Math.PI * 3) / 2, 0, false);
    shape.lineTo(r, 0);

    // --- ARC kiri bawah (¼ lingkaran ke kiri-bawah lalu ke bawah) ---
    // pusat lingkaran di (-halfW + r, r)
    // shape.absarc(-halfW + r, r, r, Math.PI, Math.PI / 2, true);

    // --- GARIS BAWAH ke kanan bawah ---
    // dari (-halfW, 0) ke (halfW - r, 0)
    // shape.lineTo(halfW - r, 0);

    // --- ARC kanan bawah (¼ lingkaran ke kanan-bawah lalu ke atas) ---
    // pusat lingkaran di (halfW - r, r)
    // shape.absarc(halfW - r, r, r, Math.PI / 2, 0, true);

    // --- GARIS SAMPING KANAN KE ATAS ---
    // shape.lineTo(halfW, h);

    // // --- GARIS ATAS ke kiri ---
    // shape.lineTo(-halfW, h);

    // // --- TUTUP KE TITIK AWAL ---
    // shape.lineTo(-upWidth, 0);
    // shape.lineTo(-halfW + r, 0);

    const extrudeSettings = {
      depth: t,
      bevelEnabled: false,
      curveSegments: 64,
      material: 0, // depan
      extrudeMaterial: 1, // samping
    };

    // const flapGeometry = new THREE.ShapeGeometry(shape);
    const flapGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // flapGeometry.center();
    // flapGeometry.center();

    // === 3 Material untuk masing-masing sisi ===
    const innerMat = new THREE.MeshStandardMaterial({
      map: innerTexture,
      side: THREE.FrontSide, // depan
    });

    const outerMat = new THREE.MeshStandardMaterial({
      map: outerTexture,
      side: THREE.BackSide, // belakang
    });

    const edgeMat = new THREE.MeshStandardMaterial({
      map: edgeTexture,
      side: THREE.DoubleSide, // sisi samping
    });

    // urutannya [depan, samping, belakang]
    const materials = [innerMat, edgeMat, outerMat];

    return { flapGeometry, materials };
  }, [innerTexture, outerTexture, edgeTexture]);

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

  // ShaderMaterial kustom
  const CustomShader = {
    uniforms: {
      map: { value: null },
      time: { value: 0 },
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
  };

  const imageRef = useRef<any>(null);
  const shaderMat = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    if (imageRef.current && imageRef.current.material) {
      const tex = imageRef.current.material.map;
      shaderMat.current = new THREE.ShaderMaterial({
        uniforms: {
          map: { value: tex },
          holeCenter: { value: new THREE.Vector2(0, 0) },
          holeRadius: { value: holeRadius },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vWorldPosition;
          void main() {
            vUv = uv;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform vec2 holeCenter;
          uniform float holeRadius;
          varying vec2 vUv;
          varying vec3 vWorldPosition;

          void main() {
            vec2 worldPos = vWorldPosition.xy;
            float dist = length(worldPos - holeCenter);
            if (dist < holeRadius) discard; // hilangkan di area lubang
            vec4 texColor = texture2D(map, vUv);
            if (texColor.a < 0.1) discard;
            gl_FragColor = texColor;
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
      });
      imageRef.current.material = shaderMat.current;
    }
  }, []);

  // bisa dengan extrude geometry dan shader material untuk lubang di tulisannya
  // kurang continuous UV unwrap around the edges
  return (
    <>
      {/* Flap mesh */}
      <mesh geometry={flapGeometry} material={materials} />

      <Text
        position={[0, 1, t]}
        fontSize={0.6}
        letterSpacing={0.02}
        anchorX="center"
        anchorY="middle"
      >
        FRAGILE
        {textMaterial && <primitive attach="material" object={textMaterial} />}
      </Text>
      {images.length > 0 &&
        images.map((i, idx) => (
          <Image
            key={idx}
            ref={imageRef}
            position={[0, 0, t / 2 + 0.002]}
            scale={[2.2, 2.2]}
            url={i.dataUrl}
          />
        ))}
    </>
  );
};

export default SandboxFlap;
