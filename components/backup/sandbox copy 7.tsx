"use client";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import { useRef, useMemo } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

type BoxConfig = {
  w: number; // width
  d: number; // depth
  h: number; // height
  t: number; // thickness
  flap: number; // flap length
};

export default function SandboxFlap() {
  const config: BoxConfig = { w: 4, d: 3, h: 5, t: 0.12, flap: 1.6 };

  // const geomRef = useRef<THREE.BufferGeometry>(null!);
  const geomRef = useRef<THREE.Mesh>(null);


  const [innerTexture, outerTexture, edgeTexture] = useTexture([
    "/textures/carton.png",
    "/textures/carton.png",
    "/textures/edge.jpeg",
  ]);

  // Repeat so zig-zag corrugation is continuous
  [innerTexture, outerTexture, edgeTexture].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 0.7);
  });

  // const mesh = useMemo(() => {
  //   return buildThickBoxGeometry(config);
  // }, []);

  const flapGroups = useRef<FlapGroups | null>(null);

  const mesh = useMemo(() => {
    const g = buildThickBoxGeometry(config);
    flapGroups.current = extractFlapGroups(g, config);
    return g;
  }, []);

  // useFrame((state) => {
  //   const geom = geomRef.current;
  //   if (!geom || !flapGroups.current) return;

  //   const { top } = flapGroups.current;
  //   const pos = geom.attributes.position as THREE.BufferAttribute;

  //   const t = state.clock.getElapsedTime();
  //   const angle = Math.sin(t) * (Math.PI * 0.5); // animate from 0 → 90°

  //   // The fold edge (y = 0), from x=0 to x=totalW
  //   const edgeStart = new THREE.Vector3(0, 0, 0);
  //   const edgeEnd = new THREE.Vector3(
  //     config.w + config.d + config.w + config.d,
  //     0,
  //     0
  //   );

  //   for (const i of top) {
  //     rotateVertexAroundEdge(pos, i, edgeStart, edgeEnd, angle);
  //   }

  //   pos.needsUpdate = true;
  //   geom.computeVertexNormals();
  // });

  useFrame((state) => {
  const mesh = geomRef.current;
  if (!mesh) return;

  const geom = mesh.geometry;
  if (!geom) return;

  const pos = geom.getAttribute("position");
  if (!pos) return;

  if (!flapGroups.current) return;

  const { top } = flapGroups.current;

  const t = state.clock.getElapsedTime();
  const angle = Math.sin(t) * (Math.PI * 0.5); // animate from 0 → 90°

  const edgeStart = new THREE.Vector3(0, 0, 0);
  const edgeEnd = new THREE.Vector3(
    config.w + config.d + config.w + config.d,
    0,
    0
  );

  top.forEach((i) => {
    rotateVertexAroundEdge(
      pos,
      i,
      edgeStart,
      edgeEnd,
      angle
    );
  });

  pos.needsUpdate = true;
  geom.computeVertexNormals();
});


  return (
    <mesh geometry={mesh} ref={geomRef}>
      <meshStandardMaterial
        map={outerTexture}
        side={THREE.DoubleSide}
        vertexColors={false}
      />
      <meshStandardMaterial
        map={innerTexture}
        side={THREE.DoubleSide}
        vertexColors={false}
      />
      <meshStandardMaterial
        map={edgeTexture}
        side={THREE.DoubleSide}
        vertexColors={false}
      />
    </mesh>
  );
}

