import { useDesignStore } from "@/store/design-store";
import { Image, Text, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
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
    tex.repeat.set(1, 1.2);
  });

  // === Variabel lokal untuk dimensi flap ===
  const flapWidth = 6; // panjang (sumbu X)
  const flapHeight = 4; // tinggi (sumbu Y)
  const flapThickness = 0.15; // ketebalan (arah Z)
  const holeRadius = 1.2;

  // === Flap geometry dan material ===
  const { flapGeometry, materials } = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-flapWidth / 2, -flapHeight / 2);
    shape.lineTo(flapWidth / 2, -flapHeight / 2);
    shape.lineTo(flapWidth / 2, flapHeight / 2);
    shape.lineTo(-flapWidth / 2, flapHeight / 2);
    shape.lineTo(-flapWidth / 2, -flapHeight / 2);

    const holePath = new THREE.Path();
    holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, false);
    shape.holes.push(holePath);

    const extrudeSettings = {
      depth: flapThickness,
      bevelEnabled: false,
      curveSegments: 64,
      material: 0, // depan
      extrudeMaterial: 1, // samping
    };

    // const flapGeometry = new THREE.ShapeGeometry(shape);
    const flapGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    flapGeometry.center();

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

  //  useEffect(() => {
  //   if (imageRef.current && imageRef.current.material) {
  //     const tex = imageRef.current.material.map; // ambil texture bawaan dari Image
  //     shaderMat.current = new THREE.ShaderMaterial({
  //       uniforms: {
  //         map: { value: tex },
  //         time: { value: 0 },
  //       },
  //       vertexShader: CustomShader.vertexShader,
  //       fragmentShader: CustomShader.fragmentShader,
  //       transparent: true,
  //     });
  //     imageRef.current.material = shaderMat.current; // override material bawaan
  //   }
  // }, []);

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

  // useFrame((state) => {
  //   if (shaderMat.current) {
  //     shaderMat.current.uniforms.time.value = state.clock.getElapsedTime();
  //   }
  // });

  // bisa dengan extrude geometry dan shader material untuk lubang di tulisannya
  return (
    <>
      {/* Flap mesh */}
      {/* <group> */}
        <mesh geometry={flapGeometry} material={materials} />
      {/* </group> */}

      <Text
        position={[0, 1, flapThickness]}
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
            position={[0, 0, flapThickness / 2 + 0.002]}
            scale={[2.2, 2.2]}
            url={i.dataUrl}
          />
        ))}
    </>
  );
};

export default SandboxFlap;
