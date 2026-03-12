import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  backMailer,
  bridgeBMailer,
  bridgeTMailer,
  extraFMailer,
  extraSMailer,
  FixedFlap,
  fixedMailer,
  Flap,
  FlapWithUCrop,
  FlapWithUCropR,
  frontMailer,
  hingeGeometry,
  isoscelesTrz,
  MiddleFlap,
  MiddleFlapV2,
  quarterRoundBMailer,
  quarterRoundTMailer,
  rect,
  rectWith2Holes,
  trapezoid,
  triangle,
} from "./geometry";
import { a, SpringValue } from "@react-spring/three";
import { TextureItem, useDesignStore } from "@/store/design-store";
import { useTexture, Decal } from "@react-three/drei";
import {
  make3LinesTexture,
  useFluteWallConfig,
  wallPresets,
} from "./flutewall-config";
import { textureMap } from "../two/model-renderer";
interface ExtrudeBoxFlapProps {
  w: number;
  h: number;
  t: number;
  inner: string;
  outer: string;
  f: string;
  p?: [number, number, number];
  rx?: number | SpringValue<number> | any;
  ry?: number | SpringValue<number> | any;
  rz?: number | SpringValue<number> | any;
  o?: [number, number, number];
  mrx?: number;
  mry?: number;
  mrz?: number;
  hingeCover?: boolean;
  model?: string;
  ti?: TextureItem[] | null;
}
export function ExtrudeBoxFlap({
  w,
  h,
  t,
  inner,
  outer,
  f,
  p = [0, 0, 0],
  rx = 0,
  ry = 0,
  rz = 0,
  o = [0, 0, 0],
  mrx = 0,
  mry = 0,
  mrz = 0,
  hingeCover = false,
  model = "middle",
  ti,
}: ExtrudeBoxFlapProps) {
  const flute = useDesignStore((s) => s.flute);
  const d = flute.val * 0.01;
  const fluteWall = useDesignStore((s) => s.fluteWall);
  const [edgeTex, setEdgeTex] = useState<THREE.Texture>();
  const [edgeTexX, setEdgeTexX] = useState<THREE.Texture>();
  const { fw, fwy, fwx, fwa, fwb, fwc, aa, ab, ac, la, lb, fwz, ax } =
    useFluteWallConfig(flute.key, fluteWall);
  const nz = d * fw;
  const material = useDesignStore((s) => s.material);
  // const textureMap: Record<string, string> = {
  //   brown_kraft: "/textures/carton.png",
  //   white_kraft: "/textures/white.png",
  //   premium_white: "/textures/white.png",
  // };
  const selected = {
    inner: textureMap[material.inner.id] ?? textureMap["brown_kraft"],
    outer: textureMap[material.outer.id] ?? textureMap["brown_kraft"],
  };
  const [innerTexture, outerTexture, edgeTexture, texX] = useTexture([
    selected.inner,
    selected.outer,
    "/textures/edge.jpeg",
    "/textures/edge.jpeg",
  ]);
  [innerTexture, outerTexture, edgeTexture].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
  });
  useEffect(() => {
    if (!edgeTexture) return;
    const tex = edgeTexture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(fwz, fwy);
    tex.center.set(1, 1);
    tex.offset.set(ax, 1);
    tex.needsUpdate = true;
    setEdgeTex(tex);
    const texN = make3LinesTexture(fwa, fwb, fwc, aa, ab, ac, la, lb);
    if (!texN) return;
    texN.wrapS = texN.wrapT = THREE.RepeatWrapping;
    texN.repeat.set(1, fwx);
    texN.center.set(1, 1);
    texN.needsUpdate = true;
    setEdgeTexX(texN);
  }, [edgeTexture, fw, fwy, fwx, fwa, fwb, fwc, aa, ab, ac, la, lb, fwz, ax]);
  // const r = t;
  const geom = useMemo(() => {
    let shape = null;
    switch (model) {
      case "middle":
        shape = MiddleFlap(w, h, t);
        break;
      case "middle2":
        shape = MiddleFlapV2(w, h, t);
        break;
      case "flapucrop":
        shape = FlapWithUCrop(w, h, t);
        break;
      case "flapucropr":
        shape = FlapWithUCropR(w, h, t);
        break;
      case "flap":
        shape = Flap(w, h, t);
        break;
    }
    const extrudeSettings = {
      steps: 1,
      depth: nz,
      bevelEnabled: false,
      curveSegments: 64,
    };
    const flapGeometry = new THREE.ExtrudeGeometry(shape!, extrudeSettings);
    flapGeometry.center();
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
    for (let face = 0; face < faceCount; face++) {
      const vi = face * 3;
      const nz = norm.getZ(vi);
      let target;
      if (Math.abs(nz) > 0.8) {
        target = nz > 0 ? "inner" : "outer";
      } else {
        const ax = Math.abs(norm.getX(vi));
        const ay = Math.abs(norm.getY(vi));
        target = ay > ax ? "yside" : "xside";
      }
      groups[target].push(vi);
    }
    for (const [matIndex, list] of [
      [0, groups.outer],
      [1, groups.inner],
      [2, groups.yside],
      [3, groups.xside],
    ]) {
      (list as number[]).forEach((vi) =>
        flapGeometry.addGroup(vi, 3, matIndex as number),
      );
    }
    return flapGeometry;
  }, [w, h, t, nz]);
  const materials = React.useMemo(() => {
    if (!innerTexture || !outerTexture || !edgeTex || !edgeTexX) return [];
    const innerMat = new THREE.MeshStandardMaterial({
      map: inner !== "transparent" ? null : innerTexture,
      side: THREE.DoubleSide, // depan
      color: inner === "transparent" ? 0xffffff : new THREE.Color(inner),
    });
    const outerMat = new THREE.MeshStandardMaterial({
      map: outer !== "transparent" ? null : outerTexture,
      side: THREE.DoubleSide, // belakang
      color: outer === "transparent" ? 0xffffff : new THREE.Color(outer),
    });
    const edgeLeftRight = new THREE.MeshStandardMaterial({
      map: edgeTexX,
      side: THREE.DoubleSide,
    });
    const edgeTopBottom = new THREE.MeshStandardMaterial({
      map: edgeTex,
      side: THREE.DoubleSide,
    });
    // outerMat.blending = THREE.NormalBlending;
    // outerMat.blending = THREE.CustomBlending;
    // outerMat.blending = THREE.MultiplyBlending;
    // outerMat.blending = THREE.AdditiveBlending;//bisa tapi jelek
    // outerMat.blending = THREE.NoBlending;
    // outerMat.blending = THREE.SubtractiveBlending;
    return [
      innerMat, // index 1 → bottom/front
      outerMat, // index 0 → top/back
      edgeTopBottom, //index 2 → side walls y
      edgeLeftRight, //index 3 → side walls x
    ];
  }, [innerTexture, outerTexture, edgeTex, edgeTexX, inner, outer]);
  const [outTex, setOutTex] = useState<THREE.Texture | null>(null);
  const [inTex, setInTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!ti) {
      setOutTex(null);
      setInTex(null);
      return;
    }
    const outer = ti.find((a) => a.side === "outer") ?? null;
    const inner = ti.find((a) => a.side === "inner") ?? null;
    const loader = new THREE.TextureLoader();
    let outTexture: THREE.Texture | null = null;
    let inTexture: THREE.Texture | null = null;
    if (outer?.design) {
      outTexture = loader.load(
        outer.design,
        (loaded) => {
          loaded.minFilter = THREE.LinearFilter;
          loaded.magFilter = THREE.LinearFilter;
          loaded.needsUpdate = true;
          setOutTex(loaded);
        },
        undefined,
        (err) => {
          console.error("Error loading OUT texture:", err);
          setOutTex(null);
        },
      );
    } else {
      setOutTex(null);
    }
    if (inner?.design) {
      inTexture = loader.load(
        inner.design,
        (loaded) => {
          loaded.minFilter = THREE.LinearFilter;
          loaded.magFilter = THREE.LinearFilter;
          loaded.needsUpdate = true;
          setInTex(loaded);
        },
        undefined,
        (err) => {
          console.error("Error loading IN texture:", err);
          setInTex(null);
        },
      );
    } else {
      setInTex(null);
    }
    return () => {
      if (outTexture) outTexture.dispose();
      if (inTexture) inTexture.dispose();
    };
  }, [ti]);
  const u = model === "middle2" ? w + t * 2 : w;
  const v = model === "middle2" ? h - 2 * t : h;
  const dh = model === "flapucrop" || model === "flapucropr" ? h + t : v;
  const fl =
    f === "left" || f == "left_bottom" || f === "left_top"
      ? w + t
      : model === "flap"
        ? w - 2 * t
        : w;
  const nd = nz * 1.01;
  return (
    <a.group position={p} rotation-x={rx} rotation-y={ry} rotation-z={rz}>
      <a.mesh
        geometry={geom}
        material={materials}
        position={o}
        rotation-x={mrx}
        rotation-y={mry}
        rotation-z={mrz}
      >
        {hingeCover && (
          <>
            <HingeCover
              map={materials[1]}
              nz={nz}
              length={h - t * 2}
              pos={[-w / 2, -h / 2 + t, 0]}
              rot={[Math.PI / 2, Math.PI, 0]}
              direction={"left"}
            />
            <HingeCover
              map={materials[1]}
              nz={nz}
              length={u - t * 2}
              pos={[-u / 2 + t, v / 2, 0]}
              rot={[Math.PI, (-Math.PI * 3) / 2, -Math.PI / 2]}
              direction={"top"}
            />
            <HingeCover
              map={materials[1]}
              nz={nz}
              length={u - t * 2}
              pos={[-u / 2 + t, -v / 2, 0]}
              rot={[-Math.PI / 2, Math.PI / 2, -Math.PI / 2]}
              direction={"bottom"}
            />
          </>
        )}
        {outTex && (
          <Decal
            // debug={f == "left" || f === "left_top"}
            // debug
            position={[0, 0, nz]}
            rotation={[0, 0, 0]}
            scale={[fl, dh, nd]}
          >
            <meshStandardMaterial
              transparent
              map={outTex}
              side={THREE.FrontSide}
              depthTest={true}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </Decal>
        )}
        {inTex && (
          <Decal
            // debug
            position={[0, 0, -nz]}
            rotation={[0, -Math.PI, 0]}
            scale={[fl, dh, -nd]}
          >
            <meshStandardMaterial
              transparent
              map={inTex}
              side={THREE.FrontSide}
              depthTest={true}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </Decal>
        )}
      </a.mesh>
    </a.group>
  );
}
interface FixedBoxFlapProps {
  w: number;
  h: number;
  t: number;
  inner: string;
  outer: string;
  p?: [number, number, number];
  rx?: number | SpringValue<number> | any;
  ry?: number | SpringValue<number> | any;
  rz?: number | SpringValue<number> | any;
  o?: [number, number, number];
  mrx?: number;
  mry?: number;
  mrz?: number;
  ti?: TextureItem[] | null;
}
export function FixedBoxFlap({
  w,
  h,
  t,
  inner,
  outer,
  p = [0, 0, 0],
  rx = 0,
  ry = 0,
  rz = 0,
  o = [0, 0, 0],
  mrx = 0,
  mry = 0,
  mrz = 0,
  ti,
}: FixedBoxFlapProps) {
  const flute = useDesignStore((s) => s.flute);
  const fluteWall = useDesignStore((s) => s.fluteWall);
  const d = flute.val * 0.01;
  const [edgeTex, setEdgeTex] = useState<THREE.Texture>();
  const [edgeTexX, setEdgeTexX] = useState<THREE.Texture>();
  const { fw, fwy, fwx, fwa, fwb, fwc, aa, ab, ac, la, lb, fwz, ax } =
    useFluteWallConfig(flute.key, fluteWall);
  const nz = d * fw;
  const material = useDesignStore((s) => s.material);
  // const textureMap: Record<string, string> = {
  //   brown_kraft: "/textures/carton.png",
  //   white_kraft: "/textures/white.png",
  //   premium_white: "/textures/white.png",
  // };
  const selected = {
    inner: textureMap[material.inner.id] ?? textureMap["brown_kraft"],
    outer: textureMap[material.outer.id] ?? textureMap["brown_kraft"],
  };
  const [innerTexture, outerTexture, edgeTexture, texX] = useTexture([
    selected.inner,
    selected.outer,
    "/textures/edge.jpeg",
    "/textures/edge.jpeg",
  ]);
  [innerTexture, outerTexture, edgeTexture].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
  });
  useEffect(() => {
    if (!edgeTexture) return;
    const tex = edgeTexture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(fwz, fwy);
    tex.center.set(1, 1);
    tex.offset.set(ax, 1);
    tex.needsUpdate = true;
    setEdgeTex(tex);
    const texN = make3LinesTexture(fwa, fwb, fwc, aa, ab, ac, la, lb);
    if (!texN) return;
    texN.wrapS = texN.wrapT = THREE.RepeatWrapping;
    texN.repeat.set(1, fwx);
    texN.center.set(1, 1);
    texN.needsUpdate = true;
    setEdgeTexX(texN);
  }, [edgeTexture, fw, fwy, fwx, fwa, fwb, fwc, aa, ab, ac, la, lb, fwz, ax]);
  const geom = useMemo(() => {
    const shape = FixedFlap(w, h, t);
    const extrudeSettings = {
      steps: 1,
      depth: nz,
      bevelEnabled: false,
      curveSegments: 64,
    };
    const flapGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    flapGeometry.center();
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
    for (let face = 0; face < faceCount; face++) {
      const vi = face * 3;
      const nz = norm.getZ(vi);
      let target;
      if (Math.abs(nz) > 0.8) {
        target = nz > 0 ? "inner" : "outer";
      } else {
        const ax = Math.abs(norm.getX(vi));
        const ay = Math.abs(norm.getY(vi));
        target = ay > ax ? "yside" : "xside";
      }
      groups[target].push(vi);
    }
    for (const [matIndex, list] of [
      [0, groups.outer],
      [1, groups.inner],
      [2, groups.yside],
      [3, groups.xside],
    ]) {
      (list as number[]).forEach((vi) =>
        flapGeometry.addGroup(vi, 3, matIndex as number),
      );
    }
    return flapGeometry;
  }, [w, h, t, nz]);
  const materials = React.useMemo(() => {
    if (!innerTexture || !outerTexture || !edgeTex || !edgeTexX) return [];
    const innerMat = new THREE.MeshStandardMaterial({
      map: outer !== "transparent" ? null : innerTexture,
      side: THREE.DoubleSide, // depan
      color: outer === "transparent" ? 0xffffff : new THREE.Color(outer),
    });
    const outerMat = new THREE.MeshStandardMaterial({
      map: inner !== "transparent" ? null : outerTexture,
      side: THREE.DoubleSide, // belakang
      color: inner === "transparent" ? 0xffffff : new THREE.Color(inner),
    });
    const edgeLeftRight = new THREE.MeshStandardMaterial({
      map: edgeTexX,
      side: THREE.DoubleSide,
    });
    const edgeTopBottom = new THREE.MeshStandardMaterial({
      map: edgeTex,
      side: THREE.DoubleSide,
    });
    return [
      outerMat, // index 0 → top/back
      innerMat, // index 1 → bottom/front
      edgeTopBottom, //index 2 → side walls y
      edgeLeftRight, //index 3 → side walls x
    ];
  }, [innerTexture, outerTexture, edgeTex, edgeTexX, inner, outer]);
  const [outTex, setOutTex] = useState<THREE.Texture | null>(null);
  const [inTex, setInTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!ti) {
      setOutTex(null);
      setInTex(null);
      return;
    }
    const outer = ti.find((a) => a.side === "outer") ?? null;
    const inner = ti.find((a) => a.side === "inner") ?? null;
    const loader = new THREE.TextureLoader();
    let outTexture: THREE.Texture | null = null;
    let inTexture: THREE.Texture | null = null;
    if (outer?.design) {
      outTexture = loader.load(
        outer.design,
        (loaded) => {
          loaded.minFilter = THREE.LinearFilter;
          loaded.magFilter = THREE.LinearFilter;
          loaded.needsUpdate = true;
          setOutTex(loaded);
        },
        undefined,
        (err) => {
          console.error("Error loading OUT texture:", err);
          setOutTex(null);
        },
      );
    } else {
      setOutTex(null);
    }
    if (inner?.design) {
      inTexture = loader.load(
        inner.design,
        (loaded) => {
          loaded.minFilter = THREE.LinearFilter;
          loaded.magFilter = THREE.LinearFilter;
          loaded.needsUpdate = true;
          setInTex(loaded);
        },
        undefined,
        (err) => {
          console.error("Error loading IN texture:", err);
          setInTex(null);
        },
      );
    } else {
      setInTex(null);
    }
    return () => {
      if (outTexture) outTexture.dispose();
      if (inTexture) inTexture.dispose();
    };
  }, [ti]);
  const nh = h - 2 * t;
  const nd = nz * 1.01;
  return (
    <a.group position={p} rotation-x={rx} rotation-y={ry} rotation-z={rz}>
      <a.mesh
        geometry={geom}
        material={materials}
        position={o}
        rotation-x={mrx}
        rotation-y={mry}
        rotation-z={mrz}
      >
        {outTex && (
          <Decal
            // debug
            position={[0, 0, nz]}
            rotation={[0, 0, 0]}
            scale={[w, nh, nd]}
          >
            <meshStandardMaterial
              transparent
              map={outTex}
              side={THREE.FrontSide}
              depthTest={true}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </Decal>
        )}
        {inTex && (
          <Decal
            // debug
            position={[0, 0, -nz]}
            rotation={[0, -Math.PI, 0]}
            scale={[w, nh, -nd]}
          >
            <meshStandardMaterial
              transparent
              map={inTex}
              side={THREE.FrontSide}
              depthTest={true}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </Decal>
        )}
      </a.mesh>
    </a.group>
  );
}
interface BoxFlapProps {
  w: number;
  h: number;
  t: number;
  c: string;
  f: string;
  p?: [number, number, number];
  rx?: number | SpringValue<number> | any;
  ry?: number | SpringValue<number> | any;
  rz?: number | SpringValue<number> | any;
  o?: [number, number, number];
  mrx?: number;
  mry?: number;
  mrz?: number;
  ti?: TextureItem[] | null;
}

