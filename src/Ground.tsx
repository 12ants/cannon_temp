import { usePlane } from '@react-three/cannon';
import { useRef } from 'react';
import { Mesh } from 'three';

export function Ground(props: any) {
  const [ref] = usePlane(
    () => ({
      type: 'Static',
      material: 'ground',
      rotation: [-Math.PI / 2, 0, 0],
      ...props,
    }),
    useRef<Mesh>(null)
  );

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#101010" metalness={0.5} roughness={1} />
    </mesh>
  );
}
