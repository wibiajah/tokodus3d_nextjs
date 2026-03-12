import { a } from "@react-spring/three";
import { useDesignStore } from "@/store/design-store";
import { Flap } from "./components";
import { useTextureMap } from "@/hooks/use-texture-map";
import { getFixedByWidth } from "@/models/shopping/model";
import { useShippingGeometry } from "@/hooks/use-geometry-helper";
function SandboxFlap() {
  const innerColor = useDesignStore((s) => s.innerColor);
  const outerColor = useDesignStore((s) => s.outerColor);
  const textures = useDesignStore((s) => s.textures);
  const textureMap = useTextureMap(textures);
  const size = useDesignStore((s) => s.size);
  const multi = 1 / 10;
  const l = size.length * multi;
  const w = size.width * multi;
  const f = getFixedByWidth(w, true);
  const h = size.height * multi;
  const t = size.depth * multi;
  const s = Math.min(l, w) / 2;
  const geo = useShippingGeometry(l, w, h, t);
  const common = { l, t, s: geo.s, c: innerColor };
  return (
    <a.group>
      <Flap
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
          <Flap
            w={(f + w / 2) * Math.sqrt(2)}
            h={(f + w / 2) / Math.sqrt(2)}
            o={[0, -((f + w / 2) / Math.sqrt(2)) / 2, 0]}
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
          <Flap
            w={(f + w / 2) * Math.sqrt(2)}
            h={(f + w / 2) / Math.sqrt(2)}
            o={[0, -((f + w / 2) / Math.sqrt(2)) / 2, 0]}
            f={"front_bottom_l"}
            model="tri"
            ti={textureMap["front_bottom_l"]}
            {...common}
          />
        </a.group>

      {/* <Flap
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
        <Flap
          w={(f + w / 2) * Math.sqrt(2)}
          h={(f + w / 2) / Math.sqrt(2)}
          o={[0, -((f + w / 2) / Math.sqrt(2)) / 2, 0]}
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
        <Flap
          w={(f + w / 2) * Math.sqrt(2)}
          h={(f + w / 2) / Math.sqrt(2)}
          o={[0, -((f + w / 2) / Math.sqrt(2)) / 2, 0]}
          f={"back_bottom_l"}
          model="tri"
          ti={textureMap["back_bottom_l"]}
          {...common}
        />
      </a.group> */}
    </a.group>
  );
}
export default SandboxFlap;
