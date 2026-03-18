"use client";
import React, { useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { a, useSpring } from "@react-spring/three";
import { useTexture, Decal } from "@react-three/drei";
import { useDesignStore, TextureItem } from "@/store/design-store";
import { useTextureMap } from "@/hooks/use-texture-map";
import { useFluteWallConfig, make3LinesTexture } from "@/components/design/flutewall-config";
import { getGableProportion } from "./model";

// texture map sama seperti model lain
const texMap: Record<string, string> = {
  brown_kraft:   "/textures/carton.png",
  white_kraft:   "/textures/white.png",
  premium_white: "/textures/premium-white.png",
  ivory:         "/textures/ivory.png",
  art_paper:     "/textures/art-paper.png",
  duplex:        "/textures/duplex.png",
  "1":  "/textures/carton.png",
  "2":  "/textures/white.png",
  "3":  "/textures/premium-white.png",
  "6":  "/textures/ivory.png",
  "7":  "/textures/art-paper.png",
  "20": "/textures/carton.png",
  "22": "/textures/duplex.png",
};

// ─── Shape builders ────────────────────────────────────────────────────────

function makeRect(w: number, h: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(w, 0);
  s.lineTo(w, h);
  s.lineTo(0, h);
  s.closePath();
  return s;
}

function makeTrapezoid(wBottom: number, wTop: number, h: number): THREE.Shape {
  const diff = (wBottom - wTop) / 2;
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(wBottom, 0);
  s.lineTo(wBottom - diff, h);
  s.lineTo(diff, h);
  s.closePath();
  return s;
}

function makeTriangle(base: number, h: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(base, 0);
  s.lineTo(base / 2, h);
  s.closePath();
  return s;
}

function buildGeom(shape: THREE.Shape, depth: number): THREE.ExtrudeGeometry {
  const g = new THREE.ExtrudeGeometry(shape, {
    steps: 1, depth, bevelEnabled: false, curveSegments: 8,
  });
  g.computeVertexNormals();
  g.clearGroups();
  const norm = g.attributes.normal;
  const groups: Record<string, number[]> = { outer:[], inner:[], yside:[], xside:[] };
  for (let i = 0; i < norm.count / 3; i++) {
    const vi = i * 3;
    const nz = norm.getZ(vi);
    if (Math.abs(nz) > 0.8) groups[nz > 0 ? "inner" : "outer"].push(vi);
    else groups[Math.abs(norm.getX(vi)) > Math.abs(norm.getY(vi)) ? "xside" : "yside"].push(vi);
  }
  ([["outer",0],["inner",1],["yside",2],["xside",3]] as [string,number][])
    .forEach(([k,mi]) => groups[k].forEach(vi => g.addGroup(vi, 3, mi)));
  return g;
}

// ─── Single Panel ──────────────────────────────────────────────────────────

interface PanelProps {
  shape: THREE.Shape;
  nz: number;
  inner: string;
  outer: string;
  ti?: TextureItem[] | null;
  dw: number;
  dh: number;
}

function Panel({ shape, nz, inner, outer, ti, dw, dh }: PanelProps) {
  const flute     = useDesignStore(s => s.flute);
  const fluteWall = useDesignStore(s => s.fluteWall);
  const material  = useDesignStore(s => s.material);
  const { fw, fwy, fwx, fwa, fwb, fwc, aa, ab, ac, la, lb, fwz, ax } =
    useFluteWallConfig(flute.key, fluteWall);

  const selIn  = texMap[material.inner.id] ?? texMap["brown_kraft"];
  const selOut = texMap[material.outer.id] ?? texMap["brown_kraft"];
  const [iTex, oTex, eTex] = useTexture([selIn, selOut, "/textures/edge.jpeg"]);
  [iTex, oTex, eTex].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1,1); });

  const [eY, setEY] = useState<THREE.Texture|null>(null);
  const [eX, setEX] = useState<THREE.Texture|null>(null);
  useEffect(() => {
    if (!eTex) return;
    const ty = eTex.clone();
    ty.wrapS = ty.wrapT = THREE.RepeatWrapping;
    ty.repeat.set(fwz, fwy); ty.center.set(1,1); ty.offset.set(ax,1); ty.needsUpdate = true;
    setEY(ty);
    const tx = make3LinesTexture(fwa,fwb,fwc,aa,ab,ac,la,lb);
    if (!tx) return;
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    tx.repeat.set(1,fwx); tx.center.set(1,1); tx.needsUpdate = true;
    setEX(tx);
  }, [eTex, fw, fwy, fwx, fwa, fwb, fwc, aa, ab, ac, la, lb, fwz, ax]);

  const geom = useMemo(() => buildGeom(shape, nz), [shape, nz]);
  const mats = useMemo(() => {
    if (!eY || !eX) return [];
    return [
      new THREE.MeshStandardMaterial({ map: outer==="transparent"?oTex:null, color: outer==="transparent"?0xffffff:new THREE.Color(outer), side:THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ map: inner==="transparent"?iTex:null, color: inner==="transparent"?0xffffff:new THREE.Color(inner), side:THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ map: eY, side:THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ map: eX, side:THREE.DoubleSide }),
    ];
  }, [iTex, oTex, eY, eX, inner, outer]);

  const [outTex, setOutTex] = useState<THREE.Texture|null>(null);
  const [inTex,  setInTex ] = useState<THREE.Texture|null>(null);
  useEffect(() => {
    if (!ti) { setOutTex(null); setInTex(null); return; }
    const loader = new THREE.TextureLoader();
    const o = ti.find(a => a.side==="outer");
    const i = ti.find(a => a.side==="inner");
    if (o?.design) loader.load(o.design, t => { t.minFilter=t.magFilter=THREE.LinearFilter; t.needsUpdate=true; setOutTex(t); });
    else setOutTex(null);
    if (i?.design) loader.load(i.design, t => { t.minFilter=t.magFilter=THREE.LinearFilter; t.needsUpdate=true; setInTex(t); });
    else setInTex(null);
  }, [ti]);

  const nd = nz * 1.01;
  return (
    <mesh geometry={geom} material={mats}>
      {outTex && (
        <Decal position={[dw/2, dh/2, nz]} rotation={[0,0,0]} scale={[dw, dh, nd]}>
          <meshStandardMaterial transparent map={outTex} side={THREE.FrontSide} depthTest polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1}/>
        </Decal>
      )}
      {inTex && (
        <Decal position={[dw/2, dh/2, -nz*0.01]} rotation={[0,Math.PI,0]} scale={[dw, dh, -nd]}>
          <meshStandardMaterial transparent map={inTex} side={THREE.FrontSide} depthTest polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1}/>
        </Decal>
      )}
    </mesh>
  );
}

