"use client";
import * as THREE from "three";
import React, { useMemo } from "react";
import { Text, useTexture } from "@react-three/drei";

const SandboxFlap: React.FC = () => {
  // === Parameter lubang ===
  const holeRadius = 0.6;
  const holeCenter = new THREE.Vector2(0, 0);

  // === Shader source code (dibagi bersama) ===
  const vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 color;
    uniform vec2 holeCenter;
    uniform float holeRadius;
    varying vec3 vWorldPosition;

    void main() {
      vec2 worldXY = vWorldPosition.xy;
      float dist = length(worldXY - holeCenter);
      if (dist < holeRadius) discard;   // Buat lubang transparan
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const [innerTexture, outerTexture, edgeTexture] = useTexture([
    "/textures/carton.png",
    "/textures/carton.png",
    "/textures/edge.jpeg",
  ]);

  [innerTexture, outerTexture, edgeTexture].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
  });

  const boxVertexShader = `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // dengan support tekstur dan lubang
  const fragmentShaderWithHole = `
    uniform sampler2D tex;
    uniform vec2 holeCenter;
    uniform float holeRadius;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vec2 worldXY = vWorldPosition.xy;
      float dist = length(worldXY - holeCenter);
      if (dist < holeRadius) discard;
      gl_FragColor = texture2D(tex, vUv);
    }
  `;

  // tanpa lubang (untuk sisi samping)
  const fragmentShaderNoHole = `
    uniform sampler2D tex;
    varying vec2 vUv;
    void main() {
      gl_FragColor = texture2D(tex, vUv);
    }
  `;

  // === Materials ===
  const innerMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          tex: { value: innerTexture },
          holeCenter: { value: holeCenter },
          holeRadius: { value: holeRadius },
        },
        vertexShader: boxVertexShader,
        fragmentShader: fragmentShaderWithHole,
        side: THREE.DoubleSide,
        transparent: true,
      }),
    [innerTexture]
  );

  const outerMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          tex: { value: innerTexture },
          holeCenter: { value: holeCenter },
          holeRadius: { value: holeRadius },
        },
        vertexShader: boxVertexShader,
        fragmentShader: fragmentShaderWithHole,
        side: THREE.DoubleSide,
        transparent: true,
      }),
    [innerTexture]
  );

  const edgeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { tex: { value: edgeTexture } },
        vertexShader: boxVertexShader,
        fragmentShader: fragmentShaderNoHole,
        side: THREE.DoubleSide,
      }),
    [edgeTexture]
  );

  //   // === ShaderMaterial untuk BOX ===
  //   const boxMaterial = useMemo(() => {
  //     return new THREE.ShaderMaterial({
  //       uniforms: {
  //         tex: { value: innerTexture },
  //         // color: { value: new THREE.Color("#d6b36a") }, // warna emas
  //         holeCenter: { value: holeCenter },
  //         holeRadius: { value: holeRadius },
  //       },
  //       vertexShader,
  //       fragmentShader,
  //       side: THREE.DoubleSide,
  //       transparent: true,
  //     });
  //   }, []);

  // === Array material per sisi (6 sisi BoxGeometry) ===
  // Urutannya: +X, -X, +Y, -Y, +Z (depan), -Z (belakang)
  const materials = [edgeMat, edgeMat, edgeMat, edgeMat, innerMat, outerMat];

  // === ShaderMaterial untuk TEXT ===
  const textMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color("#ff0000") }, // merah untuk text
        holeCenter: { value: holeCenter },
        holeRadius: { value: holeRadius },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
    });
  }, []);

  return (
    <>
      {/* Box 3D dengan lubang */}
      <mesh position={[0, 0, 0]} material={materials}>
        <boxGeometry args={[2, 2, 0.1]} />
      </mesh>
      {/* Text dengan shader yang sama */}
      <Text
        position={[0, 0.6, 0.06]}
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
      >
        FRAGILE
        <primitive attach="material" object={textMaterial} />
      </Text>
      {/* // Tambahkan ring di area lubang */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05]}>
        <ringGeometry args={[holeRadius * 0.98, holeRadius * 1.02, 64]} />
        <meshStandardMaterial map={edgeTexture} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

export default SandboxFlap;
