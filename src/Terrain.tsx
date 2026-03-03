import { useBox, useCylinder } from '@react-three/cannon';
import { useRef } from 'react';
import { Mesh } from 'three';

export function Ramp({ position, rotation, args = [10, 2, 10], color = '#444' }: any) {
  const [ref] = useBox(
    () => ({
      type: 'Static',
      position,
      rotation,
      args,
    }),
    useRef<Mesh>(null)
  );

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function SpeedBump({ position, width = 8, radius = 0.3 }: any) {
  const [ref] = useCylinder(
    () => ({
      type: 'Static',
      position,
      rotation: [0, 0, Math.PI / 2],
      args: [radius, radius, width, 16],
    }),
    useRef<Mesh>(null)
  );

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, width, 16]} />
      <meshStandardMaterial color="#eab308" />
    </mesh>
  );
}

export function Platform({ position, args = [10, 2, 10], color = '#333' }: any) {
  const [ref] = useBox(
    () => ({
      type: 'Static',
      position,
      args,
    }),
    useRef<Mesh>(null)
  );

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
