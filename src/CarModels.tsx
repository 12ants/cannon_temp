import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshStandardMaterial, PointLight } from 'three';
import { debugData } from './store';

function BrakeLight({ position, args, geometry: Geometry = 'boxGeometry', rotation }: any) {
  const materialRef = useRef<MeshStandardMaterial>(null);
  const lightRef = useRef<PointLight>(null);
  
  useFrame(() => {
    const isBraking = debugData.isBraking;
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = isBraking ? 4 : 0.5;
    }
    if (lightRef.current) {
      lightRef.current.intensity = isBraking ? 2 : 0;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        {Geometry === 'boxGeometry' ? <boxGeometry args={args} /> : <cylinderGeometry args={args} />}
        <meshStandardMaterial ref={materialRef} color="#dc2626" emissive="#ff0000" toneMapped={false} />
      </mesh>
      <pointLight ref={lightRef} color="#ff0000" distance={3} intensity={0} position={[0, 0, -0.2]} />
    </group>
  );
}

function HeadLight({ position, args, geometry: Geometry = 'boxGeometry', rotation }: any) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        {Geometry === 'boxGeometry' ? <boxGeometry args={args} /> : <cylinderGeometry args={args} />}
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <pointLight color="#ffffff" distance={10} intensity={1} position={[0, 0, 0.2]} />
    </group>
  );
}

export function SovietClassic() {
  return (
    <>
      {/* Main Body */}
      <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.65, 0.45, 4.1]} />
        <meshStandardMaterial color="#d4d4ce" />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.25, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.45, 1.8]} />
        <meshStandardMaterial color="#d4d4ce" />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.25, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.35, 1.85]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Grille */}
      <mesh position={[0, -0.15, 2.06]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.25, 0.05]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Headlights (Round) */}
      <HeadLight position={[0.5, -0.15, 2.08]} rotation={[Math.PI / 2, 0, 0]} args={[0.12, 0.12, 0.05, 16]} geometry="cylinderGeometry" />
      <HeadLight position={[-0.5, -0.15, 2.08]} rotation={[Math.PI / 2, 0, 0]} args={[0.12, 0.12, 0.05, 16]} geometry="cylinderGeometry" />
      {/* Chrome Bumpers */}
      <mesh position={[0, -0.35, 2.1]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.1, 0.15]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.35, -2.1]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.1, 0.15]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Taillights */}
      <BrakeLight position={[0.6, -0.15, -2.06]} args={[0.2, 0.4, 0.05]} />
      <BrakeLight position={[-0.6, -0.15, -2.06]} args={[0.2, 0.4, 0.05]} />
    </>
  );
}

export function EuroCompact() {
  return (
    <>
      {/* Main Body */}
      <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.4, 3.2]} />
        <meshStandardMaterial color="#bae6fd" />
      </mesh>
      {/* Cabin (Rounded) */}
      <mesh position={[0, 0.2, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.4, 1.5]} />
        <meshStandardMaterial color="#bae6fd" />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.2, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.25, 0.3, 1.55]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Headlights (Round) */}
      <HeadLight position={[0.45, -0.1, 1.6]} rotation={[Math.PI / 2, 0, 0]} args={[0.15, 0.15, 0.05, 16]} geometry="cylinderGeometry" />
      <HeadLight position={[-0.45, -0.1, 1.6]} rotation={[Math.PI / 2, 0, 0]} args={[0.15, 0.15, 0.05, 16]} geometry="cylinderGeometry" />
      {/* Chrome Bumpers */}
      <mesh position={[0, -0.35, 1.65]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.08, 0.1]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.35, -1.65]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.08, 0.1]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Taillights */}
      <BrakeLight position={[0.5, -0.15, -1.61]} args={[0.15, 0.2, 0.05]} />
      <BrakeLight position={[-0.5, -0.15, -1.61]} args={[0.15, 0.2, 0.05]} />
    </>
  );
}
export function Volvo140() {
  return (
    <>
      {/* Lower Body */}
      <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.5, 4]} />
        <meshStandardMaterial color="#0ea5e9" />
      </mesh>
      {/* Black Trim Line */}
      <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.72, 0.05, 4.02]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.25, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.5, 2]} />
        <meshStandardMaterial color="#0ea5e9" />
      </mesh>
      {/* Windows (Inner dark block) */}
      <mesh position={[0, 0.25, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.45, 0.4, 2.05]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Front Grille */}
      <mesh position={[0, -0.15, 2.01]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.25, 0.1]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Headlights */}
      <HeadLight position={[0.6, -0.15, 2.01]} args={[0.25, 0.25, 0.1]} />
      <HeadLight position={[-0.6, -0.15, 2.01]} args={[0.25, 0.25, 0.1]} />
      {/* Bumpers */}
      <mesh position={[0, -0.4, 2.05]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.15, 0.2]} />
        <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.4, -2.05]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.15, 0.2]} />
        <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Taillights */}
      <BrakeLight position={[0.6, -0.15, -2.01]} args={[0.3, 0.3, 0.1]} />
      <BrakeLight position={[-0.6, -0.15, -2.01]} args={[0.3, 0.3, 0.1]} />
      {/* Roof Rack */}
      <mesh position={[0, 0.52, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.05, 0.05]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0.52, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.05, 0.05]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Side Mirrors */}
      <mesh position={[0.75, 0.2, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.15, 0.15]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.75, 0.2, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.15, 0.15]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Exhaust */}
      <mesh position={[0.6, -0.4, -2.1]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* License Plates */}
      <mesh position={[0, -0.3, 2.16]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.15, 0.02]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
      <mesh position={[0, -0.3, -2.16]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.15, 0.02]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
      {/* Door Handles */}
      <mesh position={[0.86, 0.05, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.05, 0.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.86, 0.05, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.05, 0.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </>
  );
}

