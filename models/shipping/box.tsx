import { ExtrudeBoxFlap, FixedBoxFlap } from "@/components/design/flap-3d";
import { useShippingGeometry } from "@/hooks/use-geometry-helper";
import { useOpenCloseSpring } from "@/hooks/use-open-close-spring";
import { useTextureMap } from "@/hooks/use-texture-map";
import { useDesignStore } from "@/store/design-store";
import { a } from "@react-spring/three";
interface ShippingBoxProps {
  l: number; // length
  w: number; // width
  h: number; // height
  t: number; // thickness of the box material
  innerColor: string;
  outerColor: string;
  openClose: number; // 0 = closed, 1 = fully open
}
export default function ShippingBox({
  l,
  w,
  h,
  t,
  innerColor,
  outerColor,
  openClose,
}: ShippingBoxProps) {
  const textures = useDesignStore((s) => s.textures);
  const fx = useDesignStore((s) => s.fixedFlap)/100;
  const anim = useOpenCloseSpring(openClose);
  const geo = useShippingGeometry(l, w, h, t);
  const textureMap = useTextureMap(textures);
  const common = { l, t, s: geo.s, inner: innerColor, outer: outerColor };
  return (
    <a.group position={[0, 0, geo.hs]}>
      <FixedBoxFlap
        w={fx + geo.ht}
        h={h}
        p={[-geo.hl, 0, 0]}
        o={[(fx + geo.qt) / 2, 0, 0]} // anehnya justru ini yg benar
        ry={anim.fixed}
        mry={Math.PI}
        ti={textureMap["fixed"]}
        {...common}
      />
      <ExtrudeBoxFlap
        hingeCover
        w={l}
        h={h}
        f={"back"}
        ti={textureMap["back"]}
        {...common}
      />
      <ExtrudeBoxFlap
        w={l}
        h={geo.hs}
        p={[0, geo.hh, 0]}
        o={[0, geo.qs, 0]}
        rx={w >= l ? anim.top.small : anim.top.normal}
        f={"back_top"}
        ti={textureMap["back_top"]}
        model="flap"
        {...common}
      />
      <ExtrudeBoxFlap
        w={l}
        h={geo.hs}
        p={[0, -geo.hh, 0]}
        o={[0, -geo.qs, 0]}
        rx={w >= l ? anim.bottom.small : anim.bottom.normal}
        f={"back_bottom"}
        ti={textureMap["back_bottom"]}
        model="flap"
        {...common}
      />
      <a.group position={[geo.hl, 0, 0]} rotation-y={anim.side}>
        <ExtrudeBoxFlap
          w={w}
          h={h}
          o={[geo.hw, 0, 0]}
          f={"right"}
          hingeCover
          model="middle2"
          ti={textureMap["right"]}
          {...common}
        />
        <ExtrudeBoxFlap
          w={w}
          h={geo.hs}
          p={[geo.hw, geo.qnh-0.01, 0]}
          o={[0, geo.qs+0.01, 0]}
          rx={w >= l ? anim.top.normal : anim.top.small}
          f={"right_top"}
          model="flapucrop"
          ti={textureMap["right_top"]}
          {...common}
        />
        <ExtrudeBoxFlap
          w={w}
          h={geo.hs}
          p={[geo.hw, -(geo.qnh-0.01), 0]}
          o={[0, -(geo.qs+0.01), 0]}
          rx={w >= l ? anim.bottom.normal : anim.bottom.small}
          f={"right_bottom"}
          model="flapucropr"
          ti={textureMap["right_bottom"]}
          {...common}
        />
        <a.group position={[w, 0, 0]} rotation-y={anim.side}>
          <ExtrudeBoxFlap
            w={l}
            h={h}
            o={[geo.hl, 0, 0]}
            f={"front"}
            hingeCover
            ti={textureMap["front"]}
            {...common}
          />
          <ExtrudeBoxFlap
            w={l}
            h={geo.hs}
            p={[geo.hl, geo.hh, 0]}
            o={[0, geo.qs, 0]}
            rx={w >= l ? anim.top.small : anim.top.normal}
            f={"front_top"}
            ti={textureMap["front_top"]}
            model="flap"
            {...common}
          />
          <ExtrudeBoxFlap
            w={l}
            h={geo.hs}
            p={[geo.hl, -geo.hh, 0]}
            o={[0, -geo.qs, 0]}
            rx={w >= l ? anim.bottom.small : anim.bottom.normal}
            f={"front_bottom"}
            ti={textureMap["front_bottom"]}
            model="flap"
            {...common}
          />
          <a.group position={[l, 0, 0]} rotation-y={anim.side}>
            <ExtrudeBoxFlap
              w={w}
              h={h}
              o={[geo.hw, 0, 0]}
              f={"left"}
              hingeCover
              model="middle2"
              ti={textureMap["left"]}
              {...common}
            />
            <ExtrudeBoxFlap
              w={w}
              h={geo.hs}
              p={[geo.hw, (geo.qnh-0.01), 0]}
              o={[0, (geo.qs+0.01), 0]}
              rx={w >= l ? anim.top.normal : anim.top.small}
              f={"left_top"}
              model="flapucrop"
              ti={textureMap["left_top"]}
              {...common}
            />
            <ExtrudeBoxFlap
              w={w}
              h={geo.hs}
              p={[geo.hw, -(geo.qnh-0.01), 0]}
              o={[0, -(geo.qs+0.01), 0]}
              rx={w >= l ? anim.bottom.normal : anim.bottom.small}
              f={"left_bottom"}
              model="flapucropr"
              ti={textureMap["left_bottom"]}
              {...common}
            />
          </a.group>
        </a.group>
      </a.group>
    </a.group>
  );
}
