import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

// Component Text dengan clipping support
interface ClippedTextProps {
  position: [number, number, number];
  rotation: [number, number, number];
  fontSize: number;
  color: string;
  text: string;
  clipPlanes?: THREE.Plane[];
}

export function ClippedText({
  position,
  rotation,
  fontSize,
  color,
  text,
  clipPlanes = [],
}: ClippedTextProps) {
  const meshRef = useRef<THREE.Object3D | null>(null);

  // Reusable temporaries to avoid allocations every frame
  const invMatrix = new THREE.Matrix4();
  // clone the planes into a temp array each frame after transform
  const tempPlanes: THREE.Plane[] = [];

  // Update materials at each frame so clipping planes follow mesh transform
  useFrame(() => {
    const root = meshRef.current;
    if (!root || !clipPlanes.length) return;

    // ensure world matrix is up to date
    root.updateWorldMatrix(true, false);

    // inverse world matrix to transform world-plane -> local-plane
    invMatrix.copy(root.matrixWorld).invert();

    // build transformed planes once per frame
    tempPlanes.length = 0;
    for (let i = 0; i < clipPlanes.length; i++) {
      // clone then apply inverse world matrix to get local-space plane
      tempPlanes.push(clipPlanes[i].clone().applyMatrix4(invMatrix));
    }

    // traverse meshes and set material.clippingPlanes (local-space)
    root.traverse((child: any) => {
      const mesh = child as any;
      if (mesh.isMesh && mesh.material) {
        const setPlanesOnMaterial = (
          mat: THREE.Material | THREE.Material[]
        ) => {
          if (Array.isArray(mat)) {
            mat.forEach((m) => {
              m.clippingPlanes = tempPlanes;
              m.clipIntersection = false;
              m.needsUpdate = true;
            });
          } else {
            mat.clippingPlanes = tempPlanes;
            mat.clipIntersection = false;
            mat.needsUpdate = true;
          }
        };

        setPlanesOnMaterial(mesh.material);
      }
    });
  });

  return (
    <Text
      ref={meshRef}
      position={position}
      rotation={rotation}
      fontSize={fontSize}
      color={color}
      anchorX="left"
      anchorY="bottom"
    >
      {text}
    </Text>
  );
}

// function ClippedText({
//   position,
//   rotation,
//   fontSize,
//   color,
//   text,
//   clipPlanes = [],
// }: ClippedTextProps) {
//   const meshRef = React.useRef<THREE.Mesh>(null);

//   useEffect(() => {
//     if (meshRef.current) {
//       // Apply clipping planes to text material
//       meshRef.current.traverse((child) => {
//         if ((child as THREE.Mesh).isMesh) {
//           const mesh = child as THREE.Mesh;
//           if (Array.isArray(mesh.material)) {
//             mesh.material.forEach((mat) => {
//               if (mat instanceof THREE.Material) {
//                 mat.clippingPlanes = clipPlanes;
//                 mat.clipIntersection = false;
//                 mat.needsUpdate = true;
//               }
//             });
//           } else if (mesh.material instanceof THREE.Material) {
//             mesh.material.clippingPlanes = clipPlanes;
//             mesh.material.clipIntersection = false;
//             mesh.material.needsUpdate = true;
//           }
//         }
//       });
//     }
//   }, [clipPlanes]);

//   return (
//     <Text
//       ref={meshRef}
//       position={position}
//       rotation={rotation}
//       fontSize={fontSize}
//       color={color}
//       anchorX="center"
//       anchorY="middle"
//     >
//       {text}
//     </Text>
//   );
// }
