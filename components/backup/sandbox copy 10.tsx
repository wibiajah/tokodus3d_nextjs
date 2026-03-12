import { Decal, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useDesignStore } from "@/store/design-store";
import { rect, rectWith2Holes, trapezoid } from "../design/geometry";

function SandboxFlap() {
  const images = useDesignStore((s) => s.images);
  const [innerTexture, outerTexture, edgeTexture, texX] = useTexture([
    "/textures/carton.png",
    "/textures/carton.png",
    "/textures/edge.jpeg",
    "/textures/edge.jpeg",
  ]);

  // const texX = edgeTexture.clone();
  [innerTexture, outerTexture, edgeTexture].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
  });

  texX.wrapS = texX.wrapT = THREE.RepeatWrapping;
  texX.repeat.set(0.05, 0.002);
  texX.center.set(1, 0.1);
  const size = useDesignStore((s) => s.size);
  const scale = 0.1;
  const l = size.length * scale;
  const t = size.depth * scale;
  const w = size.width * scale;
  const h = (size.height * scale) / 8;
  const n = 1;
  const m = h / 2;

  // === Flap geometry dan material ===
  const { geom, mat } = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); // kiri bawah
    shape.lineTo(w, 0); // kanan bawah
    shape.lineTo(w / 2, -h); // puncak segitiga
    shape.lineTo(0, 0); // tutup shape
    // const shape = trapezoid(w, h, t, n);
    // const shape = rectWith2Holes(w, h, n, m, 0.025);
    // const shape = rect(w, h);
    const extrudeSettings = {
      steps: 1,
      depth: t,
      bevelEnabled: false,
      curveSegments: 64,
    };

    // const flapGeometry = new THREE.ShapeGeometry(shape);
    const flapGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    flapGeometry.center();

    // === Material untuk masing-masing sisi ===
    const innerMat = new THREE.MeshStandardMaterial({
      map: innerTexture,
      side: THREE.DoubleSide, // depan
      color: new THREE.Color(0xff0000), // merah
    });

    const outerMat = new THREE.MeshStandardMaterial({
      map: outerTexture,
      side: THREE.DoubleSide, // belakang
      color: new THREE.Color(0x00ff00), // hijau
    });

    const edgeLeftRight = new THREE.MeshStandardMaterial({
      map: texX,
      side: THREE.DoubleSide,
      color: new THREE.Color(0x0000ff), // biru
    });

    const edgeTopBottom = new THREE.MeshStandardMaterial({
      map: edgeTexture,
      side: THREE.DoubleSide,
      color: new THREE.Color(0xffff00), // kuning
    });

    const materials = [
      outerMat, // index 0 → top/back
      innerMat, // index 1 → bottom/front
      edgeTopBottom, //index 2 → side walls y
      edgeLeftRight, //index 3 → side walls x
    ];

    flapGeometry.computeVertexNormals();
    flapGeometry.clearGroups();

    const pos = flapGeometry.attributes.position;
    const norm = flapGeometry.attributes.normal;
    const vertexCount = pos.count; // tanpa index
    const faceCount = vertexCount / 3;

    const groups: Record<string, number[]> = {
      outer: [], // material 0
      inner: [], // material 1
      yside: [], // material 2
      xside: [], // material 3
    };

    // Loop per-face, 3 vertex = 1 face
    for (let face = 0; face < faceCount; face++) {
      const vi = face * 3; // index vertex pertama dari face ini

      const nx = norm.getX(vi);
      const ny = norm.getY(vi);
      const nz = norm.getZ(vi);

      let target: keyof typeof groups;

      if (Math.abs(nz) > 0.8) {
        // front/back
        target = nz > 0 ? "inner" : "outer";
      } else if (Math.abs(nx) > 0) {
        // left/right
        target = "xside";
      } else {
        // top/bottom
        target = "yside";
      }

      // each face = 3 vertices = 3 positions
      groups[target].push(vi);
    }

    // Tambahkan group ke geometry
    for (const [matIndex, list] of [
      [0, groups.outer],
      [1, groups.inner],
      [2, groups.yside],
      [3, groups.xside],
    ] as const) {
      (list as number[]).forEach((vi) =>
        flapGeometry.addGroup(vi, 3, matIndex),
      );
    }

    return { geom: flapGeometry, mat: materials };
  }, [innerTexture, outerTexture, edgeTexture]);

  const designTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const multi = 4;
    canvas.width = 1024 * multi;
    canvas.height = 1024 * multi;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = "black";
    ctx.font = "80px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("HELLO WORLD", canvas.width / 2, 150);

    // === DRAW IMAGES ===
    if (images.length > 0) {
      Promise.all(images.map((src) => loadImage(src.dataUrl))).then((imgs) => {
        imgs.forEach((img, i) => {
          // Example layout: grid
          const x = (i % 3) * 300 + 100;
          const y = Math.floor(i / 3) * 300 + 300;

          ctx.drawImage(img, x, y, 600, 600);
        });

        tex.needsUpdate = true;
      });
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.needsUpdate = true;

    return tex;
  }, [images]);

  // extrude + decal + canvas texture + group vertex mapping
  // best box flap model
  return (
    <group>
      <mesh geometry={geom} material={mat}>
        <Decal
          position={[1.7, 0, 1.575]} //0.075(positif) merupakan fixed untuk menghindari z-fighting
          rotation={[0, 0, 0]}
          scale={[3, 3, 3]}
        >
          <meshStandardMaterial
            transparent
            map={designTexture}
            depthWrite={false}
            depthTest={false}
            side={THREE.FrontSide}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </Decal>
      </mesh>
    </group>
  );
}

export default SandboxFlap;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // IMPORTANT if image is from server
    img.onload = () => resolve(img);
    img.src = src;
  });
}
