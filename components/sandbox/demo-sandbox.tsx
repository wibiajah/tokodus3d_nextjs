import * as THREE from "three";
import { useSpring } from "@react-spring/three";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Custom } from "./components";
import { useDesignStore } from "@/store/design-store";
import { a } from "@react-spring/three";
function SandboxFlap() {
  const openClose = useDesignStore((s) => s.openClose);
  const { progress } = useSpring({
    progress: openClose,
    config: { mass: 1, tension: 260, friction: 18 },
  });
  const x = progress.to([0, 0.5, 0.8, 1], [0, 0, Math.PI, Math.PI]);
  const y = progress.to([0, 0.4, 0.5, 1], [0, 0, Math.PI / 2, Math.PI / 2]);
  const scale = 0.3;
  const l = 4 * scale;
  const t = 0.4 * scale;
  const w = 12 * scale;
  const h = 4 * scale;

  //  // Create quaternion animation
  // const quaternion = useMemo(() => {
  //   return progress.to((p) => {
  //     // Interpolate rotation values
  //     const yRotation = p <= 0.4 ? 0 :
  //                       p <= 0.6 ? ((p - 0.4) / 0.2) * (Math.PI / 2) :
  //                       Math.PI / 2;

  //     // Create quaternion from Euler angles
  //     const euler = new THREE.Euler(0, yRotation, Math.PI / 4, 'XYZ');
  //     const quat = new THREE.Quaternion().setFromEuler(euler);

  //     return [quat.x, quat.y, quat.z, quat.w];
  //   });
  // }, [progress]);

  const quaternion = useMemo(() => {
    return progress.to((p) => {
      const yRotation =
        p <= 0.4
          ? 0
          : p <= 0.6
            ? ((p - 0.4) / 0.2) * (Math.PI / 2)
            : Math.PI / 2;

      // Combine multiple rotations
      const quatY = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        yRotation,
      );
      const quatZ = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 1),
        Math.PI / 4,
      );

      // Multiply quaternions to combine rotations
      const finalQuat = quatY.multiply(quatZ);

      return [finalQuat.x, finalQuat.y, finalQuat.z, finalQuat.w];
    });
  }, [progress]);
  return (
    <a.group rotation-x={x}>
      <Custom w={w} h={h} t={t} o={[0, -h / 2, 0]} type={"trz"} />
      <a.group
        // quaternion={quaternion}
        rotation-z={Math.PI / 4}
        position={[h, -h / 2, 0]}
      >
        {/* <Custom
          w={h * Math.sqrt(2)}
          h={h / Math.sqrt(2)}
          t={t}
          type={""}
          p={[h, -h / 2, 0]}
          o={[h / 4, -h / 4, 0]}
          mrz={Math.PI / 4}
        /> */}
        <Custom
          w={h * Math.sqrt(2)}
          h={h / Math.sqrt(2)}
          t={t}
          type={""}
          // p={[h, -h / 2, 0]}
          // p={[h, -h / 2, 0]}
          // o={[h/4, -h / 4, 0]}
          // o={[0, 0, 0]}
          o={[0, -h / 3, 0]}
          // o={[h / 4, -h / 4, 0]}
          // rx={Math.PI / 4}
          // ry={y}
          rx={x}
          // mrx={x}
          // mrz={Math.PI / 4}
          // rz={Math.PI / 4}
        />
      </a.group>
      <a.mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="red" />
      </a.mesh>
    </a.group>
  );
}
export default SandboxFlap;