// ─── GableBox ──────────────────────────────────────────────────────────────

interface GableBoxProps {
  l: number;  // panjang (dm)
  w: number;  // lebar   (dm)
  h: number;  // tinggi total (dm) — termasuk gable
  t: number;  // ketebalan material (dm)
  innerColor: string;
  outerColor: string;
  openClose: number;
}

export default function GableBox({ l, w, h, t, innerColor, outerColor, openClose }: GableBoxProps) {
  const textures  = useDesignStore(s => s.textures);
  const flute     = useDesignStore(s => s.flute);
  const tm        = useTextureMap(textures);
  const nz        = flute.val * 0.01;

  const { gableH, bodyH } = getGableProportion(h);
  const bottomF = Math.max(w * 0.5, t * 4);

  // animasi
  const { progress } = useSpring({
    progress: openClose,
    config: { mass:1, tension:200, friction:24 },
  });

  // front/back gable buka ke depan/belakang
  const frontGblRx = progress.to([0,0.7,1], [0, -Math.PI*0.48, -Math.PI*0.5]);
  const backGblRx  = progress.to([0,0.7,1], [0,  Math.PI*0.48,  Math.PI*0.5]);
  // side gable (segitiga) buka ke samping — delay sedikit
  const sideGblRx  = progress.to([0,0.2,0.8,1], [0, 0, -Math.PI*0.82, -Math.PI*0.82]);

  const c = { nz, inner:innerColor, outer:outerColor };

  // shapes — semua mulai dari (0,0) supaya pivot jelas
  const sFront  = useMemo(() => makeRect(l, bodyH),                [l, bodyH]);
  const sBack   = useMemo(() => makeRect(l, bodyH),                [l, bodyH]);
  const sLeft   = useMemo(() => makeRect(w, bodyH),                [w, bodyH]);
  const sRight  = useMemo(() => makeRect(w, bodyH),                [w, bodyH]);
  const sBot    = useMemo(() => makeRect(l, bottomF),              [l, bottomF]);
  const sFGbl   = useMemo(() => makeTrapezoid(l, t*2, gableH),    [l, t, gableH]);
  const sBGbl   = useMemo(() => makeTrapezoid(l, t*2, gableH),    [l, t, gableH]);
  const sSGbl   = useMemo(() => makeTriangle(w, gableH),           [w, gableH]);

  // offset supaya box center di origin
  // body: Y dari -bodyH/2 s/d +bodyH/2
  // gable: di atas body
  const hl = l/2;
  const hw = w/2;

  return (
    <group position={[0, 0, 0]}>

      {/* ── FRONT panel: z = +hw, rotate Y=0 ── */}
      <group position={[-hl, -bodyH/2, hw]}>
        <Panel shape={sFront} {...c} ti={tm["front"]} dw={l} dh={bodyH}/>
      </group>

      {/* ── BACK panel: z = -hw, dibalik ── */}
      <group position={[hl, -bodyH/2, -hw]} rotation-y={Math.PI}>
        <Panel shape={sBack} {...c} ti={tm["back"]} dw={l} dh={bodyH}/>
      </group>

      {/* ── LEFT panel: x = -hl ── */}
      <group position={[-hl, -bodyH/2, hw]} rotation-y={-Math.PI/2}>
        <Panel shape={sLeft} {...c} ti={tm["left"]} dw={w} dh={bodyH}/>
      </group>

      {/* ── RIGHT panel: x = +hl ── */}
      <group position={[hl, -bodyH/2, -hw]} rotation-y={Math.PI/2}>
        <Panel shape={sRight} {...c} ti={tm["right"]} dw={w} dh={bodyH}/>
      </group>

      {/* ── BOTTOM flap ── */}
      <group position={[-hl, -bodyH/2, hw]} rotation-x={Math.PI/2}>
        <Panel shape={sBot} {...c} ti={tm["bottom"]} dw={l} dh={bottomF}/>
      </group>

      {/* ── GABLE FRONT: pivot di tepi atas front panel (y=+bodyH/2, z=+hw) ── */}
      <a.group position={[-hl, bodyH/2, hw]} rotation-x={frontGblRx}>
        {/* panel mulai dari (0,0) naik ke atas */}
        <group position={[0, 0, 0]}>
          <Panel shape={sFGbl} {...c} ti={tm["front_gable"]} dw={l} dh={gableH}/>
        </group>
      </a.group>

      {/* ── GABLE BACK: pivot di tepi atas back panel ── */}
      <a.group position={[hl, bodyH/2, -hw]} rotation-y={Math.PI} rotation-x={backGblRx}>
        <group position={[0, 0, 0]}>
          <Panel shape={sBGbl} {...c} ti={tm["back_gable"]} dw={l} dh={gableH}/>
        </group>
      </a.group>

      {/* ── GABLE LEFT: pivot di tepi atas left panel ── */}
      <a.group position={[-hl, bodyH/2, hw]} rotation-y={-Math.PI/2}>
        <a.group rotation-x={sideGblRx}>
          <Panel shape={sSGbl} {...c} ti={tm["left_gable"]} dw={w} dh={gableH}/>
        </a.group>
      </a.group>

      {/* ── GABLE RIGHT: pivot di tepi atas right panel ── */}
      <a.group position={[hl, bodyH/2, -hw]} rotation-y={Math.PI/2}>
        <a.group rotation-x={sideGblRx}>
          <Panel shape={sSGbl} {...c} ti={tm["right_gable"]} dw={w} dh={gableH}/>
        </a.group>
      </a.group>

    </group>
  );
}