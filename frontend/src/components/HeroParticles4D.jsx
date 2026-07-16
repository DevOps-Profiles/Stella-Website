import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Swarm({ mouse }) {
  const mesh = useRef();
  const count = 3000;

  // Generate initial particle positions and colors
  const { positions, colors, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    const colorA = new THREE.Color('#E63946'); // Stella Red
    const colorB = new THREE.Color('#F59E0B'); // Stella Gold
    const colorC = new THREE.Color('#1a1a1f'); // Dark

    for (let i = 0; i < count; i++) {
      // Random positions in a wide spread
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Assign colors based on random distribution
      const mixedColor = Math.random() > 0.6 ? colorA : Math.random() > 0.5 ? colorB : colorC;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      // Random speed modifier per particle
      speeds[i] = Math.random() * 0.5 + 0.1;
    }
    return { positions, colors, speeds };
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime();

    // Subtle drift and wave motion
    mesh.current.rotation.y = Math.sin(time * 0.05) * 0.2;
    mesh.current.rotation.x = Math.cos(time * 0.05) * 0.2;

    // React to mouse movement for "4D" parallax feel
    const targetX = mouse.current[0] * 2;
    const targetY = mouse.current[1] * 2;
    
    mesh.current.position.x += (targetX - mesh.current.position.x) * 0.02;
    mesh.current.position.y += (targetY - mesh.current.position.y) * 0.02;

    // We use a custom shader to make them twinkle, or just standard points
    mesh.current.material.size = 0.03 + Math.sin(time * 2) * 0.01;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function HeroParticles4D({ mouse }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]} gl={{ antialias: false, alpha: true }}>
        <color attach="background" args={['transparent']} />
        <Swarm mouse={mouse} />
      </Canvas>
    </div>
  );
}
