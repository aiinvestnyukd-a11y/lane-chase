import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildCar, carById, type CarConfig } from '@/lib/cars';

interface CarPreview3DProps {
  carId: string;
  size?: number;
  spin?: number;
}

/** Spinning showroom view of a single car for the garage picker. */
export const CarPreview3D = ({ carId, size = 240, spin = 0.6 }: CarPreview3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 2.0, 5.5);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(3, 4, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9ecfff, 0.45);
    fill.position.set(-3, 2, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.5);
    rim.position.set(0, 1, -4);
    scene.add(rim);

    const car = new THREE.Group();
    buildCar(car, carById(carId) as CarConfig);
    scene.add(car);

    let raf = 0;
    const start = performance.now();
    const animate = () => {
      const t = (performance.now() - start) / 1000;
      car.rotation.y = t * spin;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [carId, size, spin]);

  return <div ref={containerRef} style={{ width: size, height: size }} className="mx-auto" />;
};
