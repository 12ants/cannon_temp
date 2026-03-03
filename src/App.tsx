import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, Debug } from '@react-three/cannon';
import { Environment, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ToneMapping, N8AO } from '@react-three/postprocessing';
import { Vehicle } from './Vehicle';
import { Ground } from './Ground';
import { Obstacle } from './Obstacle';
import { DebugWindow } from './DebugWindow';
import { Ramp, Platform, SpeedBump } from './Terrain';
import { Effects } from './Effects';
import { Joystick } from './Joystick';

const CAR_CONFIGS = {
  volvo: { radius: 0.5, width: 1.75, height: -0.2, front: 1.3, back: -1.15, force: 12000, name: 'Volvo 140' },
  sports: { radius: 0.4, width: 1.8, height: -0.1, front: 1.4, back: -1.3, force: 18000, name: '80s Sports' },
  muscle: { radius: 0.55, width: 1.8, height: -0.15, front: 1.5, back: -1.4, force: 16500, name: '60s Muscle' },
  soviet: { radius: 0.45, width: 1.65, height: -0.2, front: 1.2, back: -1.1, force: 9000, name: 'Soviet Classic' },
  euro: { radius: 0.35, width: 1.5, height: -0.15, front: 1.0, back: -0.9, force: 7500, name: 'Euro Compact' },
};

