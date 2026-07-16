import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, RoundedBox, Html } from '@react-three/drei';
import { useRef, Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';

// --- Procedural Phone Mesh ---
function PhoneModel({ mouse, scale = 1.8, children }) {
  const groupRef = useRef();
  const screenRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Mouse-driven rotation (less extreme since it's full screen)
    const targetX = mouse.current[1] * 0.15;
    const targetY = mouse.current[0] * 0.2;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;

    // Subtle auto-rotate
    groupRef.current.rotation.y += 0.001;

    // Screen glow pulse
    if (screenRef.current) {
      screenRef.current.material.emissiveIntensity = 0.6 + Math.sin(t * 1.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={scale}>
      {/* Phone body */}
      <RoundedBox args={[1.4, 2.8, 0.14]} radius={0.12} smoothness={6}>
        <meshStandardMaterial
          color="#0d0d0f"
          metalness={0.95}
          roughness={0.05}
          envMapIntensity={1.2}
        />
      </RoundedBox>

      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0.04, 0.076]}>
        <RoundedBox args={[1.15, 2.3, 0.02]} radius={0.08} smoothness={8} position={[0, 0, 0]} />
        <meshStandardMaterial
          color="#060610"
          emissive={new THREE.Color('#E63946')}
          emissiveIntensity={0.2}
          metalness={0.1}
          roughness={0.2}
        />
        {/* HTML Content */}
        <Html
          transform
          wrapperClass="htmlScreen"
          distanceFactor={1.1}
          position={[0, 0, 0.02]}
          zIndexRange={[100, 0]}
        >
          <div className="w-[320px] h-[640px] flex flex-col items-center justify-center p-4 overflow-hidden rounded-[20px]" style={{ pointerEvents: 'auto' }}>
            {children}
          </div>
        </Html>
      </mesh>

      {/* Camera notch */}
      <mesh position={[0, 1.2, 0.078]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 32]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Side buttons */}
      <mesh position={[0.72, 0.3, 0]}>
        <boxGeometry args={[0.04, 0.22, 0.08]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.72, -0.1, 0]}>
        <boxGeometry args={[0.04, 0.32, 0.08]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Red edge accent */}
      <mesh position={[0, 0, 0]}>
        <RoundedBox args={[1.44, 2.84, 0.15]} radius={0.13} smoothness={6}>
          <meshStandardMaterial
            color="#E63946"
            metalness={0.8}
            roughness={0.15}
            transparent
            opacity={0.12}
          />
        </RoundedBox>
      </mesh>
    </group>
  );
}

// --- Procedural Laptop Mesh ---
function LaptopModel({ mouse, children }) {
  const groupRef = useRef();
  const screenRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Mouse-driven rotation
    const targetX = mouse.current[1] * 0.1; 
    const targetY = mouse.current[0] * 0.1;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;

    // Subtle auto-rotate
    groupRef.current.rotation.y += 0.0005;

    // Screen glow pulse
    if (screenRef.current) {
      screenRef.current.material.emissiveIntensity = 0.2 + Math.sin(t * 1.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.5, 0]} scale={1.3} rotation={[0.15, 0, 0]}>
      {/* Base (Keyboard half) */}
      <mesh position={[0, 0, 0]}>
        <RoundedBox args={[3.8, 0.12, 2.6]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#0d0d0f" metalness={0.9} roughness={0.1} />
        </RoundedBox>
      </mesh>

      {/* Keyboard indent */}
      <mesh position={[0, 0.06, 0.2]}>
        <boxGeometry args={[3.4, 0.02, 1.3]} />
        <meshStandardMaterial color="#08080a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Trackpad indent */}
      <mesh position={[0, 0.06, 1.05]}>
        <boxGeometry args={[1.2, 0.02, 0.4]} />
        <meshStandardMaterial color="#08080a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Hinge & Screen Group */}
      <group position={[0, 0.06, -1.25]} rotation={[-0.15, 0, 0]}>
        {/* Screen Frame */}
        <mesh position={[0, 1.2, 0.05]}>
          <RoundedBox args={[3.8, 2.4, 0.08]} radius={0.05} smoothness={4}>
            <meshStandardMaterial color="#0d0d0f" metalness={0.9} roughness={0.1} />
          </RoundedBox>
        </mesh>

        {/* Screen Display */}
        <mesh ref={screenRef} position={[0, 1.25, 0.095]}>
          <planeGeometry args={[3.6, 2.2]} />
          <meshStandardMaterial
            color="#060610"
            emissive={new THREE.Color('#E63946')}
            emissiveIntensity={0.2}
            metalness={0.1}
            roughness={0.2}
          />
          {/* HTML Content */}
          <Html
            transform
            wrapperClass="htmlScreen"
            distanceFactor={1.3}
            position={[0, 0, 0.01]}
            zIndexRange={[100, 0]}
          >
            <div className="w-[1024px] h-[620px] flex flex-col items-center justify-center p-8 overflow-hidden rounded-[8px]" style={{ pointerEvents: 'auto' }}>
              {children}
            </div>
          </Html>
        </mesh>
      </group>
    </group>
  );
}

function Particles() {
  const mesh = useRef();
  const count = 150;

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const redCol = new THREE.Color('#E63946');
  const goldCol = new THREE.Color('#F59E0B');

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12; 
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    const c = Math.random() > 0.5 ? redCol : goldCol;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

export default function HeroDevice3D({ mouse, laptopContent, phoneContent }) {
  const [isMobile, setIsMobile] = useState(false);
  const [phoneScale, setPhoneScale] = useState(1.8);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);

    const handleResize = () => {
      setIsMobile(mediaQuery.matches);
      if (window.innerWidth < 768) {
        // Calculate a scale based on the viewport width to prevent horizontal cropping
        // A scale of 1.1 fits well on a standard 390px mobile screen
        const calculatedScale = (window.innerWidth / 390) * 1.1;
        setPhoneScale(Math.min(1.2, Math.max(0.8, calculatedScale)));
      } else {
        setPhoneScale(1.8);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    mediaQuery.addEventListener('change', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleResize);
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.4} />
      <spotLight position={[5, 8, 5]} intensity={1.8} color="#ffffff" penumbra={0.6} />
      <spotLight position={[-4, -4, 3]} intensity={0.8} color="#E63946" penumbra={1} />
      <spotLight position={[4, -4, 2]} intensity={0.6} color="#F59E0B" penumbra={1} />

      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.1}>
          {isMobile ? (
            <PhoneModel mouse={mouse} scale={phoneScale}>{phoneContent}</PhoneModel>
          ) : (
            <LaptopModel mouse={mouse}>{laptopContent}</LaptopModel>
          )}
        </Float>
        <Particles />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}
