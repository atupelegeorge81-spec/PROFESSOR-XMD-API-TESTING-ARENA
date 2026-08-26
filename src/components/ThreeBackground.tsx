import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  isGenerating?: boolean;
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ isGenerating = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isGeneratingRef = useRef(isGenerating);

  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.002);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Particle System (Neural Grid Nodes)
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    const cyanColor = new THREE.Color(0x00f3ff);
    const magentaColor = new THREE.Color(0xff007f);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 800;

      velocities.push({
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: (Math.random() - 0.5) * 0.4,
      });

      const mixFactor = Math.random();
      const mixedColor = cyanColor.clone().lerp(magentaColor, mixFactor);
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material with Soft Canvas Texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.4, 'rgba(0,243,255,0.8)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 12,
      vertexColors: true,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Dynamic Neural Network Lines
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(particleCount * particleCount * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onPointerMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.1;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.1;
    };

    window.addEventListener('mousemove', onPointerMove);

    // Handle Resize
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize);

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const speedMultiplier = isGeneratingRef.current ? 2.5 : 1.0;

      // Mouse Lerp
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      particles.rotation.y += 0.001 * speedMultiplier;
      particles.rotation.x += 0.0005 * speedMultiplier;
      linesMesh.rotation.y = particles.rotation.y;
      linesMesh.rotation.x = particles.rotation.x;

      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Move Particles
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3] += velocities[i].x * speedMultiplier;
        posArr[i * 3 + 1] += velocities[i].y * speedMultiplier;
        posArr[i * 3 + 2] += velocities[i].z * speedMultiplier;

        // Bounce back within bounds
        if (Math.abs(posArr[i * 3]) > 400) velocities[i].x *= -1;
        if (Math.abs(posArr[i * 3 + 1]) > 400) velocities[i].y *= -1;
        if (Math.abs(posArr[i * 3 + 2]) > 400) velocities[i].z *= -1;
      }
      posAttr.needsUpdate = true;

      // Update Lines connecting nearby particles
      let lineIndex = 0;
      const maxDistance = 120;
      const lPosArr = lineGeometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = posArr[i * 3] - posArr[j * 3];
          const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
          const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDistance) {
            lPosArr[lineIndex++] = posArr[i * 3];
            lPosArr[lineIndex++] = posArr[i * 3 + 1];
            lPosArr[lineIndex++] = posArr[i * 3 + 2];

            lPosArr[lineIndex++] = posArr[j * 3];
            lPosArr[lineIndex++] = posArr[j * 3 + 1];
            lPosArr[lineIndex++] = posArr[j * 3 + 2];
          }
        }
      }

      lineGeometry.setDrawRange(0, lineIndex / 3);
      (lineGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('resize', onWindowResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none -z-10 bg-[#030712] transition-opacity duration-1000"
    />
  );
};