export default function App() {
  const [isDebug, setIsDebug] = useState(false);
  const [showTouchControls, setShowTouchControls] = useState(false);
  const [cameraMode, setCameraMode] = useState<'third-person' | 'first-person' | 'free'>('third-person');
  const [cameraDistance, setCameraDistance] = useState(10);
  const [cameraSensitivity, setCameraSensitivity] = useState(1);
  const [carType, setCarType] = useState<keyof typeof CAR_CONFIGS>('volvo');
  
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [showSettings, setShowSettings] = useState(false);
  const [steeringType, setSteeringType] = useState<'buttons' | 'joystick'>('buttons');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c') {
        setIsDebug((prev) => !prev);
      }
      if (e.key.toLowerCase() === 'v') {
        setCameraMode((prev) => {
          if (prev === 'third-person') return 'first-person';
          if (prev === 'first-person') return 'free';
          return 'third-person';
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sceneContents = (
    <>
      <Vehicle 
        key={carType} 
        carType={carType} 
        cameraMode={gameState === 'menu' ? 'free' : cameraMode} 
        cameraDistance={cameraDistance} 
        steeringType={steeringType}
        position={[0, 2, 0]} 
        rotation={[0, Math.PI / 4, 0]} 
        angularVelocity={[0, 0.5, 0]} 
        {...CAR_CONFIGS[carType]} 
      />
      <Ground />
      
      {/* Dynamic Obstacles */}
      <Obstacle position={[5, 1, 5]} />
      <Obstacle position={[-5, 1, 5]} />
      <Obstacle position={[0, 1, -5]} args={[2, 2, 2]} color="#ff0044" />
      
      {/* North: Big Jump */}
      <Ramp position={[0, 1, -15]} rotation={[Math.PI / 12, 0, 0]} args={[8, 0.5, 10]} color="#4f46e5" />
      <Platform position={[0, 2.5, -28]} args={[10, 5, 12]} color="#312e81" />
      <Ramp position={[0, 1, -41]} rotation={[-Math.PI / 12, 0, 0]} args={[8, 0.5, 10]} color="#4f46e5" />

      {/* East: Speed Bumps */}
      <SpeedBump position={[15, -0.1, 0]} />
      <SpeedBump position={[15, -0.1, -3]} />
      <SpeedBump position={[15, -0.1, -6]} />
      <SpeedBump position={[15, -0.1, -9]} />
      <SpeedBump position={[15, -0.1, -12]} />

      {/* West: Steep Hill Climb */}
      <Ramp position={[-15, 2, 0]} rotation={[0, 0, -Math.PI / 8]} args={[15, 0.5, 8]} color="#059669" />
      <Platform position={[-28, 4.5, 0]} args={[12, 9, 12]} color="#064e3b" />

      {/* South: Banked Turn / Quarter Pipe */}
      <Ramp position={[0, 2, 20]} rotation={[-Math.PI / 4, 0, 0]} args={[20, 0.5, 10]} color="#be123c" />
    </>
  );

  return (
    <div className="w-full h-screen bg-zinc-900">
      {gameState === 'playing' && !showSettings && (
        <>
          <DebugWindow />
          <div className="absolute top-4 left-4 z-10 text-white font-mono text-sm pointer-events-none bg-black/50 p-4 rounded-xl">
            <h1 className="text-xl font-bold mb-2">3D Car Game</h1>
            <p>W / Up Arrow: Accelerate</p>
            <p>S / Down Arrow: Reverse</p>
            <p>A / Left Arrow: Steer Left</p>
            <p>D / Right Arrow: Steer Right</p>
            <p>Space: Brake</p>
            <p>R: Reset Position</p>
            <p>C: Toggle Collision Boxes</p>
            <p>V: Toggle Camera Mode</p>
          </div>
        </>
      )}
      <Canvas shadows dpr={[1, 2]} performance={{ min: 0.5 }} camera={{ position: [0, 5, 15], fov: 50 }}>
        {(cameraMode === 'free' || gameState === 'menu') && <OrbitControls makeDefault rotateSpeed={cameraSensitivity} autoRotate={gameState === 'menu'} autoRotateSpeed={1} />}
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.2} />
        <directionalLight 
          position={[20, 30, 20]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          shadow-camera-near={0.1}
          shadow-camera-far={100}
          shadow-bias={-0.0001}
        />
        <Physics broadphase="sap" gravity={[0, -9.81, 0]}>
          {isDebug ? <Debug>{sceneContents}</Debug> : sceneContents}
        </Physics>
        <Effects />
        <Environment preset="night" />
        <EffectComposer disableNormalPass>
          <N8AO aoRadius={2} intensity={2} halfRes />
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
          <ToneMapping />
        </EffectComposer>
      </Canvas>

      {/* Main Menu Overlay */}
      {gameState === 'menu' && !showSettings && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white font-mono">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-2 z-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 drop-shadow-lg">RETRO DRIFT</h1>
          <p className="text-zinc-300 mb-12 z-10 tracking-widest text-sm md:text-base font-semibold">PHYSICS DRIVING SIMULATOR</p>
          
          <div className="flex flex-col gap-4 z-10 w-64">
            <button 
              onClick={() => setGameState('playing')}
              className="py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              START ENGINE
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="py-4 bg-zinc-800/80 backdrop-blur hover:bg-zinc-700 text-white font-bold rounded-lg transition-transform hover:scale-105 active:scale-95 border border-zinc-600"
            >
              SETTINGS
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md text-white font-mono p-4">
          <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
              <h2 className="text-xl font-bold text-emerald-400 tracking-wider">SETTINGS</h2>
              <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-white p-2">✕</button>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="text-xs text-zinc-400 mb-2 uppercase tracking-wider">Vehicle</div>
                <div className="flex gap-2">
                  {Object.entries(CAR_CONFIGS).map(([key, c]) => (
                    <button
                      key={key}
                      onClick={() => setCarType(key as any)}
                      className={`flex-1 py-2 px-2 text-xs rounded border transition-colors ${carType === key ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-zinc-400 mb-2 uppercase tracking-wider">
                  <span>Touch Controls</span>
                  <button 
                    onClick={() => setShowTouchControls(prev => !prev)}
                    className={`px-3 py-1 rounded border transition-colors ${showTouchControls ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}`}
                  >
                    {showTouchControls ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
                {showTouchControls && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setSteeringType('buttons')}
                      className={`flex-1 py-2 px-2 text-xs rounded border transition-colors ${steeringType === 'buttons' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                      Buttons
                    </button>
                    <button
                      onClick={() => setSteeringType('joystick')}
                      className={`flex-1 py-2 px-2 text-xs rounded border transition-colors ${steeringType === 'joystick' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                      Joystick
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2 uppercase tracking-wider">
                  <span>Camera Distance</span>
                  <span className="text-emerald-400">{cameraDistance}</span>
                </div>
                <input 
                  type="range" min="5" max="20" step="1" 
                  value={cameraDistance} 
                  onChange={(e) => setCameraDistance(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2 uppercase tracking-wider">
                  <span>Free Cam Sensitivity</span>
                  <span className="text-emerald-400">{cameraSensitivity.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="0.1" max="3" step="0.1" 
                  value={cameraSensitivity} 
                  onChange={(e) => setCameraSensitivity(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-Game HUD */}
      {gameState === 'playing' && !showSettings && (
        <>
          <button 
            onClick={() => setShowSettings(true)}
            className="absolute top-4 right-4 z-20 w-12 h-12 bg-zinc-800/50 backdrop-blur border border-zinc-600 rounded-full flex items-center justify-center text-white hover:bg-zinc-700 transition-colors shadow-lg"
            aria-label="Settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>

          {/* Touch Controls UI */}
          {showTouchControls && (
            <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end pointer-events-none">
              {/* Steering (Left Side) */}
              <div className="pointer-events-auto">
                {steeringType === 'joystick' ? (
                  <Joystick />
                ) : (
                  <div className="flex gap-4">
                    <button 
                      className="w-16 h-16 bg-zinc-800/80 backdrop-blur border-2 border-zinc-600 rounded-full flex items-center justify-center text-white active:bg-zinc-600 active:scale-95 transition-all select-none shadow-lg"
                      onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', key: 'ArrowLeft' }))}
                      onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowLeft', key: 'ArrowLeft' }))}
                      onPointerLeave={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowLeft', key: 'ArrowLeft' }))}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button 
                      className="w-16 h-16 bg-zinc-800/80 backdrop-blur border-2 border-zinc-600 rounded-full flex items-center justify-center text-white active:bg-zinc-600 active:scale-95 transition-all select-none shadow-lg"
                      onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight' }))}
                      onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight', key: 'ArrowRight' }))}
                      onPointerLeave={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight', key: 'ArrowRight' }))}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Pedals (Right Side) */}
              <div className="flex gap-4 pointer-events-auto">
                <button 
                  className="w-16 h-16 bg-red-900/80 backdrop-blur border-2 border-red-700 rounded-full flex items-center justify-center text-white active:bg-red-700 active:scale-95 transition-all select-none shadow-lg"
                  onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }))}
                  onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ' }))}
                  onPointerLeave={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ' }))}
                >
                  <span className="font-bold text-xs uppercase">Brake</span>
                </button>
                <button 
                  className="w-16 h-24 bg-emerald-900/80 backdrop-blur border-2 border-emerald-700 rounded-full flex items-center justify-center text-white active:bg-emerald-700 active:scale-95 transition-all select-none shadow-lg"
                  onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp', key: 'ArrowUp' }))}
                  onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowUp', key: 'ArrowUp' }))}
                  onPointerLeave={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowUp', key: 'ArrowUp' }))}
                >
                  <span className="font-bold text-xs uppercase">Gas</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
