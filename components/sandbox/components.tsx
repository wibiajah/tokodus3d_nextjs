import { TextureItem, useDesignStore } from "@/store/design-store";
import { a, SpringValue } from "@react-spring/three";
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import {
  make3LinesTexture,
  useFluteWallConfig,
} from "../design/flutewall-config";
import { Decal, useTexture } from "@react-three/drei";
import {
  isoscelesTrz,
  rect,
  rectWith2Holes,
  trapezoid,
  triangle,
} from "../design/geometry";
import { HingeCover } from "../design/flap-3d";
type EulerRotation = {
  rx?: number | SpringValue<number> | any;
  ry?: number | SpringValue<number> | any;
  rz?: number | SpringValue<number> | any;
  q?: never;
};
type QuaternionRotation = {
  q: SpringValue<THREE.Quaternion> | THREE.Quaternion | any;
  rx?: never;
  ry?: never;
  rz?: never;
};
type RotationProps = EulerRotation | QuaternionRotation;
type CustomProps = RotationProps & {
  w: number;
  h: number;
  t: number;
  p?: [number, number, number];
  o?: [number, number, number];
  mrx?: number | SpringValue<number> | any;
  mry?: number | SpringValue<number> | any;
  mrz?: number | SpringValue<number> | any;
  type?: string;
};
export function Custom({
  w,
  h,
  t,
  p = [0, 0, 0],
  rx,
  ry,
  rz,
  q,
  o = [0, 0, 0],
  mrx = 0,
  mry = 0,
  mrz = 0,
  type = "trz",
}: CustomProps) {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    if (type === "trz") {
      shape.moveTo(0, 0);
      shape.lineTo(w, 0);
      shape.lineTo(w - h, -h);
      shape.lineTo(h, -h);
      shape.lineTo(0, 0);
    } else {
      shape.moveTo(0, 0);
      shape.lineTo(w, 0);
      shape.lineTo(w / 2, -h);
      shape.lineTo(0, 0);

      // shape.moveTo(-w/2, 0);
      // shape.lineTo(w/2, 0);
      // shape.lineTo(0, -h);
      // shape.lineTo(-w/2, 0);

      // shape.moveTo(-w/2, -h/2);
      // shape.lineTo(w/2, -h/2);
      // shape.lineTo(0, -h*1.5);
      // shape.lineTo(-w/2, -h/2);
    }
    const extrudeSettings = {
      steps: 1,
      depth: t,
      bevelEnabled: false,
      curveSegments: 64,
    };
    const flapGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    flapGeometry.center();
    return flapGeometry;
  }, []);
  return (
    <a.group position={p} rotation-x={rx} rotation-y={ry} rotation-z={rz}>
      <a.mesh
        geometry={geom}
        position={o}
        rotation-x={mrx}
        rotation-y={mry}
        rotation-z={mrz}
      >
        <meshStandardMaterial color={type === "trz" ? "orange" : "green"} />
        {/* {type === "" && (
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="orange" />
        </mesh>
      )} */}
      </a.mesh>
      {type === "" && (
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      )}
    </a.group>
  );
}

type FlapProps = {
  w: number;
  h: number;
  t: number;
  c: string;
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
export function Flap({
  w,
  h,
  t,
  c,
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
}: FlapProps) {
  const flute = useDesignStore((s) => s.flute);
  const d = flute.val * 0.01;
  const fluteWall = useDesignStore((s) => s.fluteWall);
  const [edgeTex, setEdgeTex] = useState<THREE.Texture>();
  const [edgeTexX, setEdgeTexX] = useState<THREE.Texture>();
  const { fw, fwy, fwx, fwa, fwb, fwc, aa, ab, ac, la, lb, fwz, ax } =
    useFluteWallConfig(flute.key, fluteWall);
  const nz = d * fw;
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
    if (!innerTexture || !outerTexture || !edgeTex || !edgeTexX) return [];
    const innerMat = new THREE.MeshStandardMaterial({
      map: innerTexture,
      side: THREE.DoubleSide, // depan
      color: new THREE.Color(c),
    });
    const outerMat = new THREE.MeshStandardMaterial({
      map: outerTexture,
      side: THREE.DoubleSide, // belakang
      color: new THREE.Color(c),
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
  }, [innerTexture, outerTexture, edgeTex, edgeTexX, c]);
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
  const u = w;
  const v = h;
  const dh = v;
  const fl = w;
  const nd = nz * 1.01;
  const th = h * Math.sqrt(2);
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
                  map={outerTexture}
                  pos={[-w / 2, -h / 2, 0]}
                  rot={[Math.PI / 2, Math.PI, 0]}
                  direction={"left"}
                />
              )}
              <HingeCover
                map={outerTexture}
                nz={nz}
                length={w}
                pos={[-w / 2, h / 2, 0]}
                rot={[Math.PI / 2, (-Math.PI * 3) / 2, -Math.PI / 2]}
                direction={"top"}
                rad={Math.PI}
              />
              <HingeCover
                map={outerTexture}
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
              debug={f == "front_bottom_l" || f === "front_bottom_r"}
              // debug
              position={[
                0,
                f === "front_bottom_l" ||
                f === "front_bottom_r" ||
                f === "back_bottom_l" ||
                f === "back_bottom_r"
                  ? h * 0.5
                  : 0,
                nz,
              ]}
              rotation={[
                0,
                0,
                f === "front_bottom_l" || f === "back_bottom_l"
                  ? Math.PI * 0.25
                  : f === "front_bottom_r" || f === "back_bottom_r"
                    ? Math.PI * 1.75
                    : 0,
              ]}
              scale={[
                f === "front_bottom_l" ||
                f === "front_bottom_r" ||
                f === "back_bottom_l" ||
                f === "back_bottom_r"
                  ? th * 1.0
                  : fl,
                f === "front_bottom_l" ||
                f === "front_bottom_r" ||
                f === "back_bottom_l" ||
                f === "back_bottom_r"
                  ? th * 1.0
                  : dh,
                nd,
              ]}
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
              // position={[0, 0, -nz]}
              // rotation={[0, -Math.PI, 0]}
              position={[
                0,
                f === "front_bottom_l" ||
                f === "front_bottom_r" ||
                f === "back_bottom_l" ||
                f === "back_bottom_r"
                  ? h * 0.5
                  : 0,
                -nz,
              ]}
              rotation={[
                0,
                -Math.PI,
                f === "front_bottom_l" || f === "back_bottom_l"
                  ? Math.PI * 1.75
                  : f === "front_bottom_r" || f === "back_bottom_r"
                    ? Math.PI * 0.25
                    : 0,
              ]}
              scale={[
                f === "front_bottom_l" ||
                f === "front_bottom_r" ||
                f === "back_bottom_l" ||
                f === "back_bottom_r"
                  ? th * 1.0
                  : fl,
                f === "front_bottom_l" ||
                f === "front_bottom_r" ||
                f === "back_bottom_l" ||
                f === "back_bottom_r"
                  ? th * 1.0
                  : dh,
                -nd,
              ]}
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
