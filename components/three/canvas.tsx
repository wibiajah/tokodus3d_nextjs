import { Canvas } from "@react-three/fiber";

export function ThreeCanvas({ children }: { children: React.ReactNode }) {
  return (
    <Canvas
      id="three-canvas"
      camera={{ position: [0.5, 0.5, 5], fov: 45 }}
      gl={{
        localClippingEnabled: true,
        preserveDrawingBuffer: true, // ← WAJIB agar toDataURL() bisa capture screenshot
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 2]} intensity={0.7} />
      {children}
    </Canvas>
  );
}