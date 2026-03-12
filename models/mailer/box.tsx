import { MailerFlap } from "@/components/design/flap-3d";
import { useShippingGeometry } from "@/hooks/use-geometry-helper";
import { useOpenCloseSpring } from "@/hooks/use-open-close-spring";
import { useTextureMap } from "@/hooks/use-texture-map";
import { useDesignStore } from "@/store/design-store";
import { a } from "@react-spring/three";
import { getFbyH } from "./model";
interface MailerBoxProps {
  l: number; // length
  w: number; // width
  h: number; // height
  t: number; // thickness of the box material
  innerColor: string;
  outerColor: string;
  openClose: number; // 0 = closed, 1 = fully open
}
export default function MailerBox({
  l,
  w,
  h,
  t,
  innerColor,
  outerColor,
  openClose,
}: MailerBoxProps) {
  const textures = useDesignStore((s) => s.textures);
  const anim = useOpenCloseSpring(openClose);
  const geo = useShippingGeometry(l, w, h, t);
  const textureMap = useTextureMap(textures);
  const common = { l, t, s: geo.s, inner: innerColor, outer: outerColor };
  const f = getFbyH(h, true);
  // console.log("texture", textureMap);
  return (
    <a.group position={[0, geo.hh, geo.hh]}>
      <MailerFlap
        hingeCover
        w={w}
        h={l}
        f={"back"}
        ti={textureMap["back"]}
        model="bk"
        {...common}
      />
      <a.group position={[0, geo.hl, 0]} rotation-x={anim.monet}>
        <MailerFlap
          hingeCover
          w={geo.wmht}
          h={h}
          o={[0, geo.hh, 0]}
          f={"back_top"}
          ti={textureMap["back_top"]}
          {...common}
        />
        <MailerFlap
          w={geo.hmqt}
          h={geo.hmqt}
          p={[geo.wmht / 2, geo.hhqt, 0]}
          o={[geo.hmqt / 2, 0, 0]}
          f={"left_top"}
          ry={anim.mleft}
          ti={textureMap["left_top"]}
          {...common}
        />
        <MailerFlap
          w={geo.hmqt}
          h={geo.hmqt}
          p={[-geo.wmht / 2, geo.hhqt, 0]}
          o={[-geo.hmqt / 2, 0, 0]}
          f={"right_top"}
          ry={anim.mright}
          ti={textureMap["right_top"]}
          {...common}
        />
      </a.group>
      <a.group position={[0, -geo.hl, 0]} rotation-x={anim.moneb}>
        <MailerFlap
          hingeCover
          w={geo.wmht}
          h={h}
          o={[0, -geo.hh, 0]}
          f={"back_bottom"}
          ti={textureMap["back_bottom"]}
          {...common}
        />
        <MailerFlap
          w={geo.hmqt}
          h={geo.hmqt}
          p={[geo.wmht / 2, -geo.hhqt, 0]}
          o={[geo.hmqt / 2, 0, 0]}
          f={"left_bottom"}
          ry={anim.mleft}
          ti={textureMap["left_bottom"]}
          {...common}
        />
        <MailerFlap
          w={geo.hmqt}
          h={geo.hmqt}
          p={[-geo.wmht / 2, -geo.hhqt, 0]}
          o={[-geo.hmqt / 2, 0, 0]}
          f={"right_bottom"}
          ry={anim.mright}
          ti={textureMap["right_bottom"]}
          {...common}
        />
      </a.group>
      <a.group position={[geo.hw, 0, 0]} rotation-y={anim.mbtm}>
        <MailerFlap
          hingeCover
          w={h}
          h={l}
          o={[geo.hh, 0, 0]}
          f={"left"}
          model={"ef"}
          ti={textureMap["left"]}
          {...common}
        />
        <a.group position={[h, 0, 0]} rotation-y={anim.mbridge}>
          <MailerFlap
            hingeCover
            w={geo.tqt}
            h={l / 3}
            p={[0, l / 3, 0]}
            o={[geo.tqt / 2, 0, 0]}
            f={"bridge_top"}
            model={"bt"}
            ti={textureMap["bridge_top"]}
            {...common}
          />
          <MailerFlap
            hingeCover
            w={geo.tqt}
            h={l / 3}
            p={[0, -l / 3, 0]}
            o={[geo.tqt / 2, 0, 0]}
            f={"bridge_bottom"}
            model={"bb"}
            ti={textureMap["bridge_bottom"]}
            {...common}
          />
          <MailerFlap
            w={h - geo.qt}
            h={l - t}
            p={[geo.tqt, 0, 0]}
            o={[geo.hh + t / 4, 0, 0]}
            f={"extra"}
            ry={anim.mextra}
            model={"es"}
            ti={textureMap["extra"]}
            {...common}
          />
        </a.group>
      </a.group>
      <a.group position={[-geo.hw, 0, 0]} rotation-y={anim.mtop}>
        <MailerFlap
          hingeCover
          w={h}
          h={l}
          o={[-geo.hh, 0, 0]}
          f={"right"}
          ti={textureMap["right"]}
          {...common}
        />
        <a.group position={[-h, 0, 0]} rotation-y={anim.mfront}>
          <MailerFlap
            hingeCover
            w={w - t / 2}
            h={l}
            o={[-geo.hw + t / 4, 0, 0]}
            f={"front"}
            model="ft"
            ti={textureMap["front"]}
            {...common}
          />
          <MailerFlap
            w={geo.wmtqt-t}
            h={h}
            p={[-geo.hw + t / 4, geo.hl - t / 2, 0]}
            o={[0, geo.hh, 0]}
            f={"front_top"}
            rx={anim.monet}
            model="qrt"
            ti={textureMap["front_top"]}
            {...common}
          />
          <MailerFlap
            w={geo.wmtqt-t}
            h={h}
            p={[-geo.hw + t / 4, -geo.hl + t / 2, 0]}
            o={[0, -geo.hh, 0]}
            f={"front_bottom"}
            rx={anim.moneb}
            model="qrb"
            ti={textureMap["front_bottom"]}
            {...common}
          />
          <MailerFlap
            w={f}
            h={l / 3}
            p={[-w + t / 2, 0, 0]}
            o={[-f / 2, 0, 0]}
            f={"fixed"}
            ry={anim.mf}
            model="f"
            ti={textureMap["fixed"]}
            {...common}
          />
        </a.group>
      </a.group>
    </a.group>
  );
}
