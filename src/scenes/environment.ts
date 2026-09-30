// Enkel HDRI-ersättare: en gradienthimmel med några ljuspaneler, förfiltrerad
// med PMREM till en miljökarta för ambient ljus och reflektioner.

import * as THREE from 'three';

export function createEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const scene = new THREE.Scene();
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vD; void main(){
      float h = vD.y;
      vec3 top = vec3(0.10, 0.12, 0.15);
      vec3 hor = vec3(0.22, 0.24, 0.27);
      vec3 gnd = vec3(0.02, 0.02, 0.022);
      vec3 c = h > 0.0 ? mix(hor, top, pow(h, 0.6)) : mix(hor * 0.4, gnd, pow(-h, 0.5));
      gl_FragColor = vec4(c, 1.0);
    }`,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), mat));
  // Kallt nyckelljus bakifrån och en svag varm ljuskälla – ger kantreflexer i metall/glas.
  const panel = (color: THREE.Color, pos: THREE.Vector3, w: number, h: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.position.copy(pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  panel(new THREE.Color(4.0, 4.6, 5.4), new THREE.Vector3(2, 3, -8), 5, 2.2);
  panel(new THREE.Color(1.6, 1.8, 2.1), new THREE.Vector3(-7, 5, 2), 3, 6);
  panel(new THREE.Color(2.2, 1.5, 1.0), new THREE.Vector3(6, 1.5, 6), 2, 2);
  panel(new THREE.Color(1.2, 1.3, 1.4), new THREE.Vector3(0, 9, 0), 8, 8);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(scene, 0.02);
  pmrem.dispose();
  return rt.texture;
}
