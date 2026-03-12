"use client";
import * as THREE from "three";
import React, { useMemo } from "react";
import { Text, useTexture } from "@react-three/drei";
import { Geometry, Base, Subtraction } from "@react-three/csg";

const SandboxFlap: React.FC = () => {
  // === Parameter lubang ===
  const holeRadius = 0.6;
  const flapSize = [2, 2, 0.1] as [number, number, number]; // width, height, thickness

  // === Load tekstur ===
  const [innerTexture, outerTexture, edgeTexture] = useTexture([
    "/textures/carton.png",
    "/textures/carton.png",
    "/textures/edge.jpeg",
  ]);

  [innerTexture, outerTexture, edgeTexture].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
  });

  // === Material untuk sisi-sisi ===
  const innerMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: innerTexture,
        side: THREE.DoubleSide,
      }),
    [innerTexture]
  );

  const outerMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: outerTexture,
        side: THREE.DoubleSide,
      }),
    [outerTexture]
  );

  const edgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: edgeTexture,
        side: THREE.DoubleSide,
      }),
    [edgeTexture]
  );

  const materials = [edgeMat, edgeMat, edgeMat, edgeMat, innerMat, outerMat];

  // === CSG untuk membuat lubang bulat di tengah ===
  const flapWithHole = useMemo(() => {
    return (
      <Geometry>
        {/* Flap utama */}
        <Base>
          <boxGeometry args={flapSize} />
        </Base>

        {/* Lubang bulat di tengah */}
        <Subtraction>
          <sphereGeometry args={[holeRadius, 16, 64]} />
        </Subtraction>
      </Geometry>
    );
  }, [holeRadius]);
// menggunakan CSG namun hasilnya hanya 1 mesh, tidak bisa apply berbagai material berbeda
  return (
    <>
      {/* === Flap dengan lubang (hasil boolean) === */}
      <mesh position={[0, 0, 0]} material={materials}>
        {flapWithHole}
      </mesh>

      {/* === Text di permukaan flap === */}
      <Text
        position={[0, 0.6, flapSize[2] / 2 + 0.01]}
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
        material={new THREE.MeshStandardMaterial({ color: "#ff0000" })}
      >
        FRAGILE
      </Text>

      {/* === Ring di tepi lubang untuk efek edge === */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, flapSize[2] / 2]}>
        <ringGeometry args={[holeRadius * 0.98, holeRadius * 1.02, 64]} />
        <meshStandardMaterial map={edgeTexture} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

export default SandboxFlap;