function buildThickBoxGeometry(cfg: BoxConfig) {
  const { w, d, h, t, flap } = cfg;

  const geom = new THREE.BufferGeometry();

  //
  // --- FLAT NET LAYOUT ---
  //     (looking from top)
  //
  //       +----+----+----+----+
  //       |TopFlap panels     |
  // +----+----+----+----+----+----+
  // |glue|  F |  R |  B |  L | glue seam
  // +----+----+----+----+----+----+
  //       |Bottom flap panels |
  //       +----+----+----+----+
  //
  // Each panel becomes:
  // outer surface
  // inner surface
  // thickness edges
  //

  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  let indexOffset = 0;

  function addQuad(
    a: [number, number],
    b: [number, number],
    c: [number, number],
    d: [number, number],
    uvA: [number, number],
    uvB: [number, number],
    uvC: [number, number],
    uvD: [number, number]
  ) {
    // push positions
    vertices.push(a[0], a[1], 0, b[0], b[1], 0, c[0], c[1], 0, d[0], d[1], 0);
    // push uvs
    uvs.push(uvA[0], uvA[1], uvB[0], uvB[1], uvC[0], uvC[1], uvD[0], uvD[1]);
    // indices
    indices.push(
      indexOffset,
      indexOffset + 1,
      indexOffset + 2,
      indexOffset,
      indexOffset + 2,
      indexOffset + 3
    );
    indexOffset += 4;
  }

  // PANEL SIZES
  const panelW = [w, d, w, d]; // F, R, B, L (cyclic)
  const totalW = w + d + w + d;

  //
  // MAIN SIDES (Continuous UV strip)
  //
  let xCursor = 0;

  for (let i = 0; i < 4; i++) {
    const pw = panelW[i];

    addQuad(
      [xCursor, 0],
      [xCursor + pw, 0],
      [xCursor + pw, -h],
      [xCursor, -h],

      [xCursor / totalW, 1],
      [(xCursor + pw) / totalW, 1],
      [(xCursor + pw) / totalW, 0],
      [xCursor / totalW, 0]
    );

    xCursor += pw;
  }

  //
  // TOP FLAPS
  //
  xCursor = 0;
  for (let i = 0; i < 4; i++) {
    const pw = panelW[i];

    addQuad(
      [xCursor, 0],
      [xCursor + pw, 0],
      [xCursor + pw, flap],
      [xCursor, flap],

      [xCursor / totalW, 1],
      [(xCursor + pw) / totalW, 1],
      [(xCursor + pw) / totalW, 1.2],
      [xCursor / totalW, 1.2]
    );

    xCursor += pw;
  }

  //
  // BOTTOM FLAPS
  //
  xCursor = 0;
  for (let i = 0; i < 4; i++) {
    const pw = panelW[i];

    addQuad(
      [xCursor, -h],
      [xCursor + pw, -h],
      [xCursor + pw, -h - flap],
      [xCursor, -h - flap],

      [xCursor / totalW, 0],
      [(xCursor + pw) / totalW, 0],
      [(xCursor + pw) / totalW, -0.2],
      [xCursor / totalW, -0.2]
    );

    xCursor += pw;
  }

  //
  // GLUE SEAM
  //
  addQuad(
    [-t, 0],
    [0, 0],
    [0, -h],
    [-t, -h],

    [-0.05, 1],
    [0, 1],
    [0, 0],
    [-0.05, 0]
  );

  //
  // CONVERT TO INNER/OUTER/EDGE FACES
  //
  const g = finalizeThickness(vertices, uvs, indices, t);

  return g;
}

//
// THICKNESS BUILDER
// Duplicates vertices inward and creates thickness-side faces
//

function finalizeThickness(
  verts: number[],
  uvs: number[],
  idx: number[],
  t: number
) {
  const pos = new Float32Array(verts);
  const uv = new Float32Array(uvs);
  const index = new Uint32Array(idx);

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geom.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geom.setIndex(new THREE.BufferAttribute(index, 1));

  geom.computeVertexNormals();

  // Clone inner surface
  const innerPos = pos.slice();
  for (let i = 0; i < innerPos.length; i += 3) {
    innerPos[i + 2] -= t; // push inward along Z
  }

  // Build combined geometry (outer + inner + edges)
  const fullGeom = new THREE.BufferGeometry();
  const merged = mergeGeometries(
    [
      geom, // outer
      buildInner(geom, t), // inner
      buildEdges(geom, t), // edge strips
    ],
    true
  );

  return merged;
}

