import { Decal } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

function SandboxFlap() {
  const geom = new THREE.BoxGeometry(2, 2, 1);
  const mat = new THREE.MeshStandardMaterial({ color: "#cccccc" });

  // Generate canvas texture for text
  const textTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.font = "80px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("HELLO WORLD", canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }, []);
// use decal but double side cannot only one side
  return (
    <group>
      <mesh geometry={geom} material={mat}>
        <Decal
          position={[0, 0, 1.5]}
          rotation={[0, 0, 0]}
          scale={[2, 2, 2]}
        >
          <meshStandardMaterial
            transparent
            map={textTexture}
            depthWrite={false}
            depthTest={false}
            side={THREE.FrontSide} 
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </Decal>
      </mesh>
    </group>
  );
}

export default SandboxFlap;