export function BoxFlap({
  w,
  h,
  t,
  c,
  f,
  p = [0, 0, 0],
  rx = 0,
  ry = 0,
  rz = 0,
  o = [0, 0, 0],
  mrx = 0,
  mry = 0,
  mrz = 0,
  ti,
}: BoxFlapProps) {
  const material = useDesignStore((s) => s.material);
  // const textureMap: Record<string, string> = {
  //   brown_kraft: "/textures/carton.png",
  //   white_kraft: "/textures/white.png",
  //   premium_white: "/textures/white.png",
  // };
  const selected = {
    inner: textureMap[material.inner.id] ?? textureMap["brown_kraft"],
    outer: textureMap[material.outer.id] ?? textureMap["brown_kraft"],
  };
  const [innerTexture, outerTexture, edgeTexture] = useTexture([
    selected.inner,
    selected.outer,
    "/textures/edge.jpeg",
  ]);
  const [edgeTex, setEdgeTex] = useState<THREE.Texture>();
  const [edgeTexX, setEdgeTexX] = useState<THREE.Texture>();
  useEffect(() => {
    if (!edgeTexture) return;
    const tex = edgeTexture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    const dWall = t > 0.03;
    tex.repeat.set(10, dWall ? 0.13 : 0.07);
    tex.center.set(0.5, dWall ? 0.45 : 0.5);
    tex.rotation = 0;
    tex.needsUpdate = true;
    setEdgeTex(tex);
    const texX = edgeTexture.clone();
    texX.wrapS = texX.wrapT = THREE.RepeatWrapping;
    texX.repeat.set(dWall ? 0.1 : 0.05, 0.002);
    texX.center.set(1, 0.1);
    texX.needsUpdate = true;
    setEdgeTexX(texX);
  }, [edgeTexture, t]);
  const materials = React.useMemo(() => {
    if (!innerTexture || !outerTexture || !edgeTex || !edgeTexX) return [];
    const frontMaterial = new THREE.MeshStandardMaterial({
      map: outerTexture,
      color: new THREE.Color(c), // hanya depan yang diwarnai
    });
    const backMaterial = new THREE.MeshStandardMaterial({ map: innerTexture });
    const edgeMaterial = new THREE.MeshStandardMaterial({ map: edgeTex });
    const edgeMaterialX = new THREE.MeshStandardMaterial({ map: edgeTexX });
    return [
      edgeMaterialX, // kanan
      edgeMaterialX, // kiri
      edgeMaterial, // atas
      edgeMaterial, // bawah
      backMaterial, // belakang
      frontMaterial, // depan
    ];
  }, [innerTexture, outerTexture, edgeTex, edgeTexX]);
  useEffect(() => {
    if (materials[5]) {
      (materials[5] as THREE.MeshStandardMaterial).color.set(c);
    }
  }, [c, materials]);
  const [outTex, setOutTex] = useState<THREE.Texture | null>(null);
  const [inTex, setInTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!ti) {
      setOutTex(null);
      setInTex(null);
      return;
    }
    const outer = ti.find((a) => a.side === "outer") ?? null;
    const inner = ti.find((a) => a.side === "inner") ?? null;
    const loader = new THREE.TextureLoader();
    let outTexture: THREE.Texture | null = null;
    let inTexture: THREE.Texture | null = null;
    if (outer?.design) {
      outTexture = loader.load(
        outer.design,
        (loaded) => {
          loaded.minFilter = THREE.LinearFilter;
          loaded.magFilter = THREE.LinearFilter;
          loaded.needsUpdate = true;
          setOutTex(loaded);
        },
        undefined,
        (err) => {
          console.error("Error loading OUT texture:", err);
          setOutTex(null);
        },
      );
    } else {
      setOutTex(null);
    }
    if (inner?.design) {
      inTexture = loader.load(
        inner.design,
        (loaded) => {
          loaded.minFilter = THREE.LinearFilter;
          loaded.magFilter = THREE.LinearFilter;
          loaded.needsUpdate = true;
          setInTex(loaded);
        },
        undefined,
        (err) => {
          console.error("Error loading IN texture:", err);
          setInTex(null);
        },
      );
    } else {
      setInTex(null);
    }
    return () => {
      if (outTexture) outTexture.dispose();
      if (inTexture) inTexture.dispose();
    };
  }, [ti]);
  const z = 0.015;
  const plus = z / 2 + 0.0149;
  return (
    <a.group position={p} rotation-x={rx} rotation-y={ry} rotation-z={rz}>
      <a.mesh
        material={materials}
        position={o}
        rotation-x={mrx}
        rotation-y={mry}
        rotation-z={mrz}
      >
        <boxGeometry args={[w - t * 2, h, t]} />
        {outTex && (
          <Decal
            // debug
            position={[0, 0, plus]}
            rotation={[0, 0, 0]}
            scale={[w, h, z]}
          >
            <meshStandardMaterial
              transparent
              map={outTex}
              side={THREE.FrontSide}
            />
          </Decal>
        )}
        {inTex && (
          <Decal
            // debug
            position={[0, 0, -plus]}
            rotation={[0, -Math.PI, 0]}
            scale={[w, h, -z]}
          >
            <meshStandardMaterial
              transparent
              map={inTex}
              side={THREE.FrontSide}
            />
          </Decal>
        )}
      </a.mesh>
      {/* Pivot Point Indicator */}
      {/* <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="yellow" />
      </mesh> */}
    </a.group>
  );
}
interface HingeCoverProps {
  map: THREE.MeshStandardMaterial;
  nz: number;
  length: number;
  direction: string; // "right" | "left" | "top" | "bottom"
  pos?: [number, number, number];
  rot?: [number, number, number];
  rad?: number;
}
export function HingeCover({
  map,
  nz,
  length,
  direction = "right",
  pos = [0, 0, 0],
  rot = [0, 0, 0],
  rad = Math.PI / 2,
}: HingeCoverProps) {
  const r = nz / 2; // radius = setengah ketebalan karton
  const geom = useMemo(() => {
    return hingeGeometry(r, length, rad);
  }, [r, length, rad]);
  return <mesh geometry={geom} material={map} position={pos} rotation={rot} />;
}
type ShopFlapProps = {
  w: number;
  h: number;
  t: number;
  inner: string;
  outer: string;
  f: string;
  p?: [number, number, number];
  o?: [number, number, number];
  rx?: number | SpringValue<number> | any;
  ry?: number | SpringValue<number> | any;
  rz?: number | SpringValue<number> | any;
  mrx?: number;
  mry?: number;
  mrz?: number;
  hingeCover?: boolean;
  model?: string;
  ti?: TextureItem[] | null;
  n?: number;
  m?: number;
};
/**
 * Membuat Flap: persegi panjang dengan/tanpa 2 lubang maupun trapesium dengan THREE.ExtrudeGeometry
 * @param w panjang x
 * @param h panjang y
 * @param t ketebalan
 * @param inner warna
 * @param outer warna
 * @param f string posisi/model flap
 * @param ti TextureItem[] | null
 * @param p posisi grup; tnx[opt]
 * @param rx rotasi x grup
 * @param ry rotasi y grup
 * @param rz rotasi z grup
 * @param o posisi mesh
 * @param mrx rotasi x mesh
 * @param mry rotasi y mesh
 * @param mrz rotasi z mesh
 * @param hingeCover boolean menampilkan hinge cover atau tidak
 * @param model string model flap: "rect", "wh"{wajib isi param n, m}, "t1", "t0"
 * @param n jarak antara lubang x;// ambil dari fungsi di model 2d
 * @param m y untuk lubang;// ex: 2 cm -> 0.2 dm
 */