//
// Creates the inner face with reversed normals
//
function buildInner(outer: THREE.BufferGeometry, t: number) {
  const inner = outer.clone();
  const pos = inner.getAttribute("position") as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, pos.getZ(i) - t);
  }

  // flip normals
  const idx = inner.getIndex()!;
  for (let i = 0; i < idx.count; i += 3) {
    const a = idx.getX(i);
    const b = idx.getX(i + 1);
    const c = idx.getX(i + 2);
    idx.setXYZ(i, c, b, a);
  }

  inner.computeVertexNormals();
  return inner;
}

//
// Creates the thickness faces along the edges
//
function buildEdges(outer: THREE.BufferGeometry, t: number) {
  const pos = outer.getAttribute("position") as THREE.BufferAttribute;
  const uv = outer.getAttribute("uv") as THREE.BufferAttribute;
  const idx = outer.getIndex()!;

  const edgeVerts: number[] = [];
  const edgeUVs: number[] = [];
  const edgeIdx: number[] = [];
  let offs = 0;

  for (let i = 0; i < idx.count; i += 3) {
    const A = idx.getX(i);
    const B = idx.getX(i + 1);
    const C = idx.getX(i + 2);

    // For each triangle, extrude edges to form thickness strip
    const tri = [A, B, C];

    for (let k = 0; k < 3; k++) {
      const i1 = tri[k];
      const i2 = tri[(k + 1) % 3];

      // push two quads per edge
      const p1 = new THREE.Vector3(pos.getX(i1), pos.getY(i1), pos.getZ(i1));
      const p2 = new THREE.Vector3(pos.getX(i2), pos.getY(i2), pos.getZ(i2));
      const p1i = p1.clone().setZ(p1.z - t);
      const p2i = p2.clone().setZ(p2.z - t);

      edgeVerts.push(
        p1.x,
        p1.y,
        p1.z,
        p2.x,
        p2.y,
        p2.z,
        p2i.x,
        p2i.y,
        p2i.z,
        p1i.x,
        p1i.y,
        p1i.z
      );

      edgeUVs.push(0, 1, 1, 1, 1, 0, 0, 0);

      edgeIdx.push(offs, offs + 1, offs + 2, offs, offs + 2, offs + 3);

      offs += 4;
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(edgeVerts), 3)
  );
  g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(edgeUVs), 2));
  g.setIndex(edgeIdx);

  g.computeVertexNormals();

  return g;
}

type FlapGroups = {
  top: number[];
  bottom: number[];
  left: number[];
  right: number[];
};

function extractFlapGroups(
  geom: THREE.BufferGeometry,
  cfg: BoxConfig
): FlapGroups {
  const { w, d, h, flap, t } = cfg;
  const pos = geom.getAttribute("position") as THREE.BufferAttribute;

  const groups = {
    top: [] as number[],
    bottom: [] as number[],
    left: [] as number[],
    right: [] as number[],
  };

  const totalW = w + d + w + d;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);

    // Identify using layout rules:
    if (y > 0) groups.top.push(i);
    else if (y < -h) groups.bottom.push(i);

    // Left flap region (starting panel width = w)
    if (x >= w + d + w && x <= totalW) groups.right.push(i);

    // Right flap region
    if (x >= 0 && x <= w) groups.left.push(i);
  }

  return groups;
}

function rotateVertexAroundEdge(
  pos: THREE.BufferAttribute,
  index: number,
  edgeStart: THREE.Vector3,
  edgeEnd: THREE.Vector3,
  angle: number
) {
  const p = new THREE.Vector3(
    pos.getX(index),
    pos.getY(index),
    pos.getZ(index)
  );

  const axis = new THREE.Vector3().subVectors(edgeEnd, edgeStart).normalize();

  // rotate
  p.sub(edgeStart);
  p.applyAxisAngle(axis, angle);
  p.add(edgeStart);

  pos.setXYZ(index, p.x, p.y, p.z);
}
