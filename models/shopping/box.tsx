import { ShopFlap } from "@/components/design/flap-3d";
import { useShippingGeometry } from "@/hooks/use-geometry-helper";
import { useOpenCloseSpring } from "@/hooks/use-open-close-spring";
import { useTextureMap } from "@/hooks/use-texture-map";
import { useDesignStore } from "@/store/design-store";
import { a } from "@react-spring/three";
import { getBetweenByLength, getFixedByWidth } from "./model";
interface ShoppingBoxProps {
  l: number; // length
  w: number; // width
  h: number; // height
  t: number; // thickness of the box material
  innerColor: string;
  outerColor: string;
  openClose: number; // 0 = closed, 1 = fully open
}
export default function ShoppingBox({
  l,
  w,
  h,
  t,
  innerColor,
  outerColor,
  openClose,
}: ShoppingBoxProps) {
  const tali = useDesignStore((s) => s.tali);
  const textures = useDesignStore((s) => s.textures);
  const anim = useOpenCloseSpring(openClose);
  const geo = useShippingGeometry(l, w, h, t);
  const textureMap = useTextureMap(textures);
  const common = { l, t, s: geo.s, inner: innerColor, outer: outerColor };
  const n = getBetweenByLength(l, true);
  const f = getFixedByWidth(w, true);
  const top = 0.4; // dm
  const htop = top * 0.5;
  return (
    <a.group position={[0, 0, geo.s / 2]}>
      <ShopFlap
        hingeCover
        w={l}
        h={h}
        f={"front"}
        ti={textureMap["front"]}
        model="wh"
        n={n}
        m={htop}
        {...common}
      />
      <ShopFlap
        w={l}
        h={top}
        p={[0, h / 2, 0]}
        o={[0, top / 2, 0]}
        rx={anim.atas}
        f={"front_top"}
        ti={textureMap["front_top"]}
        model="wh"
        n={n}
        m={htop}
        {...common}
      />
      {/* <ShopFlap
        w={l}
        h={f + w / 2}
        p={[0, -h / 2, 0]}
        o={[0, -(f + w / 2) / 2, 0]}
        rx={anim.bawah.akhirf}
        f={"front_bottom"}
        ti={textureMap["front_bottom"]}
        {...common}
      /> */}
      <a.group rotation-x={anim.bawah.akhirf} position={[0, -h / 2, 0]}>
        <ShopFlap
          w={l}
          h={f + w / 2}
          o={[0, -(f + w / 2) / 2, 0]}
          f={"front_bottom"}
          model="it"
          ti={textureMap["front_bottom"]}
          {...common}
        />
        <a.group
          rotation-z={Math.PI / 4}
          position={[l / 2 - (f + w / 2) / 2, -(f + w / 2) / 2, 0]}
        >
          <ShopFlap
            w={(f + w / 2) * Math.sqrt(2)}
            h={(f + w / 2) / Math.sqrt(2)}
            o={[0, -((f + w / 2) / Math.sqrt(2)) / 2, 0]}
            rx={anim.bawah.akhirfx}
            f={"front_bottom_r"}
            model="tri"
            ti={textureMap["front_bottom_r"]}
            {...common}
          />
        </a.group>
        <a.group
          rotation-z={Math.PI * 1.75}
          position={[-(l / 2) + (f + w / 2) / 2, -(f + w / 2) / 2, 0]}
        >
          <ShopFlap
            w={(f + w / 2) * Math.sqrt(2)}
            h={(f + w / 2) / Math.sqrt(2)}
            o={[0, -((f + w / 2) / Math.sqrt(2)) / 2, 0]}
            rx={anim.bawah.akhirfx}
            f={"front_bottom_l"}
            model="tri"
            ti={textureMap["front_bottom_l"]}
            {...common}
          />
        </a.group>
      </a.group>
      <a.group position={[l / 2, 0, 0]} rotation-y={anim.samping}>
        <ShopFlap
          w={w}
          h={h}
          o={[w / 2, 0, 0]}
          f={"left"}
          hingeCover
          ti={textureMap["left"]}
          {...common}
        />
        <ShopFlap
          w={w}
          h={top}
          p={[w / 2, h / 2, 0]}
          o={[0, top / 2, 0]}
          rx={anim.atas}
          f={"left_top"}
          ti={textureMap["left_top"]}
          {...common}
        />
        <ShopFlap
          w={w}
          h={f + w / 2}
          p={[w / 2, -h / 2, 0]}
          o={[0, -(f + w / 2) / 2, 0]}
          rx={anim.bawah.awal}
          f={"left_bottom"}
          ti={textureMap["left_bottom"]}
          {...common}
        />
      </a.group>
      <a.group position={[-l / 2, 0, 0]} rotation-y={anim.balik}>
        <ShopFlap
          w={w}
          h={h}
          o={[-w / 2, 0, 0]}
          f={"right"}
          hingeCover
          ti={textureMap["right"]}
          {...common}
        />
        <ShopFlap
          w={w}
          h={top}
          p={[-w / 2, h / 2, 0]}
          o={[0, top / 2, 0]}
          rx={anim.atas}
          f={"right_top"}
          ti={textureMap["right_top"]}
          {...common}
        />
        <ShopFlap
          w={w}
          h={f + w / 2}
          p={[-w / 2, -h / 2, 0]}
          o={[0, -(f + w / 2) / 2, 0]}
          rx={anim.bawah.awal}
          f={"right_bottom"}
          ti={textureMap["right_bottom"]}
          {...common}
        />
        <a.group position={[-w, 0, 0]} rotation-y={anim.balik}>
          <ShopFlap
            w={l}
            h={h}
            o={[-l / 2, 0, 0]}
            f={"back"}
            hingeCover
            model="wh"
            n={n}
            m={htop}
            ti={textureMap["back"]}
            {...common}
          />
          <ShopFlap
            w={l}
            h={top}
            p={[-l / 2, h / 2, 0]}
            o={[0, top / 2, 0]}
            rx={anim.atas}
            f={"back_top"}
            model="wh"
            n={n}
            m={htop}
            ti={textureMap["back_top"]}
            {...common}
          />
          {/* <ShopFlap
            w={l}
            h={(f + w / 2)}
            p={[-l / 2, -h / 2, 0]}
            o={[0, -(f + w / 2) / 2, 0]}
            rx={anim.bawah.akhirb}
            f={"back_bottom"}
            ti={textureMap["back_bottom"]}
            {...common}
          /> */}
          <a.group rotation-x={anim.bawah.akhirb} position={[0, -h / 2, 0]}>
            <ShopFlap
              w={l}
              h={f + w / 2}
              p={[-l / 2, 0, 0]}
              o={[0, -(f + w / 2) / 2, 0]}
              f={"back_bottom"}
              model="it"
              ti={textureMap["back_bottom"]}
              {...common}
            />
            <a.group
              rotation-z={Math.PI / 4}
              position={[-(f + w / 2) / 2, -(f + w / 2) / 2, 0]}
            >
              <ShopFlap
                w={(f + w / 2) * Math.sqrt(2)}
                h={(f + w / 2) / Math.sqrt(2)}
                o={[0, -((f + w / 2) / Math.sqrt(2)) / 2, 0]}
                rx={anim.bawah.akhirbx}
                f={"back_bottom_r"}
                model="tri"
                ti={textureMap["back_bottom_r"]}
                {...common}
              />
            </a.group>
            <a.group
              rotation-z={Math.PI * 1.75}
              position={[-l + (f + w / 2) / 2, -(f + w / 2) / 2, 0]}
            >
              <ShopFlap
                w={(f + w / 2) * Math.sqrt(2)}
                h={(f + w / 2) / Math.sqrt(2)}
                o={[0, -((f + w / 2) / Math.sqrt(2)) / 2, 0]}
                rx={anim.bawah.akhirbx}
                f={"back_bottom_l"}
                model="tri"
                ti={textureMap["back_bottom_l"]}
                {...common}
              />
            </a.group>
          </a.group>
          {/* fixed */}
          <a.group position={[-l, 0, 0]} rotation-y={anim.balik}>
            <ShopFlap
              w={f}
              h={h}
              o={[-f / 2, 0, 0]}
              f={"fixed"}
              hingeCover
              ti={textureMap["fixed"]}
              {...common}
            />
            <ShopFlap
              w={f}
              h={top}
              p={[-f / 2, h / 2, 0]}
              o={[0, top / 2, 0]}
              rx={anim.atas}
              f={"fixed_top"}
              model="t1"
              ti={textureMap["fixed_top"]}
              {...common}
            />
            <ShopFlap
              w={f}
              h={f + w / 2}
              p={[-f / 2, -h / 2, 0]}
              o={[0, -(f + w / 2) / 2, 0]}
              rx={anim.bawah.awal}
              f={"fixed_bottom"}
              model="t0"
              ti={textureMap["fixed_bottom"]}
              {...common}
            />
          </a.group>
        </a.group>
      </a.group>
        {openClose && openClose > 0.7 && tali.kode !== "tanpa_tali" &&(
          <>
          <BagRope
          holeSpacing={l/2}
          ropeLength={1.2}
          position={new THREE.Vector3(0, h/2 - htop, 0.025 * 1.5)}
          thickness={0.025}
          color="#c49a6c"
          />
          <BagRope
          holeSpacing={l/2}
          ropeLength={1.2}
          position={new THREE.Vector3(0, h/2 - htop, -0.025 * 1.5-w)}
          thickness={0.025}
          color="#c49a6c"
          invert
          />
          </>
      )}
    </a.group>
  );
}
import * as THREE from "three";
import { useRef, useMemo } from "react";
function BagRope({
  holeSpacing = 0.6,
  ropeLength = 1.2,
  position = new THREE.Vector3(0, 0, 0),
  thickness = 0.025,
  segments = 60,
  color = "#b8956a",
  invert= false,
}) {
  const flip = invert ? -1 : 1;
  const meshRef = useRef<THREE.Mesh>(null);
  // Buat kurva parabola untuk bentuk tali yang natural
  const curve = useMemo(() => {
    const points = [];
    const halfSpan = holeSpacing / 2;
    points.push(new THREE.Vector3(THREE.MathUtils.lerp(-halfSpan, halfSpan, -0.25/segments), ropeLength * (1 - 4 * Math.pow(-0.25/segments - 0.5, 2)), -thickness*2*flip));
    const tStart = 0 / segments; // 0 → 1
    points.push(new THREE.Vector3(THREE.MathUtils.lerp(-halfSpan, halfSpan, tStart), ropeLength * (1 - 4 * Math.pow(tStart - 0.5, 2)), -thickness*flip));
    for (let i = 1; i <= segments - 1; i++) {
      const t = i / segments; // 0 → 1
      const x = THREE.MathUtils.lerp(-halfSpan, halfSpan, t);
      // Parabola: y = ropeLength * (1 - 4*(t-0.5)^2)
      // Menghasilkan kurva naik di tengah, turun di ujung
      const y = ropeLength * (1 - 4 * Math.pow(t - 0.5, 2));
      points.push(new THREE.Vector3(x, y, 0));
    }
    const tEnd = 1; // 0 → 1
    points.push(new THREE.Vector3(THREE.MathUtils.lerp(-halfSpan, halfSpan, tEnd), ropeLength * (1 - 4 * Math.pow(tEnd - 0.5, 2)), -thickness*flip));
    points.push(new THREE.Vector3(THREE.MathUtils.lerp(-halfSpan, halfSpan, 1+(0.25/segments)), ropeLength * (1 - 4 * Math.pow(1+(0.25/segments) - 0.5, 2)), -thickness*2*flip));
    return new THREE.CatmullRomCurve3(points);
  }, [holeSpacing, ropeLength, segments]);
  // Buat TubeGeometry dari kurva
  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, segments, thickness, 8, false);
  }, [curve, segments, thickness]);
  // Material tali — sedikit kasar seperti tali rami
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.85,
      metalness: 0.0,
    });
  }, [color]);
  return (
    <group position={position}>
      <mesh ref={meshRef} geometry={tubeGeometry} material={material} />
      <mesh position={[-holeSpacing / 2, 0, -thickness*3*flip]} rotation-x={Math.PI/2}>
        <cylinderGeometry args={[thickness * 1.6, thickness * 1.6, 0.02, 16]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[holeSpacing / 2, 0, -thickness*3*flip]} rotation-x={Math.PI/2}>
        <cylinderGeometry args={[thickness * 1.6, thickness * 1.6, 0.02, 16]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.6} metalness={0.3} />
      </mesh>
    </group>
  );
}