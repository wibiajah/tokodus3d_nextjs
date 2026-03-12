import { Decal, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDesignStore } from "@/store/design-store";
import {
  FixedFlap,
  Flap,
  FlapWithUCrop,
  MiddleFlap,
  MiddleFlapV2,
} from "../design/geometry";
import {
  make3LinesTexture,
  useFluteWallConfig,
} from "../design/flutewall-config";
function SandboxFlap() {
  const boxColor = useDesignStore((s) => s.boxColor);
  const fixedFlap = useDesignStore((s) => s.fixedFlap);
  const textures = useDesignStore((s) => s.textures);
  const texture = textures.find((a) => a.id === "back_top") ?? null;
  const size = useDesignStore((s) => s.size);
  const flute = useDesignStore((s) => s.flute);
  const fluteWall = useDesignStore((s) => s.fluteWall);
  const [base64Tex, setBase64Tex] = useState<THREE.Texture | null>(null);
  const [innerTexture, outerTexture, edgeTexture, texX] = useTexture([
    "/textures/carton.png",
    "/textures/carton.png",
    "/textures/edge.jpeg",
    "/textures/edge.jpeg",
  ]);
  [innerTexture, outerTexture, edgeTexture].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
  });
  const multi = 1 / 10;
  const l = size.length * multi;
  const w = size.width * multi;
  const h = size.height * multi;
  const t = size.depth * multi;
  const s = Math.min(l, w) / 2;
  const d = flute.val * multi * multi;
  const { fw, fwy, fwx, fwa, fwb, fwc, aa, ab, ac, la, lb, fwz, ax } =
    useFluteWallConfig(flute.key, fluteWall);
  const nz = d * fw;
  const [edgeTex, setEdgeTex] = useState<THREE.Texture>();
  const [edgeTexX, setEdgeTexX] = useState<THREE.Texture>();
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
  useEffect(() => {
    if (!texture?.design) {
      setBase64Tex(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    const tex = loader.load(
      texture.design,
      (loadedTexture) => {
        loadedTexture.needsUpdate = true;
        setBase64Tex(loadedTexture);
      },
      undefined,
      (error) => {
        console.error("Error loading texture:", error);
        setBase64Tex(null);
      }
    );
    return () => {
      if (tex) {
        tex.dispose();
      }
    };
  }, [texture?.design]); // Track texture.design secara langsung
  const { geom, mat } = useMemo(() => {
    const shape = Flap(l, s, t);
    // const shape = FixedFlap(fixedFlap / 10 / 10, s, t);
    // const shape = MiddleFlap(l, s, t);
    const extrudeSettings = {
      steps: 1,
      depth: nz,
      bevelEnabled: false,
      curveSegments: 64,
    };
    const flapGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    flapGeometry.center();
    const innerMat = new THREE.MeshStandardMaterial({
      map: innerTexture,
      side: THREE.DoubleSide,
    });
    const outerMat = new THREE.MeshStandardMaterial({
      map: outerTexture,
      side: THREE.DoubleSide,
    });
    const edgeLeftRight = new THREE.MeshStandardMaterial({
      map: edgeTexX,
      // map: edgeTexture,
      side: THREE.DoubleSide,
    });
    const edgeTopBottom = new THREE.MeshStandardMaterial({
      map: edgeTex,
      // map: edgeTexture,
      side: THREE.DoubleSide,
    });
    const materials = [outerMat, innerMat, edgeTopBottom, edgeLeftRight];
    flapGeometry.center();
    flapGeometry.computeVertexNormals();
    flapGeometry.clearGroups();
    const pos = flapGeometry.attributes.position;
    const norm = flapGeometry.attributes.normal;
    const vertexCount = pos.count;
    const faceCount = vertexCount / 3;
    const groups: Record<string, number[]> = {
      outer: [],
      inner: [],
      yside: [],
      xside: [],
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
        flapGeometry.addGroup(vi, 3, matIndex as number)
      );
    }
    return { geom: flapGeometry, mat: materials };
  }, [
    innerTexture,
    outerTexture,
    edgeTexture,
    w,
    h,
    nz,
    flute.key,
    edgeTex,
    edgeTexX,
    // ,edgeTexture
  ]);
  useEffect(() => {
    if (mat[1] && mat[1]) {
      (mat[0] as THREE.MeshStandardMaterial).color.set(boxColor);
      (mat[1] as THREE.MeshStandardMaterial).color.set(boxColor);
    }
  }, [boxColor, mat]);
  const designTexture = base64Tex;
  const nd = nz * 1.01;
  return (
    <group>
      <mesh geometry={geom} material={mat}>
        {designTexture && (
          <Decal
            debug
            position={[0, 0, nz]}
            rotation={[0, 0, 0]}
            scale={[l - 2 * t, s, nd]}
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
        )}
      </mesh>
    </group>
  );
}
export default SandboxFlap;