export function ShopFlap({
  w,
  h,
  t,
  inner,
  outer,
  f,
  ti,
  p = [0, 0, 0],
  rx,
  ry,
  rz,
  o = [0, 0, 0],
  mrx = 0,
  mry = 0,
  mrz = 0,
  hingeCover = false,
  model = "rect",
  n = 0,
  m = 0,
}: ShopFlapProps) {
  // ── Paperbag tidak pakai flute — ketebalan langsung dari prop `t` ──
  // const flute = useDesignStore((s) => s.flute);
  // const d = flute.val * 0.01;
  // const fluteWall = useDesignStore((s) => s.fluteWall);
  // const [edgeTex, setEdgeTex] = useState<THREE.Texture>();
  // const [edgeTexX, setEdgeTexX] = useState<THREE.Texture>();
  // const { fw, fwy, fwx, fwa, fwb, fwc, aa, ab, ac, la, lb, fwz, ax } =
  //   useFluteWallConfig(flute.key, fluteWall);
  // const nz = d * fw;
  const nz = t;
  const material = useDesignStore((s) => s.material);
  const selected = {
    inner: textureMap[material.inner.id] ?? textureMap["brown_kraft"],
    outer: textureMap[material.outer.id] ?? textureMap["brown_kraft"],
  };
  const [innerTexture, outerTexture, edgeTexture] = useTexture([
    selected.outer,   // paperbag: semua sisi pakai texture outer
    selected.outer,
    selected.outer,
  ]);
  [innerTexture, outerTexture, edgeTexture].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
  });
  // useEffect flute texture dihapus — tidak relevan untuk paperbag
  const geom = useMemo(() => {
    let shape = null;
    switch (model) {
      case "rect":
        shape = rect(w, h);
        break;
      case "wh":
        shape = rectWith2Holes(w, h, n, m, 0.025);
        break;
      case "t1":
        shape = trapezoid(w, h, t, 1);
        break;
      case "t0":
        shape = trapezoid(w, h, t, 0);
        break;
      case "it":
        shape = isoscelesTrz(w, h);
        break;
      case "tri":
        shape = triangle(w, h, 0);
        break;
    }
    const extrudeSettings = {
      steps: 1,
      depth: nz,
      bevelEnabled: false,
      curveSegments: 64,
    };
    const flapGeometry = new THREE.ExtrudeGeometry(shape!, extrudeSettings);
    flapGeometry.center();
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
    for (let face = 0; face < faceCount; face++) {
      const vi = face * 3;
      const nz = norm.getZ(vi);
      let target;
      if (Math.abs(nz) > 0.8) {
        target = nz > 0 ? "inner" : "outer";
      } else {
        const ax = Math.abs(norm.getX(vi));
        const ay = Math.abs(norm.getY(vi));
        target = ay > ax ? "yside" : "xside";
      }
      groups[target].push(vi);
    }
    for (const [matIndex, list] of [
      [0, groups.outer],
      [1, groups.inner],
      [2, groups.yside],
      [3, groups.xside],
    ]) {
      (list as number[]).forEach((vi) =>
        flapGeometry.addGroup(vi, 3, matIndex as number),
      );
    }
    return flapGeometry;
  }, [w, h, t, nz]);
  const materials = React.useMemo(() => {
    // edgeTex/edgeTexX dihapus — ShopFlap pakai edgeTexture (outer) langsung
    if (!innerTexture || !outerTexture || !edgeTexture) return [];
    const innerMat = new THREE.MeshStandardMaterial({
      map: inner !== "transparent" ? null : innerTexture,
      side: THREE.DoubleSide, // depan
      color: inner === "transparent" ? 0xffffff : new THREE.Color(inner),
    });
    const outerMat = new THREE.MeshStandardMaterial({
      map: outer !== "transparent" ? null : outerTexture,
      side: THREE.DoubleSide, // belakang
      color: outer === "transparent" ? 0xffffff : new THREE.Color(outer),
    });
    const edgeLeftRight = new THREE.MeshStandardMaterial({
      map: edgeTexture,
      side: THREE.DoubleSide,
    });
    const edgeTopBottom = new THREE.MeshStandardMaterial({
      map: edgeTexture,
      side: THREE.DoubleSide,
    });
    return [
      innerMat,      // index 1 → bottom/front
      outerMat,      // index 0 → top/back
      edgeTopBottom, // index 2 → side walls y
      edgeLeftRight, // index 3 → side walls x
    ];
  }, [innerTexture, outerTexture, edgeTexture, inner, outer]);
  const [outTex, setOutTex] = useState<THREE.Texture | null>(null);
  const [inTex, setInTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!ti) {
      setOutTex(null);
      setInTex(null);
      return;
    }
    const outer = ti.find((a) => a.side === "outer") ?? null;
    const inner = ti.find((a) => a.side === "inner") ?? null;
    const loader = new THREE.TextureLoader();
    let outTexture: THREE.Texture | null = null;
    let inTexture: THREE.Texture | null = null;
    if (outer?.design) {
      outTexture = loader.load(
        outer.design,
        (loaded) => {
          loaded.minFilter = THREE.LinearFilter;
          loaded.magFilter = THREE.LinearFilter;
          loaded.needsUpdate = true;
          setOutTex(loaded);
        },
        undefined,
        (err) => {
          console.error("Error loading OUT texture:", err);
          setOutTex(null);
        },
      );
    } else {
      setOutTex(null);
    }
    if (inner?.design) {
      inTexture = loader.load(
        inner.design,
        (loaded) => {
          loaded.minFilter = THREE.LinearFilter;
          loaded.magFilter = THREE.LinearFilter;
          loaded.needsUpdate = true;
          setInTex(loaded);
        },
        undefined,
        (err) => {
          console.error("Error loading IN texture:", err);
          setInTex(null);
        },
      );
    } else {
      setInTex(null);
    }
    return () => {
      if (outTexture) outTexture.dispose();
      if (inTexture) inTexture.dispose();
    };
  }, [ti]);
  const th = h * Math.sqrt(2);
  const dh =
    f === "front_bottom_l" ||
    f === "front_bottom_r" ||
    f === "back_bottom_l" ||
    f === "back_bottom_r"
      ? th * 1.0
      : h;
  const fl =
    f === "front_bottom_l" ||
    f === "front_bottom_r" ||
    f === "back_bottom_l" ||
    f === "back_bottom_r"
      ? th * 1.0
      : w;
  const nd = nz * 1.01;
  const dpy =
    f === "front_bottom_l" ||
    f === "front_bottom_r" ||
    f === "back_bottom_l" ||
    f === "back_bottom_r"
      ? h * 0.5
      : 0;
  const odrz =
    f === "front_bottom_l" || f === "back_bottom_l"
      ? Math.PI * 0.25
      : f === "front_bottom_r" || f === "back_bottom_r"
        ? Math.PI * 1.75
        : 0;
  const idrz =
    f === "front_bottom_l" || f === "back_bottom_l"
      ? Math.PI * 1.75
      : f === "front_bottom_r" || f === "back_bottom_r"
        ? Math.PI * 0.25
        : 0;
  return (
    <>
      <a.group position={p} rotation-x={rx} rotation-y={ry} rotation-z={rz}>
        <a.mesh
          geometry={geom}
          material={materials}
          position={o}
          rotation-x={mrx}
          rotation-y={mry}
          rotation-z={mrz}
        >
          {hingeCover && (
            <>
              {f !== "fixed" && (
                <HingeCover
                  nz={nz}
                  length={h}
                  map={materials[1]}
                  pos={[-w / 2, -h / 2, 0]}
                  rot={[Math.PI / 2, Math.PI, 0]}
                  direction={"left"}
                />
              )}
              <HingeCover
                map={materials[1]}
                nz={nz}
                length={w}
                pos={[-w / 2, h / 2, 0]}
                rot={[Math.PI / 2, (-Math.PI * 3) / 2, -Math.PI / 2]}
                direction={"top"}
                rad={Math.PI}
              />
              <HingeCover
                map={materials[1]}
                nz={nz}
                length={w}
                pos={[-w / 2, -h / 2, 0]}
                rot={[-Math.PI / 2, Math.PI / 2, -Math.PI / 2]}
                direction={"bottom"}
              />
            </>
          )}
          {outTex && (
            <Decal
              position={[0, dpy, nz]}
              rotation={[0, 0, odrz]}
              scale={[fl, dh, nd]}
            >
              <meshStandardMaterial
                transparent
                map={outTex}
                side={THREE.FrontSide}
                depthTest={true}
                polygonOffset
                polygonOffsetFactor={-1}
                polygonOffsetUnits={-1}
              />
            </Decal>
          )}
          {inTex && (
            <Decal
              position={[0, dpy, -nz]}
              rotation={[0, -Math.PI, idrz]}
              scale={[fl, dh, -nd]}
            >
              <meshStandardMaterial
                transparent
                map={inTex}
                side={THREE.FrontSide}
                depthTest={true}
                polygonOffset
                polygonOffsetFactor={-1}
                polygonOffsetUnits={-1}
              />
            </Decal>
          )}
        </a.mesh>
      </a.group>
    </>
  );
}
interface MailerFlapProps {
  w: number;
  h: number;
  t: number;
  inner: string;
  outer: string;
  f: string;
  p?: [number, number, number];
  rx?: number | SpringValue<number> | any;
  ry?: number | SpringValue<number> | any;
  rz?: number | SpringValue<number> | any;
  o?: [number, number, number];
  mrx?: number;
  mry?: number;
  mrz?: number;
  hingeCover?: boolean;
  model?: string;
  ti?: TextureItem[] | null;
}
export function MailerFlap({
  w,
  h,
  t,
  inner,
  outer,
  f,
  p = [0, 0, 0],
  rx = 0,
  ry = 0,
  rz = 0,
  o = [0, 0, 0],
  mrx = 0,
  mry = 0,
  mrz = 0,
  hingeCover = false,
  model = "rect",
  ti,
}: MailerFlapProps) {
  const flute = useDesignStore((s) => s.flute);
  const d = flute.val * 0.01;
  const fluteWall = useDesignStore((s) => s.fluteWall);
  const [edgeTex, setEdgeTex] = useState<THREE.Texture>();
  const [edgeTexX, setEdgeTexX] = useState<THREE.Texture>();
  const { fw, fwy, fwx, fwa, fwb, fwc, aa, ab, ac, la, lb, fwz, ax } =
    useFluteWallConfig(flute.key, fluteWall);
  const nz = d * fw;
  const material = useDesignStore((s) => s.material);
  // const textureMap: Record<string, string> = {
  //   brown_kraft: "/textures/carton.png",
  //   white_kraft: "/textures/white.png",
  //   premium_white: "/textures/white.png",
  // };
  const selected = {
    inner: textureMap[material.inner.id] ?? textureMap["brown_kraft"],
    outer: textureMap[material.outer.id] ?? textureMap["brown_kraft"],
  };
  const [innerTexture, outerTexture, edgeTexture, texX] = useTexture([
    selected.inner,
    selected.outer,
    "/textures/edge.jpeg",
    "/textures/edge.jpeg",
  ]);
  [innerTexture, outerTexture, edgeTexture].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
  });
  useEffect(() => {
    if (!edgeTexture) return;
    const tex = edgeTexture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(fwz, fwy);
    tex.center.set(1, 1);
    tex.offset.set(ax, 1);
    tex.needsUpdate = true;
    setEdgeTex(tex);
    const texN = make3LinesTexture(fwa, fwb, fwc, aa, ab, ac, la, lb);
    if (!texN) return;
    texN.wrapS = texN.wrapT = THREE.RepeatWrapping;
    texN.repeat.set(1, fwx);
    texN.center.set(1, 1);
    texN.needsUpdate = true;
    setEdgeTexX(texN);
  }, [edgeTexture, fw, fwy, fwx, fwa, fwb, fwc, aa, ab, ac, la, lb, fwz, ax]);
  const geom = useMemo(() => {
    let shape = null;
    switch (model) {
      case "rect":
        shape = rect(w, h);
        break;
      case "f":
        shape = fixedMailer(w, h, t);
        break;
      case "qrt":
        shape = quarterRoundTMailer(w, h);
        break;
      case "qrb":
        shape = quarterRoundBMailer(w, h);
        break;
      case "ft":
        shape = frontMailer(w, h, t);
        break;
      case "bk":
        shape = backMailer(w, h, t);
        break;
      case "ef":
        shape = extraFMailer(w, h);
        break;
      case "bt":
        shape = bridgeTMailer(w, h, t);
        break;
      case "bb":
        shape = bridgeBMailer(w, h, t);
        break;
      case "es":
        shape = extraSMailer(w, h, t);
        break;
    }
    const extrudeSettings = {
      steps: 1,
      depth: nz,
      bevelEnabled: false,
      curveSegments: 64,
    };
    const flapGeometry = new THREE.ExtrudeGeometry(shape!, extrudeSettings);
    flapGeometry.center();
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
    for (let face = 0; face < faceCount; face++) {
      const vi = face * 3;
      const nz = norm.getZ(vi);
      let target;
      if (Math.abs(nz) > 0.8) {
        target = nz > 0 ? "inner" : "outer";
      } else {
        const ax = Math.abs(norm.getX(vi));
        const ay = Math.abs(norm.getY(vi));
        target = ay > ax ? "yside" : "xside";
      }
      groups[target].push(vi);
    }
    for (const [matIndex, list] of [
      [0, groups.outer],
      [1, groups.inner],
      [2, groups.yside],
      [3, groups.xside],
    ]) {
      (list as number[]).forEach((vi) =>
        flapGeometry.addGroup(vi, 3, matIndex as number),
      );
    }
    return flapGeometry;
  }, [w, h, t, nz]);
  const materials = React.useMemo(() => {
    if (!innerTexture || !outerTexture || !edgeTex || !edgeTexX) return [];
    const innerMat = new THREE.MeshStandardMaterial({
      map: inner !== "transparent" ? null : innerTexture,
      side: THREE.DoubleSide, // depan
      color: inner === "transparent" ? 0xffffff : new THREE.Color(inner),
    });
    const outerMat = new THREE.MeshStandardMaterial({
      map: outer !== "transparent" ? null : outerTexture,
      side: THREE.DoubleSide, // belakang
      color: outer === "transparent" ? 0xffffff : new THREE.Color(outer),
    });
    const edgeLeftRight = new THREE.MeshStandardMaterial({
      map: edgeTexX,
      side: THREE.DoubleSide,
    });
    const edgeTopBottom = new THREE.MeshStandardMaterial({
      map: edgeTex,
      side: THREE.DoubleSide,
    });
    return [
      innerMat, // index 1 → bottom/front
      outerMat, // index 0 → top/back
      edgeTopBottom, //index 2 → side walls y
      edgeLeftRight, //index 3 → side walls x
    ];
  }, [innerTexture, outerTexture, edgeTex, edgeTexX, inner, outer]);
  const [outTex, setOutTex] = useState<THREE.Texture | null>(null);
  const [inTex, setInTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!ti) {
      setOutTex(null);
      setInTex(null);
      return;
    }
    const outer = ti.find((a) => a.side === "outer") ?? null;
    const inner = ti.find((a) => a.side === "inner") ?? null;
    const loader = new THREE.TextureLoader();
    let outTexture: THREE.Texture | null = null;
    let inTexture: THREE.Texture | null = null;
    if (outer?.design) {
      outTexture = loader.load(
        outer.design,
        (loaded) => {
          loaded.minFilter = THREE.LinearFilter;
          loaded.magFilter = THREE.LinearFilter;
          loaded.needsUpdate = true;
          setOutTex(loaded);
        },
        undefined,
        (err) => {
          console.error("Error loading OUT texture:", err);
          setOutTex(null);
        },
      );
    } else {
      setOutTex(null);
    }
    if (inner?.design) {
      inTexture = loader.load(
        inner.design,
        (loaded) => {
          loaded.minFilter = THREE.LinearFilter;
          loaded.magFilter = THREE.LinearFilter;
          loaded.needsUpdate = true;
          setInTex(loaded);
        },
        undefined,
        (err) => {
          console.error("Error loading IN texture:", err);
          setInTex(null);
        },
      );
    } else {
      setInTex(null);
    }
    return () => {
      if (outTexture) outTexture.dispose();
      if (inTexture) inTexture.dispose();
    };
  }, [ti]);
  const hleft = [
    "front",
    "right",
    "back",
    "left",
    "bridge_top",
    "bridge_bottom",
    "back_top",
    "back_bottom",
  ];
  const hright = ["bridge_top", "bridge_bottom", "back_top", "back_bottom"];
  const dh = h;
  const fl =
    f === "extra"
      ? w + t * 0.75
      : f === "front_top" || f === "front_bottom"
        ? w + t * 1.25
        : w;
  const hltnb = f === "front" ? w - t * 0.75 : w - t / 2;
  const hxtnb = f === "front" ? (-w + t * 0.75) / 2 : (-w + t / 2) / 2;
  const hytnb = f === "front" ? (h - t) / 2 : h / 2;
  const btif = f === "back_top" ? (-h + t / 2) / 2 : -h / 2;
  const btbbif = f === "back_top" || f === "back_bottom" ? h - t / 4 : h;
  const nd = nz * 1.01;
  return (
    <a.group position={p} rotation-x={rx} rotation-y={ry} rotation-z={rz}>
      <a.mesh
        geometry={geom}
        material={materials}
        position={o}
        rotation-x={mrx}
        rotation-y={mry}
        rotation-z={mrz}
      >
        {hingeCover && (
          <>
            {hleft.includes(f) && (
              <HingeCover
                nz={nz}
                length={f === "front" ? h / 3 - 2 * t : btbbif}
                map={materials[1]}
                pos={[-w / 2, f === "front" ? -(h / 3 - 2 * t) / 2 : btif, 0]}
                rot={[Math.PI / 2, Math.PI, 0]}
                direction={"left"}
              />
            )}
            {hright.includes(f) && (
              <HingeCover
                nz={nz}
                length={
                  f === "bridge_top" || f === "bridge_bottom"
                    ? h - t / 2
                    : btbbif
                }
                map={materials[1]}
                pos={[w / 2, f === "bridge_bottom" ? (-h + t) / 2 : btif, 0]}
                rot={[Math.PI / 2, Math.PI, Math.PI / 2]}
                direction={"right"}
              />
            )}
            {(f === "front" || f === "back") && (
              <>
                <HingeCover
                  map={materials[1]}
                  nz={nz}
                  length={hltnb}
                  pos={[hxtnb, hytnb, 0]}
                  rot={[Math.PI, (-Math.PI * 3) / 2, -Math.PI / 2]}
                  direction={"top"}
                />
                <HingeCover
                  map={materials[1]}
                  nz={nz}
                  length={hltnb}
                  pos={[hxtnb, -hytnb, 0]}
                  rot={[-Math.PI / 2, Math.PI / 2, -Math.PI / 2]}
                  direction={"bottom"}
                />
              </>
            )}
          </>
        )}
        {outTex && (
          <Decal
            position={[0, 0, nz]}
            rotation={[0, 0, 0]}
            scale={[fl, dh, nd]}
          >
            <meshStandardMaterial
              transparent
              map={outTex}
              side={THREE.FrontSide}
              depthTest={true}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </Decal>
        )}
        {inTex && (
          <Decal
            position={[0, 0, -nz]}
            rotation={[0, -Math.PI, 0]}
            scale={[fl, dh, -nd]}
          >
            <meshStandardMaterial
              transparent
              map={inTex}
              side={THREE.FrontSide}
              depthTest={true}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </Decal>
        )}
      </a.mesh>
    </a.group>
  );
}