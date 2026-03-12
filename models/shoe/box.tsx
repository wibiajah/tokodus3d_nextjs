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
  const textures = useDesignStore((s) => s.textures);
  const anim = useOpenCloseSpring(openClose);
  const geo = useShippingGeometry(l, w, h, t);
  const textureMap = useTextureMap(textures);
  const common = { l, t, s: geo.s, inner: innerColor, outer: outerColor };
  const n = getBetweenByLength(l, true);
  const f = getFixedByWidth(w, true);
  // console.log("f n l:", f, n, l);
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
      <ShopFlap
        w={l}
        h={f + w / 2}
        p={[0, -h / 2, 0]}
        o={[0, -(f + w / 2) / 2, 0]}
        rx={anim.bawah.akhirf}
        f={"front_bottom"}
        ti={textureMap["front_bottom"]}
        {...common}
      />
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
      <a.group position={[-l/2, 0, 0]} rotation-y={anim.balik}>
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
          <ShopFlap
            w={l}
            h={(f + w / 2)}
            p={[-l / 2, -h / 2, 0]}
            o={[0, -(f + w / 2) / 2, 0]}
            rx={anim.bawah.akhirb}
            f={"back_bottom"}
            ti={textureMap["back_bottom"]}
            {...common}
          />
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
            h={(f + w / 2)}
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
    </a.group>
  );
}
