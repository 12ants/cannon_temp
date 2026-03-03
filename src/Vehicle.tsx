import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox, useRaycastVehicle } from '@react-three/cannon';
import { useControls } from './useControls';
import { Wheel } from './Wheel';
import { Group, Mesh, Vector3, Quaternion } from 'three';
import { debugData } from './store';
import { Volvo140, SportsCar80s, MuscleCar60s, SovietClassic, EuroCompact } from './CarModels';
import { spawnSmoke, spawnSpark, spawnSkidMark, spawnWind } from './Effects';

// Pre-allocate objects outside the render loop to prevent garbage collection stutter
const _position = new Vector3();
const _quaternion = new Quaternion();
const _wDir = new Vector3();
const _cameraPosition = new Vector3();
const _offset = new Vector3();
const _lookAtPos = new Vector3();
const _velocity = new Vector3();
const _lateralVelocity = new Vector3();
const _wheelPos = new Vector3();

export function Vehicle({
  carType = 'volvo',
  cameraMode = 'third-person',
  cameraDistance = 10,
  steeringType = 'buttons',
  radius = 0.5,
  width = 1.75,
  height = -0.2,
  front = 1.3,
  back = -1.15,
  steer = 0.5,
  force = 12000,
  maxBrake = 2e5,
  ...props
}: any) {
  const chassisRef = useRef<Group>(null);
  const [chassisBody, chassisApi] = useBox(
    () => ({
      mass: 1500,
      args: [1.7, 1, 4],
      position: [0, 5, 0],
      angularDamping: 0.4,
      linearDamping: 0.1,
      onCollide: (e) => {
        if (e.contact.impactVelocity > 3) {
          const sparkCount = Math.min(Math.floor(e.contact.impactVelocity * 2), 20);
          for (let i = 0; i < sparkCount; i++) {
            spawnSpark(
              new Vector3(...e.contact.contactPoint),
              new Vector3(...e.contact.contactNormal).multiplyScalar(e.contact.impactVelocity)
            );
          }
        }
      },
      ...props,
    }),
    chassisRef
  );

  const wheel1 = useRef<Group>(null);
  const wheel2 = useRef<Group>(null);
  const wheel3 = useRef<Group>(null);
  const wheel4 = useRef<Group>(null);

  const wheelInfo = {
    radius,
    directionLocal: [0, -1, 0],
    suspensionStiffness: 40,
    suspensionRestLength: 0.4,
    maxSuspensionForce: 1e5,
    maxSuspensionTravel: 0.5,
    dampingRelaxation: 12.0,
    dampingCompression: 9.6,
    axleLocal: [-1, 0, 0],
    chassisConnectionPointLocal: [1, 0, 1],
    useCustomSlidingRotationalSpeed: true,
    customSlidingRotationalSpeed: -30,
    frictionSlip: 8,
    rollInfluence: 0.1,
  };

  const wheelInfo1 = { ...wheelInfo, isFrontWheel: true, chassisConnectionPointLocal: [-width / 2, height, front] };
  const wheelInfo2 = { ...wheelInfo, isFrontWheel: true, chassisConnectionPointLocal: [width / 2, height, front] };
  const wheelInfo3 = { ...wheelInfo, isFrontWheel: false, chassisConnectionPointLocal: [-width / 2, height, back] };
  const wheelInfo4 = { ...wheelInfo, isFrontWheel: false, chassisConnectionPointLocal: [width / 2, height, back] };

  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
      wheels: [wheel1, wheel2, wheel3, wheel4],
      wheelInfos: [wheelInfo1, wheelInfo2, wheelInfo3, wheelInfo4],
      indexForwardAxis: 2,
      indexRightAxis: 0,
      indexUpAxis: 1,
    }),
    useRef<Group>(null)
  );

  const controls = useControls();

  useEffect(() => {
    const unsubPos = chassisApi.position.subscribe((v) => (debugData.position = v));
    const unsubVel = chassisApi.velocity.subscribe((v) => {
      debugData.velocity = v;
      debugData.speed = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    });
    const unsubRot = chassisApi.rotation.subscribe((v) => (debugData.rotation = v));
    const unsubAng = chassisApi.angularVelocity.subscribe((v) => (debugData.angularVelocity = v));
    return () => {
      unsubPos();
      unsubVel();
      unsubRot();
      unsubAng();
    };
  }, [chassisApi]);

  useFrame((state) => {
    const { forward, backward, left, right, brake, reset } = controls;

    if (chassisRef.current) {
      _position.setFromMatrixPosition(chassisRef.current.matrixWorld);
      _quaternion.setFromRotationMatrix(chassisRef.current.matrixWorld);
    }

    const engineForce = forward ? -force : backward ? force : 0;
    
    // Speed-dependent steering (less steering at high speeds)
    const speedFactor = Math.max(0.2, 1 - debugData.speed / 40);
    const currentSteer = steer * speedFactor;
    
    let steeringValue = 0;
    if (steeringType === 'joystick') {
      steeringValue = debugData.joystickSteering * currentSteer;
    } else {
      steeringValue = left ? currentSteer : right ? -currentSteer : 0;
    }

    debugData.engineForce = engineForce;
    debugData.steering = steeringValue;
    debugData.cameraMode = cameraMode;
    debugData.isBraking = brake;

    _velocity.set(debugData.velocity[0], debugData.velocity[1], debugData.velocity[2]);

    // Aerodynamic downforce (pushes car down at high speeds for better grip)
    const speedSq = debugData.speed * debugData.speed;
    const downforce = speedSq * 2.5;
    chassisApi.applyLocalForce([0, -downforce, 0], [0, 0, 0]);

    // Aerodynamic visual effects (wind streaks at high speeds)
    if (debugData.speed > 15) {
      const windCount = Math.floor((debugData.speed - 10) / 5);
      for (let i = 0; i < windCount; i++) {
        spawnWind(_position, _velocity, _quaternion, debugData.speed);
      }
    }

    // Drift and Skid Marks logic
    _wDir.set(0, 0, 1).applyQuaternion(_quaternion).normalize();
    const forwardSpeed = _velocity.dot(_wDir);
    _lateralVelocity.copy(_velocity).sub(_wDir.clone().multiplyScalar(forwardSpeed));
    const slipSpeed = _lateralVelocity.length();

    const isDrifting = slipSpeed > 2.5 && debugData.speed > 5;
    const isBrakingHard = brake && debugData.speed > 5 && (Math.abs(steeringValue) > 0.05 || slipSpeed > 1.0);

    if (isBrakingHard || isDrifting) {
      if (wheel3.current) {
        wheel3.current.getWorldPosition(_wheelPos);
        spawnSkidMark(_wheelPos, _velocity);
        if (Math.random() > 0.5) spawnSmoke(_wheelPos, _velocity);
      }
      if (wheel4.current) {
        wheel4.current.getWorldPosition(_wheelPos);
        spawnSkidMark(_wheelPos, _velocity);
        if (Math.random() > 0.5) spawnSmoke(_wheelPos, _velocity);
      }
      if (isBrakingHard || slipSpeed > 5.0) {
        if (wheel1.current) {
          wheel1.current.getWorldPosition(_wheelPos);
          spawnSkidMark(_wheelPos, _velocity);
        }
        if (wheel2.current) {
          wheel2.current.getWorldPosition(_wheelPos);
          spawnSkidMark(_wheelPos, _velocity);
        }
      }
    } else if (Math.abs(engineForce) > 0 && debugData.speed < 2) {
      // Burnout smoke
      if (Math.random() > 0.5) {
        if (wheel3.current) {
          wheel3.current.getWorldPosition(_wheelPos);
          spawnSmoke(_wheelPos, _velocity);
        }
        if (wheel4.current) {
          wheel4.current.getWorldPosition(_wheelPos);
          spawnSmoke(_wheelPos, _velocity);
        }
      }
    }

    // AWD for better handling
    for (let e = 0; e < 4; e++) vehicleApi.applyEngineForce(engineForce, e);
    for (let s = 0; s < 2; s++) vehicleApi.setSteeringValue(steeringValue, s);
    // 4-wheel braking
    for (let b = 0; b < 4; b++) vehicleApi.setBrake(brake ? maxBrake : 0, b);

    if (reset) {
      chassisApi.position.set(0, 5, 0);
      chassisApi.velocity.set(0, 0, 0);
      chassisApi.angularVelocity.set(0, 0, 0);
      chassisApi.rotation.set(0, 0, 0);
    }

    if (cameraMode === 'free') {
      return;
    }

    if (chassisRef.current) {
      _wDir.set(0, 0, 1).applyQuaternion(_quaternion).normalize();

      if (cameraMode === 'third-person') {
        const height = cameraDistance * 0.5;
        _cameraPosition.copy(_wDir).multiplyScalar(-cameraDistance);
        _cameraPosition.add(_position);
        _cameraPosition.y += height;
        
        state.camera.position.lerp(_cameraPosition, 0.1);
        state.camera.lookAt(_position);
      } else if (cameraMode === 'first-person') {
        // Position camera inside the cabin
        _offset.set(0, 0.5, 0.5).applyQuaternion(_quaternion);
        _cameraPosition.copy(_position).add(_offset);
        state.camera.position.copy(_cameraPosition);
        
        // Look forward
        _lookAtPos.copy(_wDir).multiplyScalar(10).add(_cameraPosition);
        state.camera.lookAt(_lookAtPos);
      }
    }
  });

  return (
    <group ref={vehicle}>
      <group ref={chassisRef}>
        {carType === 'volvo' && <Volvo140 />}
        {carType === 'sports' && <SportsCar80s />}
        {carType === 'muscle' && <MuscleCar60s />}
        {carType === 'soviet' && <SovietClassic />}
        {carType === 'euro' && <EuroCompact />}
      </group>
      <Wheel ref={wheel1} radius={radius} leftSide />
      <Wheel ref={wheel2} radius={radius} />
      <Wheel ref={wheel3} radius={radius} leftSide />
      <Wheel ref={wheel4} radius={radius} />
    </group>
  );
}