export function SportsCar80s() {
  return (
    <>
      {/* Main Body (Wedge) */}
      <mesh position={[0, -0.2, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.3, 4.2]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* Black Trim */}
      <mesh position={[0, -0.2, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.82, 0.05, 4.22]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.1, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.35, 1.8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Pop-up Headlights */}
      <mesh position={[0.6, -0.05, 2.0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.1, 0.2]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[-0.6, -0.05, 2.0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.1, 0.2]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <HeadLight position={[0.6, -0.05, 2.11]} args={[0.25, 0.05, 0.05]} />
      <HeadLight position={[-0.6, -0.05, 2.11]} args={[0.25, 0.05, 0.05]} />
      {/* Spoiler */}
      <mesh position={[0, 0.2, -1.9]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.05, 0.4]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0.7, 0.0, -1.9]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.4, 0.3]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[-0.7, 0.0, -1.9]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.4, 0.3]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* Taillights (Full width strip) */}
      <BrakeLight position={[0, -0.15, -2.01]} args={[1.6, 0.15, 0.1]} />
      {/* Exhaust */}
      <mesh position={[0.3, -0.35, -2.05]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.2, 16]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.3, -0.35, -2.05]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.2, 16]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
      </mesh>
    </>
  );
}

export function MuscleCar60s() {
  return (
    <>
      {/* Main Body */}
      <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.75, 0.45, 4.4]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Racing Stripes */}
      <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.46, 4.41]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.2, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.35, 1.6]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.2, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[1.45, 0.25, 1.65]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Engine Blower */}
      <mesh position={[0, 0.15, 1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.2, 0.6]} />
        <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.25, 1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.1, 0.4]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Front Grille */}
      <mesh position={[0, -0.15, 2.21]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.25, 0.1]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Headlights (Round) */}
      <HeadLight position={[0.6, -0.15, 2.22]} rotation={[Math.PI / 2, 0, 0]} args={[0.1, 0.1, 0.1, 16]} geometry="cylinderGeometry" />
      <HeadLight position={[-0.6, -0.15, 2.22]} rotation={[Math.PI / 2, 0, 0]} args={[0.1, 0.1, 0.1, 16]} geometry="cylinderGeometry" />
      {/* Bumpers */}
      <mesh position={[0, -0.35, 2.25]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.15, 0.2]} />
        <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.35, -2.25]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.15, 0.2]} />
        <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Taillights */}
      <BrakeLight position={[0.6, -0.15, -2.21]} args={[0.4, 0.15, 0.1]} />
      <BrakeLight position={[-0.6, -0.15, -2.21]} args={[0.4, 0.15, 0.1]} />
    </>
  );
}
