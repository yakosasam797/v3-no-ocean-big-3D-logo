// The 3D mark beside the wordmark. It rests in the brand pose, turns a little clockwise (down to the right) about
// its hub in the plane of the screen only, and eases back to rest. It never tilts and never turns upside down.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const HUB = { x: -.0002, y: .8988 };   // centre of the six arrows, measured from the GLB

export function startMark(canvas, { reduced = false } = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch (e) { return false; }
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 1, .1, 50);
  // Seen slightly from the left and below, so the depth of the arrows shows; the view itself never moves.
  camera.position.set(-1.5, -.9, 6.97); camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight('#ffffff', '#c9cff5', 2.2));
  const key = new THREE.DirectionalLight('#fff6f0', 2.6); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight('#7C8DFF', 1.4); rim.position.set(4, -1, -3); scene.add(rim);
  const pivot = new THREE.Group(); scene.add(pivot);
  new GLTFLoader().load('/logo_sculpture.glb', g => {
    const m = g.scene;
    m.traverse(c => {
      if (!c.isMesh) return;
      c.geometry.computeVertexNormals(); c.material.side = THREE.DoubleSide; c.material.roughness = Math.max(.8, c.material.roughness ?? .9); c.material.metalness = 0;
    });
    const box = new THREE.Box3().setFromObject(m), size = box.getSize(new THREE.Vector3());
    m.position.set(-HUB.x, -HUB.y, -(box.min.z + box.max.z) / 2);   // turn about the hub, not the bounding box
    const holder = new THREE.Group();
    holder.rotation.z = Math.PI;                                    // red arrow (the weight) hangs at the bottom
    holder.scale.setScalar(2.75 / Math.max(size.x, size.y));
    holder.add(m); pivot.add(holder);
    canvas.classList.add('ready'); st.ready = true;
  });

  // Motion: rest in the brand pose (upright, turned 25° clockwise, red arrow at about one o'clock), turn a little
  // further clockwise, down to the right, ease back to the rest pose, pause, repeat. Never upside down.
  const REST = Math.PI - 25 * Math.PI / 180;            // pivot angle for the brand pose (red arrow is at the top)
  const TURN = (reduced ? 10 : 18) * Math.PI / 180;     // how far it turns before coming back
  const CYCLE = reduced ? 7 : 5.5, MOVE = 3.6;          // seconds per cycle; seconds of that spent moving
  const st = { t: 0, push: 0, pv: 0, ready: false };
  canvas.addEventListener('pointerenter', () => { st.pv -= .9; });   // a small extra nudge, also down-right
  let w = 0, h = 0, visible = true, last = performance.now();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  const frame = (now) => {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!visible || document.hidden) return;
    const W = canvas.clientWidth, H = canvas.clientHeight;
    if (W !== w || H !== h) { w = W; h = H; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); }
    if (st.ready) st.t += dt;
    // 0 → TURN → 0 along a smooth sin² curve, then rest; starts with a rest so the brand pose is seen first.
    const c = (st.t % CYCLE) - (CYCLE - MOVE), k = c > 0 ? Math.sin(Math.PI * c / MOVE) ** 2 : 0;
    st.pv += (-st.push * 14 - st.pv * 4.5) * dt; st.push += st.pv * dt;                  // damped spring for the nudge
    pivot.rotation.z = REST - TURN * k + Math.max(-.2, Math.min(.2, st.push));           // clockwise = negative z; screen plane only
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
  return true;
}
