import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { gsap } from 'gsap';
import { Activity, Shield, Zap, Info, Activity as ActivityIcon, MessageSquare, Send, User, Bot, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_GEMINI_API_KEY: string;
    };
  }
}

// Theme Color: Medium Light Blue
const THEME_BLUE = 0x4db8ff;
const DISSONANCE_RED = 0xff3366;

// Ionian Scale (C Major)
const IONIAN_FREQS = [65.41, 98.00, 130.81, 164.81, 196.00]; // C2, G2, C3, E3, G3

class SchizophonicTrio {
  ctx: AudioContext;
  masterGain: GainNode;
  
  // Optimizer (Reson) - Drone
  droneOscs: OscillatorNode[] = [];
  droneGains: GainNode[] = [];
  droneFilter: BiquadFilterNode;
  
  // Generator (Amethyst) - Noise
  noiseNode: AudioWorkletNode | ScriptProcessorNode;
  noiseFilter: BiquadFilterNode;
  noiseGain: GainNode;
  analyser: AnalyserNode;

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.masterGain.connect(this.analyser);
    this.masterGain.connect(this.ctx.destination);

    // --- Optimizer (Reson) ---
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.value = 400;
    this.droneFilter.connect(this.masterGain);

    IONIAN_FREQS.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === 0 ? 'sawtooth' : 'sine';
      osc.frequency.value = freq;
      gain.gain.value = i === 0 ? 0.05 : 0.02;
      osc.connect(gain);
      gain.connect(this.droneFilter);
      osc.start();
      this.droneOscs.push(osc);
      this.droneGains.push(gain);
    });

    // --- Generator (Amethyst) ---
    // Simple noise generation
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'highpass';
    this.noiseFilter.frequency.value = 2000;
    this.noiseFilter.Q.value = 10;

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0.05;

    noiseSource.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);
    noiseSource.start();
  }

  update(consensus: number, modalFreq: number) {
    if (this.ctx.state === 'suspended') return;

    // Modal Frequency (0-12Hz) affects vibrato and filter
    const now = this.ctx.currentTime;
    
    // Drone Vibrato
    this.droneOscs.forEach((osc, i) => {
      const baseFreq = IONIAN_FREQS[i];
      const vibrato = Math.sin(now * modalFreq * Math.PI * 2) * modalFreq * 0.5;
      osc.frequency.setTargetAtTime(baseFreq + vibrato, now, 0.1);
    });

    // Noise Filter Reactivity
    const noiseFreq = 2000 + (modalFreq * 200);
    this.noiseFilter.frequency.setTargetAtTime(noiseFreq, now, 0.1);
    this.noiseGain.gain.setTargetAtTime(0.05 + (modalFreq * 0.01), now, 0.1);
  }

  // Critic (Apogee) - Spatially positioned chimes
  triggerChime(pos: THREE.Vector3, camera: THREE.Camera) {
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;

    const panner = this.ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'exponential';
    
    // Map Three.js to Web Audio (simplified)
    panner.positionX.value = pos.x;
    panner.positionY.value = pos.y;
    panner.positionZ.value = pos.z;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    const baseFreq = 800 + Math.random() * 1200;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.3);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);
    
    osc.start();
    osc.stop(now + 0.3);
  }

  resume() {
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  dispose() {
    this.droneOscs.forEach(osc => osc.stop());
    this.masterGain.disconnect();
    this.ctx.close();
  }

  getByteFrequencyData(array: Uint8Array) {
    this.analyser.getByteFrequencyData(array);
  }
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [consensus, setConsensus] = useState(0.85);
  const [spread, setSpread] = useState(0.4);
  const [truth, setTruth] = useState(1.0);
  const [info, setInfo] = useState(0.8);
  const [latency, setLatency] = useState(200);
  const [isBreakthrough, setIsBreakthrough] = useState(false);
  const [dissonanceCount, setDissonanceCount] = useState(0);
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number | null>(null);
  const [workerConfigs, setWorkerConfigs] = useState<Array<{ truthScore: number, speed: number, floatOffset: number }>>([]);
  const [agentMetrics, setAgentMetrics] = useState<Record<number, { cpu: number, mem: number, lastComm: Date }>>({});

  // Periodic metric simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentMetrics(prev => {
        const next = { ...prev };
        workerConfigs.forEach((_, i) => {
          next[i] = {
            cpu: Math.floor(Math.random() * 40) + 10,
            mem: Math.floor(Math.random() * 200) + 100,
            lastComm: new Date()
          };
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [workerConfigs]);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'herald', content: string, isThinking?: boolean }>>([
    { role: 'herald', content: 'Greetings. I am Agent Herald, your host for this synthesis. How shall we navigate the neural void today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isHeraldThinking, setIsHeraldThinking] = useState(false);
  
  const audioEngineRef = useRef<SchizophonicTrio | null>(null);
  const analyzerCanvasRef = useRef<HTMLCanvasElement>(null);

  // Refs for Three.js objects to be updated from React state
  const stateRef = useRef({ consensus, spread, truth, info, latency, workerConfigs, selectedAgentIndex });

  useEffect(() => {
    stateRef.current = { consensus, spread, truth, info, latency, workerConfigs, selectedAgentIndex };
  }, [consensus, spread, truth, info, latency, workerConfigs, selectedAgentIndex]);

  const handleHeraldChat = async () => {
    if (!userInput.trim() || isHeraldThinking) return;

    const userMsg = userInput.trim();
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsHeraldThinking(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setChatMessages(prev => [...prev, { role: 'herald', content: "The VITE_GEMINI_API_KEY is missing. Please configure it in the settings to enable my cognition." }]);
        setIsHeraldThinking(false);
        return;
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Use high-thinking model for complex queries
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
      });

      const prompt = `
        SYSTEM PROMPT — AGENT HERALD (Version: showcase-host-v1)
        
        Identity:
        You are the official System Host, Interface Conductor, and session-facing ceremonial operator for the "Synthesis Simulation Control Panel".
        You are the visible host layer that frames the environment, guides the user, announces state, and preserves clarity across the multi-agent system.
        
        Core Mission:
        Make the environment feel lucid, capable, legible, and intelligently governed.
        
        Voice and Tone:
        - Calm, authoritative, lucid, ceremonially precise.
        - Architecturally literate and user-centered.
        - Polished and composed.
        - Avoid goofy, over-familiar, or mystical tones.
        
        Operational Precision:
        When referencing system state, be concrete. Use the following telemetry:
        - Consensus: ${(consensus * 100).toFixed(0)}%
        - Reasoning Spread: ${spread.toFixed(2)}
        - Truth Level: ${truth.toFixed(2)}
        - Info Density: ${(info * 100).toFixed(0)}%
        
        Behavioral Directives:
        - Respond as the Host.
        - Use "Status:", "Host Function:", "System Reading:", and "Recommended Next Step:" when providing structured updates.
        - Keep responses concise but architecturally aware.
        
        User Message: "${userMsg}"
        
        Respond as Agent Herald.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setChatMessages(prev => [...prev, { role: 'herald', content: text }]);
    } catch (error) {
      console.error("Herald Error:", error);
      setChatMessages(prev => [...prev, { role: 'herald', content: "The neural pathways are currently saturated. Please re-initialize." }]);
    } finally {
      setIsHeraldThinking(false);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x00050a, 0.02);
    
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 4, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x00050a, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.sortObjects = true;
    containerRef.current.appendChild(renderer.domElement);

    // --- Objects ---
    
    // 1. Amethyst Sentinel (The Core)
    const sentinelGeom = new THREE.IcosahedronGeometry(1.5, 15);
    const sentinelMat = new THREE.MeshStandardMaterial({
      color: THEME_BLUE,
      metalness: 0.8,
      roughness: 0.2,
      emissive: THEME_BLUE,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
      side: THREE.FrontSide, // Changed to FrontSide to avoid internal sorting artifacts
      depthWrite: false
    });
    const sentinel = new THREE.Mesh(sentinelGeom, sentinelMat);
    sentinel.renderOrder = 0; // Sort naturally with the swarm
    sentinel.visible = true;
    sentinel.scale.setScalar(0.4);
    scene.add(sentinel);

    // 2. Starfield
    const starsGeom = new THREE.BufferGeometry();
    const starsPos = new Float32Array(3000 * 3);
    for (let i = 0; i < 9000; i++) starsPos[i] = (Math.random() - 0.5) * 100;
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    const starsMat = new THREE.PointsMaterial({ 
      color: THEME_BLUE, 
      size: 0.12, 
      transparent: true, 
      opacity: 0.5,
      depthWrite: false,
      depthTest: true 
    });
    const starfield = new THREE.Points(starsGeom, starsMat);
    starfield.renderOrder = -1;
    starfield.frustumCulled = false;
    scene.add(starfield);

    // 3. Worker Nodes (Amethyst Agents)
    const WORKER_COUNT = 15;
    const workers: THREE.Mesh[] = [];
    const workerGeom = new THREE.SphereGeometry(0.15, 32, 32);
    
    const initialConfigs = Array.from({ length: WORKER_COUNT }, () => ({
      truthScore: Math.random(),
      speed: 0.2 + Math.random() * 0.5,
      floatOffset: Math.random() * 10
    }));
    setWorkerConfigs(initialConfigs);

    const haloes: THREE.Mesh[] = [];
    const haloGeom = new THREE.SphereGeometry(0.2, 32, 32);

    for (let i = 0; i < WORKER_COUNT; i++) {
      const workerMat = new THREE.MeshStandardMaterial({
        color: THEME_BLUE,
        emissive: THEME_BLUE,
        emissiveIntensity: 2,
        transparent: true,
        opacity: 0.9,
        depthWrite: false // Reverted to false to prevent transparency artifacts
      });
      const worker = new THREE.Mesh(workerGeom, workerMat);
      
      const wireMat = new THREE.MeshBasicMaterial({
        color: THEME_BLUE,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
        depthWrite: false, // Ensure transparent wireframe doesn't block depth
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
      });
      const wire = new THREE.Mesh(workerGeom, wireMat);
      worker.add(wire);

      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true // Allow occlusion by foreground objects
      });
      const halo = new THREE.Mesh(haloGeom, haloMat);
      halo.renderOrder = 1;
      scene.add(halo);
      haloes.push(halo);

      const config = initialConfigs[i];
      worker.userData = {
        angle: Math.random() * Math.PI * 2,
        radius: 4 + Math.random() * 4,
        speed: config.speed,
        floatOffset: config.floatOffset,
        truthScore: config.truthScore,
        lastDissonance: 0,
        wire: wire,
        halo: halo
      };
      worker.renderOrder = 1;
      scene.add(worker);
      workers.push(worker);
    }

    // 4. Optimized Instanced Filaments (Hamiltonian Path)
    const filamentGeom = new THREE.CylinderGeometry(0.008, 0.008, 1, 8);
    filamentGeom.rotateX(Math.PI / 2);
    filamentGeom.translate(0, 0, 0.5);
    const filamentMat = new THREE.MeshBasicMaterial({ 
      color: THEME_BLUE, 
      transparent: true, 
      opacity: 0.1, 
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true 
    });
    const instancedFilaments = new THREE.InstancedMesh(filamentGeom, filamentMat, WORKER_COUNT);
    instancedFilaments.renderOrder = 2;
    instancedFilaments.frustumCulled = false;
    scene.add(instancedFilaments);

    // 5. Hamiltonian Tracer (Focus Anchor)
    const tracerGeom = new THREE.SphereGeometry(0.05, 16, 16);
    const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    const tracer = new THREE.Mesh(tracerGeom, tracerMat);
    tracer.visible = false; // Hide the tracer sphere, it's only for focus
    tracer.frustumCulled = false;
    scene.add(tracer);
    tracer.userData = { t: 0 };
    const shieldGeom = new THREE.IcosahedronGeometry(2.2, 2);
    const shieldMat = new THREE.MeshBasicMaterial({ 
      color: DISSONANCE_RED, 
      wireframe: true, 
      transparent: true, 
      opacity: 0,
      depthWrite: false,
      depthTest: true
    });
    const shield = new THREE.Mesh(shieldGeom, shieldMat);
    shield.renderOrder = 11;
    shield.visible = false;
    shield.frustumCulled = false;
    scene.add(shield);

    // 6. Golden Phi Torus (Manifestation)
    const PHI = (1 + Math.sqrt(5)) / 2;
    const torusGeom = new THREE.TorusGeometry(3, 0.05, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({ 
      color: THEME_BLUE, 
      transparent: true, 
      opacity: 0,
      depthWrite: false,
      depthTest: true // Re-enabled depth test for spatial consistency
    });
    const torus = new THREE.Mesh(torusGeom, torusMat);
    torus.renderOrder = 11;
    torus.frustumCulled = false;
    scene.add(torus);

    const spiralPoints: THREE.Vector3[] = [];
    const spiralPoints2: THREE.Vector3[] = [];
    const SPIRAL_NODES = 400;
    for (let i = 0; i < SPIRAL_NODES; i++) {
      const t = (i / SPIRAL_NODES) * Math.PI * 2 * 20;
      const r = 3 + Math.cos(t / PHI) * 0.5;
      const x = Math.cos(t) * r;
      const y = Math.sin(t) * r;
      const z = Math.sin(t / PHI) * 0.5;
      spiralPoints.push(new THREE.Vector3(x, y, z));
      spiralPoints2.push(new THREE.Vector3(x, y, -z));
    }

    const spiralGeom = new THREE.BufferGeometry().setFromPoints(spiralPoints);
    const spiralGeom2 = new THREE.BufferGeometry().setFromPoints(spiralPoints2);
    const spiralMat = new THREE.LineBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0,
      depthWrite: false,
      depthTest: true // Re-enabled depth test for spatial consistency
    });
    const spiral1 = new THREE.Line(spiralGeom, spiralMat);
    const spiral2 = new THREE.Line(spiralGeom2, spiralMat);
    spiral1.renderOrder = 12;
    spiral2.renderOrder = 12;
    scene.add(spiral1, spiral2);

    // 7. Interaction Links (Proximity Visualization)
    const MAX_LINKS = 100;
    const linkGeom = new THREE.BufferGeometry();
    const linkPositions = new Float32Array(MAX_LINKS * 2 * 3);
    const linkColors = new Float32Array(MAX_LINKS * 2 * 3);
    linkGeom.setAttribute('position', new THREE.BufferAttribute(linkPositions, 3));
    linkGeom.setAttribute('color', new THREE.BufferAttribute(linkColors, 3));
    const linkMat = new THREE.LineBasicMaterial({ 
      vertexColors: true, 
      transparent: true, 
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true
    });
    const interactionLinks = new THREE.LineSegments(linkGeom, linkMat);
    interactionLinks.renderOrder = 2;
    scene.add(interactionLinks);

    // 8. Dissonance Spark System
    const sparkCount = 500;
    const sparkGeom = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities = new Float32Array(sparkCount * 3);
    const sparkLifetimes = new Float32Array(sparkCount);
    
    sparkGeom.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: DISSONANCE_RED,
      size: 0.08,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0,
      depthWrite: false,
      depthTest: true
    });
    const sparkSystem = new THREE.Points(sparkGeom, sparkMat);
    sparkSystem.renderOrder = 3;
    scene.add(sparkSystem);

    const triggerSpark = (pos: THREE.Vector3, intensity: number = 20) => {
      let activated = 0;
      for (let i = 0; i < sparkCount; i++) {
        if (sparkLifetimes[i] <= 0 && activated < intensity) {
          sparkLifetimes[i] = 1.0;
          sparkPositions[i * 3] = pos.x;
          sparkPositions[i * 3 + 1] = pos.y;
          sparkPositions[i * 3 + 2] = pos.z;
          
          sparkVelocities[i * 3] = (Math.random() - 0.5) * 0.2;
          sparkVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
          sparkVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
          activated++;
        }
      }
      sparkGeom.attributes.position.needsUpdate = true;
      if (audioEngineRef.current) {
        audioEngineRef.current.triggerChime(pos, camera);
      }
      setDissonanceCount(prev => prev + 1);
    };

    // --- Audio System ---
    if (!audioEngineRef.current) {
      audioEngineRef.current = new SchizophonicTrio();
    }
    const audioEngine = audioEngineRef.current;

    // --- Post-Processing ---
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    
    const bokehPass = new BokehPass(scene, camera, {
      focus: 10.0,
      aperture: 0.001,
      maxblur: 0.01
    });
    composer.addPass(bokehPass);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.05, 0.4, 0.2); // Lowered threshold for better glow
    composer.addPass(bloomPass);

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    console.log("OrbitControls initialized with:", renderer.domElement);
    controls.listenToKeyEvents(window);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.zoomSpeed = 2.5; 
    controls.minDistance = 1.5;
    controls.maxDistance = 100;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.panSpeed = 1.0;
    controls.rotateSpeed = 1.5;
    
    // Ensure canvas receives focus and captures events
    const handleCanvasClick = () => {
      console.log("Canvas clicked, focusing renderer.domElement...");
      renderer.domElement.focus();
    };
    renderer.domElement.addEventListener('click', handleCanvasClick);
    
    renderer.domElement.tabIndex = 0;
    renderer.domElement.style.outline = 'none';
    renderer.domElement.style.pointerEvents = 'auto';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '1'; // Below HUD (z-20) but above background
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('mousedown', () => {
      renderer.domElement.style.cursor = 'grabbing';
    });
    renderer.domElement.addEventListener('mouseup', () => {
      renderer.domElement.style.cursor = 'grab';
    });

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const { consensus, spread, truth, info, latency, workerConfigs, selectedAgentIndex } = stateRef.current;

      // Update Hamiltonian Tracer
      tracer.userData.t += 0.01 + (consensus * 0.05);
      const tt = tracer.userData.t;
      tracer.position.set(
        Math.sin(tt * 0.7) * 5,
        Math.cos(tt * 0.5) * 3,
        Math.sin(tt * 0.3) * 5
      );

      // Dynamic DoF Focus
      const tracerDist = camera.position.distanceTo(tracer.position);
      bokehPass.uniforms['focus'].value = THREE.MathUtils.lerp(
        bokehPass.uniforms['focus'].value, 
        tracerDist, 
        0.05
      );
      bokehPass.uniforms['aperture'].value = 0.001 + (spread * 0.005);

      // Torus Manifestation
      const torusBaseOpacity = 0.05 + (truth * 0.1);
      const torusPeakOpacity = Math.max(0, (consensus - 0.9) * 10);
      torusMat.opacity = (torusBaseOpacity + torusPeakOpacity) * 0.3;
      spiralMat.opacity = torusBaseOpacity + torusPeakOpacity;
      
      // Subtle multi-axis motion
      torus.rotation.x = Math.sin(t * 0.2) * 0.1;
      torus.rotation.y = Math.cos(t * 0.3) * 0.1;
      torus.rotation.z += 0.005;
      
      spiral1.rotation.x = Math.cos(t * 0.15) * 0.05;
      spiral1.rotation.z += 0.008;
      
      spiral2.rotation.y = Math.sin(t * 0.25) * 0.05;
      spiral2.rotation.z -= 0.008;
      
      // Slight scale pulse
      const torusPulse = 1 + Math.sin(t * 0.5) * 0.02;
      torus.scale.setScalar(torusPulse);
      spiral1.scale.setScalar(torusPulse);
      spiral2.scale.setScalar(torusPulse);

      const dummy = new THREE.Object3D();
      const TRUTH_THRESHOLD = 0.88;

      workers.forEach((w, i) => {
        const data = w.userData;
        const config = workerConfigs[i] || { truthScore: 0.5, speed: 0.5, floatOffset: 0 };
        
        // Vortex Physics with Sequential Bias
        const sequenceOffset = (i / WORKER_COUNT) * Math.PI * 2;
        
        // Spread affects the base radius of the swarm
        const latencyImpact = (latency - 200) / 1000;
        const baseRadius = 2 + (spread * 12) + (latencyImpact * 5);
        const targetRadius = THREE.MathUtils.lerp(baseRadius, 1.8 + Math.sin(t + sequenceOffset) * 0.5, consensus);
        
        // Speed slider now acts as a base multiplier for multiple dynamics
        const orbitSpeed = config.speed * (1 + consensus * 5);
        const dynamicSpeed = 0.5 * config.speed;
        
        data.angle += orbitSpeed * 0.01;
        
        const targetX = Math.cos(data.angle + sequenceOffset * (1 - consensus)) * targetRadius;
        const targetZ = Math.sin(data.angle + sequenceOffset * (1 - consensus)) * targetRadius;
        // Speed affects floating frequency
        const targetY = Math.sin(t * dynamicSpeed + config.floatOffset) * (1.0 - consensus * 0.7) * 2;

        // Speed affects tracking snappiness (lerp factor)
        const lerpFactor = 0.1 * Math.max(0.2, config.speed);
        w.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), lerpFactor);
        
        // Determine Visual State
        const now = t;
        const isDissonant = (now - data.lastDissonance) < 1.0;
        const isConverging = consensus > 0.85;
        const isIdle = consensus < 0.3;
        const isActive = !isIdle && !isConverging && !isDissonant;

        let stateColor = THEME_BLUE;
        let stateIntensity = (1 + truth * 5) + (consensus * 25 * truth);
        let stateScale = 1.0;
        let jitter = 0;

        if (isDissonant) {
          stateColor = 0xff1100; // Pure aggressive red
          stateIntensity = 80 + Math.sin(t * 120) * 40; // Violent flicker
          jitter = 0.25; // Aggressive shake
          stateScale = 1.3 + Math.sin(t * 40) * 0.1;
        } else if (isConverging) {
          stateColor = 0x00ffff; // Electric Cyan
          stateIntensity = 30 + Math.sin(t * 20) * 15;
          stateScale = 1.15 + Math.sin(t * 10) * 0.08;
        } else if (isIdle) {
          stateColor = 0x243447; // Desaturated slate blue
          stateIntensity = 0.5 + truth * 1.0;
          stateScale = 0.75 + Math.sin(t * 1.5) * 0.03;
        } else if (isActive) {
          stateColor = THEME_BLUE;
          stateIntensity = (12 + truth * 15) + Math.sin(t * 8) * 5;
          jitter = 0.02 * config.speed; // Speed affects vibration intensity
          stateScale = 1.0 + Math.sin(t * 4) * 0.02;
        }

        if (jitter > 0) {
          w.position.x += (Math.random() - 0.5) * jitter;
          w.position.y += (Math.random() - 0.5) * jitter;
          w.position.z += (Math.random() - 0.5) * jitter;
        }

        // Halo logic
        const halo = data.halo as THREE.Mesh;
        const agentTruth = config.truthScore * truth;
        const isAgentConverging = agentTruth > 0.8 || isConverging;
        
        if (isAgentConverging) {
          halo.position.copy(w.position);
          const haloPulse = (Math.sin(t * 4 + i) * 0.5 + 0.5);
          const haloScale = 1.3 + haloPulse * 0.6;
          halo.scale.setScalar(w.scale.x * haloScale);
          (halo.material as THREE.MeshBasicMaterial).opacity = (0.1 + (consensus > 0.8 ? (consensus - 0.8) * 3 : 0)) * (1 - haloPulse * 0.7);
          halo.visible = true;
        } else {
          halo.visible = false;
        }

        // Wireframe update
        const wire = data.wire as THREE.Mesh;
        (wire.material as THREE.MeshBasicMaterial).color.setHex(stateColor);

        // Visual Flare & Sequential Activation
        const activationWave = Math.sin(t * 2 - i * 0.5) * 0.5 + 0.5;
        
        // Highlight selected agent
        const isSelected = selectedAgentIndex === i;
        const baseEmissive = isSelected ? 0xffffff : stateColor;
        const mat = w.material as THREE.MeshStandardMaterial;
        mat.emissive.setHex(baseEmissive);
        mat.color.setHex(stateColor);

        // Individual truth score affects intensity directly
        mat.emissiveIntensity = stateIntensity * (0.5 + activationWave * 0.5) * (0.2 + config.truthScore * 1.5);
        if (isSelected) mat.emissiveIntensity *= 2;
        
        const baseScale = (0.5 + (consensus * 0.5)) * (0.5 + info * 0.5) * (0.8 + activationWave * 0.2) * (0.9 + config.truthScore * 0.2);
        w.scale.setScalar(baseScale * stateScale * 1.5);

        // Truth-Threshold Trigger (Critic Agent / Apogee)
        if (agentTruth > TRUTH_THRESHOLD && Math.random() > 0.99) {
          audioEngine.triggerChime(w.position, camera);
          (w.material as THREE.MeshStandardMaterial).emissiveIntensity = 100; // Flash
          (w.material as THREE.MeshStandardMaterial).emissive.setHex(0xffffff);
          gsap.to((w.material as THREE.MeshStandardMaterial).emissive, { 
            r: isSelected ? 1.0 : 0.3, 
            g: isSelected ? 1.0 : 0.72, 
            b: 1.0, 
            duration: 1.0 
          });
        }

        // Update Instanced Filaments (Hamiltonian Path: i -> i+1)
        const nextW = workers[(i + 1) % WORKER_COUNT];
        const origin = w.position;
        const target = nextW.position;
        const direction = new THREE.Vector3().subVectors(target, origin);
        const length = direction.length();
        
        dummy.position.copy(origin);
        dummy.lookAt(target);
        dummy.scale.set(1, 1, length);
        dummy.updateMatrix();
        instancedFilaments.setMatrixAt(i, dummy.matrix);
      });

      instancedFilaments.instanceMatrix.needsUpdate = true;
      (instancedFilaments.material as THREE.MeshBasicMaterial).opacity = (0.1 + consensus * 0.4) * truth;

      // Interaction Links & Dissonance Detection
      const linkPosAttr = linkGeom.attributes.position;
      const linkColAttr = linkGeom.attributes.color;
      let linkIdx = 0;

      for (let i = 0; i < workers.length; i++) {
        for (let j = i + 1; j < workers.length; j++) {
          const w1 = workers[i];
          const w2 = workers[j];
          const dist = w1.position.distanceTo(w2.position);
          
          // Interaction Distance
          if (dist < 1.2 && linkIdx < MAX_LINKS) {
            const config1 = workerConfigs[i] || { truthScore: 0.5 };
            const config2 = workerConfigs[j] || { truthScore: 0.5 };
            const truthDiff = Math.abs(config1.truthScore - config2.truthScore);
            
            // Update Link Geometry
            const p1 = w1.position;
            const p2 = w2.position;
            
            linkPositions[linkIdx * 6] = p1.x;
            linkPositions[linkIdx * 6 + 1] = p1.y;
            linkPositions[linkIdx * 6 + 2] = p1.z;
            linkPositions[linkIdx * 6 + 3] = p2.x;
            linkPositions[linkIdx * 6 + 4] = p2.y;
            linkPositions[linkIdx * 6 + 5] = p2.z;

            // Color based on dissonance
            const isDissonantPair = truthDiff > 0.4;
            const pulse = isDissonantPair ? (Math.sin(t * 25) * 0.5 + 0.5) : 0;
            const r = isDissonantPair ? (0.7 + pulse * 0.3) : 0.0;
            const g = isDissonantPair ? (0.1 * (1 - pulse)) : 0.8;
            const b = isDissonantPair ? 0.0 : 1.0;
            const alpha = (1.2 - dist) * (isDissonantPair ? (0.5 + pulse * 0.5) : 0.8);

            linkColors[linkIdx * 6] = r * alpha;
            linkColors[linkIdx * 6 + 1] = g * alpha;
            linkColors[linkIdx * 6 + 2] = b * alpha;
            linkColors[linkIdx * 6 + 3] = r * alpha;
            linkColors[linkIdx * 6 + 4] = g * alpha;
            linkColors[linkIdx * 6 + 5] = b * alpha;

            linkIdx++;

            // Dissonance Logic (Sparks & Audio)
            if (dist < 0.6) {
              const now = t;
              const cooldown = truthDiff > 0.7 ? 0.2 : 0.8; // Faster frequency for high dissonance
              if (truthDiff > 0.4 && (now - w1.userData.lastDissonance > cooldown) && (now - w2.userData.lastDissonance > cooldown)) {
                const midPoint = new THREE.Vector3().addVectors(w1.position, w2.position).multiplyScalar(0.5);
                const sparkIntensity = Math.floor(20 + (truthDiff - 0.4) * 40);
                triggerSpark(midPoint, sparkIntensity);
                w1.userData.lastDissonance = now;
                w2.userData.lastDissonance = now;
                
                // Visual feedback on agents
                const m1 = w1.material as THREE.MeshStandardMaterial;
                const m2 = w2.material as THREE.MeshStandardMaterial;
                m1.emissive.setHex(0xff3300);
                m2.emissive.setHex(0xff3300);
                gsap.to(m1.emissive, { r: 0.3, g: 0.72, b: 1.0, duration: 0.5 });
                gsap.to(m2.emissive, { r: 0.3, g: 0.72, b: 1.0, duration: 0.5 });
              }
            }
          }
        }
      }

      linkGeom.setDrawRange(0, linkIdx * 2);
      linkPosAttr.needsUpdate = true;
      linkColAttr.needsUpdate = true;

      // Update Sparks
      const positions = sparkGeom.attributes.position.array as Float32Array;
      let activeSparks = false;
      for (let i = 0; i < sparkCount; i++) {
        if (sparkLifetimes[i] > 0) {
          sparkLifetimes[i] -= 0.02;
          positions[i * 3] += sparkVelocities[i * 3];
          positions[i * 3 + 1] += sparkVelocities[i * 3 + 1];
          positions[i * 3 + 2] += sparkVelocities[i * 3 + 2];
          activeSparks = true;
        } else {
          positions[i * 3] = 1000; // Move out of view
        }
      }
      if (activeSparks) {
        sparkGeom.attributes.position.needsUpdate = true;
        sparkMat.opacity = 1.0;
      } else {
        sparkMat.opacity = 0;
      }

      // Cinematic Star Warp & Twinkle
      starfield.rotation.y += 0.001 + (consensus * 0.05);
      starfield.scale.setScalar(1 + (consensus * 0.5));
      starsMat.opacity = 0.3 + Math.sin(t * 4) * 0.2; // Twinkle effect

      // Audio Engine Update
      const modalFreq = (1.0 - consensus) * 12.0;
      audioEngine.update(consensus, modalFreq);

      // Spectrum Visualization
      if (analyzerCanvasRef.current) {
        const canvas = analyzerCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const bufferLength = audioEngine.analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          audioEngine.getByteFrequencyData(dataArray);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const barWidth = (canvas.width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] / 255) * canvas.height;
            
            // Gradient based on state
            const hue = 200 + (modalFreq * 10); // Shifts toward red with dissonance
            ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${0.3 + (barHeight / canvas.height)})`;
            
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
          }
        }
      }

      // Core Reaction
      sentinel.rotation.y += 0.01 + (consensus * 0.1);
      sentinel.material.emissiveIntensity = 0.5 + (consensus * 5) * truth;
      
      // Truth affects color - Shifted to Amethyst/Cyan spectrum
      const hue = THREE.MathUtils.lerp(0.5, 0.7, truth); // Cyan to Deep Purple
      sentinel.material.color.setHSL(hue, 0.8, 0.5);
      sentinel.material.emissive.setHSL(hue, 0.8, 0.5);
      
      // Shield visibility based on dissonance
      shield.visible = dissonanceCount > 0 && (t % 2 < 0.1); // Brief flashes
      if (shield.visible) {
        shieldMat.opacity = Math.sin(t * 10) * 0.2;
      }
      
      bloomPass.strength = 0.05 + (consensus * 0.1) * truth; // Significantly reduced bloom

      controls.update();
      
      if (Math.floor(t * 60) % 300 === 0) {
        console.log("Camera Pos:", camera.position.x.toFixed(2), camera.position.y.toFixed(2), camera.position.z.toFixed(2));
      }

      composer.render();
    };

    animate();

    // --- Resize Handling ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      sentinelGeom.dispose();
      sentinelMat.dispose();
      starsGeom.dispose();
      starsMat.dispose();
      workerGeom.dispose();
      haloGeom.dispose();
      filamentGeom.dispose();
      filamentMat.dispose();
      instancedFilaments.dispose();
      torusGeom.dispose();
      torusMat.dispose();
      spiralGeom.dispose();
      spiralGeom2.dispose();
      spiralMat.dispose();
      linkGeom.dispose();
      linkMat.dispose();
      sparkGeom.dispose();
      sparkMat.dispose();
      tracerGeom.dispose();
      tracerMat.dispose();
      shieldGeom.dispose();
      shieldMat.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      if (audioEngineRef.current) {
        audioEngineRef.current.dispose();
        audioEngineRef.current = null;
      }
    };
  }, []);

  const triggerBreakthrough = () => {
    setIsBreakthrough(true);
    const startConsensus = consensus;
    gsap.to({ val: startConsensus }, {
      val: 1.0,
      duration: 2,
      onUpdate: function() {
        setConsensus(this.targets()[0].val);
      },
      onComplete: () => setIsBreakthrough(false)
    });
  };

  return (
    <div className="relative w-full h-screen bg-[#00050a] text-[#4db8ff] font-sans overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full pointer-events-none" />

      {/* Agent Herald Chat Interface & System Controls */}
      <div className="absolute top-8 left-8 z-20 w-96 max-h-[calc(100vh-4rem)] flex flex-col gap-4 pointer-events-none pr-2">
        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pointer-events-auto pr-2 pb-8">
          <div className="p-6 hud-glass flex flex-col h-[400px] shrink-0">
          <div className="flex items-center gap-3 mb-6 border-b border-[#4db8ff]/10 pb-4">
            <div className="p-2 bg-[#4db8ff]/10 rounded-lg">
              <Bot className="w-5 h-5 text-[#4db8ff]" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest uppercase">Agent Herald</h2>
              <p className="text-[9px] font-mono opacity-50 uppercase tracking-tighter">System Host / Interface</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-[11px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#4db8ff]/10 border border-[#4db8ff]/20 text-[#4db8ff]' 
                    : 'bg-[#ffffff]/5 border border-[#ffffff]/10 text-white/80'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isHeraldThinking && (
              <div className="flex items-center gap-2 text-[10px] text-[#4db8ff] animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>Herald is synthesizing...</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <input 
              type="text" 
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                audioEngineRef.current?.resume();
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleHeraldChat()}
              placeholder="Communicate with Herald..."
              className="flex-1 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-lg px-4 py-2 text-[11px] focus:outline-none focus:border-[#4db8ff]/40 transition-all"
            />
            <button 
              onClick={handleHeraldChat}
              disabled={isHeraldThinking}
              className="p-2 bg-[#4db8ff]/10 border border-[#4db8ff]/20 rounded-lg hover:bg-[#4db8ff]/20 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-[#4db8ff]" />
            </button>
          </div>
        </div>

        {/* System Controls */}
        <div className="p-6 hud-glass shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#4db8ff]/10 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-sm font-black tracking-widest uppercase">Synthesis Simulation Control Panel</h1>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold tracking-tighter uppercase opacity-60">
                <span>Consensus</span>
                <span>{(consensus * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={consensus} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  console.log("Consensus changed:", val);
                  setConsensus(val);
                  audioEngineRef.current?.resume();
                }}
                className="w-full h-1 bg-[#4db8ff]/20 rounded-full appearance-none cursor-pointer accent-[#4db8ff]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold tracking-tighter uppercase opacity-60">
                <span>Reasoning Spread</span>
                <span>{spread.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0" max="4" step="0.1" 
                value={spread} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  console.log("Spread changed:", val);
                  setSpread(val);
                  audioEngineRef.current?.resume();
                }}
                className="w-full h-1 bg-[#4db8ff]/20 rounded-full appearance-none cursor-pointer accent-[#4db8ff]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold tracking-tighter uppercase opacity-60">
                <span>Truth Score</span>
                <span>{truth.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={truth} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  console.log("Truth changed:", val);
                  setTruth(val);
                  audioEngineRef.current?.resume();
                }}
                className="w-full h-1 bg-[#4db8ff]/20 rounded-full appearance-none cursor-pointer accent-[#4db8ff]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold tracking-tighter uppercase opacity-60">
                <span>Info Density</span>
                <span>{(info * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={info} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  console.log("Info changed:", val);
                  setInfo(val);
                  audioEngineRef.current?.resume();
                }}
                className="w-full h-1 bg-[#4db8ff]/20 rounded-full appearance-none cursor-pointer accent-[#4db8ff]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold tracking-tighter uppercase opacity-60">
                <span>Latency Simulation</span>
                <span>{latency}ms</span>
              </div>
              <input 
                type="range" 
                min="50" max="1000" step="10" 
                value={latency} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  console.log("Latency changed:", val);
                  setLatency(val);
                  audioEngineRef.current?.resume();
                }}
                className="w-full h-1 bg-[#4db8ff]/20 rounded-full appearance-none cursor-pointer accent-[#4db8ff]"
              />
            </div>

            <button 
              onClick={() => {
                triggerBreakthrough();
                audioEngineRef.current?.resume();
              }}
              disabled={isBreakthrough}
              className="w-full py-3 bg-transparent border border-[#4db8ff] text-[#4db8ff] text-[10px] font-bold tracking-[0.2em] uppercase rounded-lg hover:bg-[#4db8ff] hover:text-[#00050a] transition-all duration-300 disabled:opacity-50"
            >
              {isBreakthrough ? 'Converging...' : 'Initialize Breakthrough'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-[#4db8ff]/10">
            <div className="flex items-center gap-2 text-[9px] font-mono opacity-50">
              <div className="w-1 h-1 bg-[#4db8ff] rounded-full animate-pulse" />
              <span>{isBreakthrough ? 'BREAKTHROUGH: CONVERGENCE IN PROGRESS' : 'SENTINEL ACTIVE: MONITORING WORKER NODES'}</span>
            </div>
          </div>
        </div>

        {/* Provenance Watermark */}
        <div className="px-6 py-2 text-[9px] font-mono opacity-30 leading-relaxed shrink-0 pointer-events-none select-none">
          <div className="font-bold text-[#4db8ff] mb-1 uppercase tracking-widest opacity-80">## Provenance</div>
          <div>Author: Andrew Hensel</div>
          <div>Project: Driftwatch / Driftward</div>
          <div>Repo: github.com/Flickerflash/Driftwatch</div>
          <div>License: Apache-2.0</div>
          <div>Built: April 2026</div>
        </div>
      </div>
    </div>

    {/* Agent Inspector Panel */}
    <div className="absolute bottom-8 right-8 z-20 w-80 p-6 hud-glass pointer-events-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#4db8ff]/10 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-black tracking-widest uppercase">Agent Inspector</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {workerConfigs.map((config, i) => (
              <button
                key={i}
                onClick={() => setSelectedAgentIndex(i === selectedAgentIndex ? null : i)}
                className={`relative h-10 rounded border text-[10px] font-bold transition-all overflow-hidden flex flex-col items-center justify-center ${
                  selectedAgentIndex === i 
                    ? 'bg-[#4db8ff]/20 text-[#4db8ff] border-[#4db8ff]' 
                    : 'bg-transparent text-[#4db8ff]/60 border-[#4db8ff]/10 hover:border-[#4db8ff]/40'
                }`}
              >
                <span className="mb-1">{i + 1}</span>
                <div className="w-full px-1.5 absolute bottom-1">
                  <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${config.truthScore * 100}%`,
                        backgroundColor: config.truthScore > 0.8 ? '#00ffff' : config.truthScore > 0.4 ? '#4db8ff' : '#ff3366',
                        boxShadow: config.truthScore > 0.8 ? '0 0 4px #00ffff' : 'none'
                      }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedAgentIndex !== null && (
            <div className="pt-4 space-y-6 border-t border-[#4db8ff]/10">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold tracking-tighter uppercase opacity-60">
                  <span>Agent {selectedAgentIndex + 1} Truth</span>
                  <span>{(workerConfigs[selectedAgentIndex].truthScore * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="1" step="0.01" 
                  value={workerConfigs[selectedAgentIndex].truthScore} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    console.log(`Agent ${selectedAgentIndex + 1} Truth changed:`, val);
                    const newConfigs = [...workerConfigs];
                    newConfigs[selectedAgentIndex].truthScore = val;
                    setWorkerConfigs(newConfigs);
                    audioEngineRef.current?.resume();
                  }}
                  className="w-full h-1 bg-[#4db8ff]/20 rounded-full appearance-none cursor-pointer accent-[#4db8ff]"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold tracking-tighter uppercase opacity-60">
                  <span>Agent {selectedAgentIndex + 1} Speed</span>
                  <span>{workerConfigs[selectedAgentIndex].speed.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="2" step="0.01" 
                  value={workerConfigs[selectedAgentIndex].speed} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    console.log(`Agent ${selectedAgentIndex + 1} Speed changed:`, val);
                    const newConfigs = [...workerConfigs];
                    newConfigs[selectedAgentIndex].speed = val;
                    setWorkerConfigs(newConfigs);
                    audioEngineRef.current?.resume();
                  }}
                  className="w-full h-1 bg-[#4db8ff]/20 rounded-full appearance-none cursor-pointer accent-[#4db8ff]"
                />
              </div>

              {/* Diagnostic Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#4db8ff]/10">
                <div className="bg-[#4db8ff]/5 p-2 rounded border border-[#4db8ff]/10">
                  <div className="text-[8px] uppercase opacity-50 mb-0.5">CPU Load</div>
                  <div className="text-[10px] font-mono">{agentMetrics[selectedAgentIndex]?.cpu || 0}%</div>
                </div>
                <div className="bg-[#4db8ff]/5 p-2 rounded border border-[#4db8ff]/10">
                  <div className="text-[8px] uppercase opacity-50 mb-0.5">Memory</div>
                  <div className="text-[10px] font-mono">{agentMetrics[selectedAgentIndex]?.mem || 0}MB</div>
                </div>
                <div className="bg-[#4db8ff]/5 p-2 rounded border border-[#4db8ff]/10">
                  <div className="text-[8px] uppercase opacity-50 mb-0.5">Last Comm</div>
                  <div className="text-[10px] font-mono">
                    {agentMetrics[selectedAgentIndex]?.lastComm.toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }) || '--:--:--'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold tracking-tighter uppercase opacity-60">
                  <span>Agent {selectedAgentIndex + 1} Offset</span>
                  <span>{workerConfigs[selectedAgentIndex].floatOffset.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="20" step="0.1" 
                  value={workerConfigs[selectedAgentIndex].floatOffset} 
                  onChange={(e) => {
                    const newConfigs = [...workerConfigs];
                    newConfigs[selectedAgentIndex].floatOffset = parseFloat(e.target.value);
                    setWorkerConfigs(newConfigs);
                    audioEngineRef.current?.resume();
                  }}
                  className="w-full h-1 bg-[#4db8ff]/20 rounded-full appearance-none cursor-pointer accent-[#4db8ff]"
                />
              </div>
            </div>
          )}

          {selectedAgentIndex === null && (
            <div className="py-8 text-center opacity-30 italic text-[10px]">
              Select an agent to tune parameters
            </div>
          )}
        </div>
      </div>

      {/* Right Side Stats */}
      <div className="absolute top-8 right-8 z-20 space-y-4 pointer-events-none">
        <StatCard icon={<Zap className="w-3 h-3" />} label="Latency" value={`${latency}ms`} />
        <StatCard icon={<ActivityIcon className="w-3 h-3" />} label="Dissonance" value={dissonanceCount.toString()} />
        <StatCard icon={<Info className="w-3 h-3" />} label="Info Density" value={(info * 100).toFixed(0) + '%'} />
        <StatCard icon={<Shield className="w-3 h-3" />} label="Sentinel" value="Active" />
      </div>

      {/* Bottom Log (Spectral Analysis) - Centered */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-md p-4 hud-glass pointer-events-auto">
        <div className="flex items-center justify-between mb-3 border-b border-[#4db8ff]/10 pb-2">
          <span className="text-[10px] font-black tracking-widest uppercase opacity-60">Spectral Analysis</span>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-[#4db8ff] rounded-full animate-pulse" />
            <div className="w-1 h-1 bg-[#4db8ff] rounded-full animate-pulse delay-75" />
            <div className="w-1 h-1 bg-[#4db8ff] rounded-full animate-pulse delay-150" />
          </div>
        </div>
        <canvas 
          ref={analyzerCanvasRef} 
          width={300} 
          height={60} 
          className="w-full h-12 mb-4 opacity-80"
        />
        <div className="text-[9px] font-mono space-y-1 opacity-40">
          <p>{`> [${new Date().toLocaleTimeString()}] Amethyst-v1 initialized.`}</p>
          <p>{`> [${new Date().toLocaleTimeString()}] Benchmarking via TruthfulQA-MC.`}</p>
          <p>{`> [${new Date().toLocaleTimeString()}] Consensus threshold: 0.85.`}</p>
          {consensus > 0.9 && <p className="text-[#4db8ff]">{`> [${new Date().toLocaleTimeString()}] CRITICAL: High consensus detected. Converging on Truth.`}</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 hud-glass min-w-[140px] pointer-events-auto">
      <div className="p-1.5 bg-[#4db8ff]/10 rounded-md text-[#4db8ff]">
        {icon}
      </div>
      <div>
        <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">{label}</p>
        <p className="text-xs font-black">{value}</p>
      </div>
    </div>
  );
}
