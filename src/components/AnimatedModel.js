import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function AnimatedModel({ emotion }) {
  const group = useRef();
  const { scene, animations } = useGLTF(
    "/assets/models/astronaut_redux_animated.glb"
  );
  const mixer = useRef();

  // Configurar animaciones
  React.useEffect(() => {
    if (emotion === "happy" && animations && group.current) {
      mixer.current = new THREE.AnimationMixer(group.current);
      const action = mixer.current.clipAction(
        animations.find((clip) => clip.name === emotion) || animations[0]
      );
      action.reset().fadeIn(0.5).play();
      return () => mixer.current.stopAllAction();
    }
  }, [emotion, animations]);

  useFrame((_, delta) => {
    if (mixer.current) mixer.current.update(delta);
  });

  // No renderizar el modelo si la emoción no es "happy"
  if (emotion !== "happy") {
    return null;
  }

  return <primitive ref={group} object={scene} />;
}

export default AnimatedModel;
