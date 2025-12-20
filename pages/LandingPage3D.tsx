import React, { useRef, useState, useContext } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Stars, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useLocalization } from '../hooks/useLocalization';
import { AppContext } from '../contexts/AppContext';
import * as THREE from 'three';

const FloatingShape = ({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime() * speed) * 0.2;
      mesh.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={mesh} position={position}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
    </Float>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <FloatingShape position={[-4, 2, -5]} color="#0d9488" speed={0.5} />
      <FloatingShape position={[4, -2, -5]} color="#f59e0b" speed={0.7} />
      <FloatingShape position={[0, 3, -8]} color="#6366f1" speed={0.3} />

      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
};

const LandingPage3D: React.FC = () => {
  const { setAuthPage } = useContext(AppContext)!;
  const { t } = useLocalization();

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <Scene />
        </Canvas>
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center pointer-events-auto"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-amber-400">
            ArtisanX
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto px-4">
            {t('landing.heroSubtitle') || "Empowering Artisans with AI & Innovation"}
          </p>
          
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAuthPage('login')}
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 rounded-full font-semibold text-lg transition-colors shadow-lg shadow-teal-500/30"
            >
              {t('landing.getStarted') || "Get Started"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAuthPage('login')}
              className="px-8 py-3 bg-transparent border-2 border-white/20 hover:bg-white/10 rounded-full font-semibold text-lg transition-colors backdrop-blur-sm"
            >
              {t('landing.exploreMarketplace') || "Explore Market"}
            </motion.button>
          </div>
        </motion.div>
      </div>
      
      {/* Feature Cards Overlay */}
      <div className="absolute bottom-10 left-0 right-0 z-10 flex justify-center gap-6 px-4 pointer-events-none hidden md:flex">
        {[
            { title: "AI Powered", desc: "Gemini & GPT-5.1 Integration", color: "bg-blue-500/20" },
            { title: "Global Reach", desc: "Connect with worldwide markets", color: "bg-purple-500/20" },
            { title: "Secure", desc: "Blockchain & Digital Certificates", color: "bg-green-500/20" }
        ].map((feature, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.2 }}
                className={`p-4 rounded-xl backdrop-blur-md border border-white/10 ${feature.color} w-64 pointer-events-auto`}
            >
                <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-300">{feature.desc}</p>
            </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage3D;
