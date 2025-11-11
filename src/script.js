import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Detect container — Webflow or local fallback
 */
const container = document.getElementById('cube-project-3d') || document.body
let canvas = container.querySelector('canvas.webgl')
if (!canvas) {
  canvas = document.createElement('canvas')
  canvas.classList.add('webgl')
  container.appendChild(canvas)
}

/**
 * Scene setup
 */
const scene = new THREE.Scene()
scene.background = null // transparent background

/**
 * Renderer setup
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  precision: 'highp',
  powerPreference: 'high-performance',
  logarithmicDepthBuffer: true
})
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.8
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor(0x000000, 0)

/**
 * Camera
 * - pulled back further for orthographic-like look
 * - narrower FOV for flatter perspective
 */
const camera = new THREE.PerspectiveCamera(45, 1, 0.3, 80)
camera.position.set(6, 1.5, 14)
scene.add(camera)

/**
 * Controls — locked cinematic angle
 */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableZoom = false
controls.enablePan = false
controls.minPolarAngle = Math.PI / 2.3
controls.maxPolarAngle = Math.PI / 2.3
controls.target.set(0, 0.5, 0) // centered target

/**
 * Lighting setup
 */
scene.add(new THREE.AmbientLight(0x3d5a7a, 0.4))

const keyLight = new THREE.DirectionalLight(0xffeaa7, 1.8)
keyLight.position.set(5, 6, 4)
scene.add(keyLight)

const fillLight = new THREE.DirectionalLight(0x74b9ff, 1.2)
fillLight.position.set(-6, 3, 3)
scene.add(fillLight)

const rimLight = new THREE.SpotLight(0x60a5fa, 3.2, 15, Math.PI / 4, 0.3)
rimLight.position.set(-3, 4, -5)
scene.add(rimLight)

const accentLight = new THREE.PointLight(0xffa726, 2.2, 10)
accentLight.position.set(4, 2, 3)
scene.add(accentLight)

const topLight = new THREE.PointLight(0xdfe6e9, 1.1, 12)
topLight.position.set(0, 8, 0)
scene.add(topLight)

const movingLight = new THREE.PointLight(0x60a5fa, 1.8, 12)
movingLight.position.set(3, 3, 0)
scene.add(movingLight)

/**
 * Environment reflection
 */
const pmrem = new THREE.PMREMGenerator(renderer)
const envScene = new THREE.Scene()
const envMesh = new THREE.Mesh(
  new THREE.SphereGeometry(500, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0x1e1e1e, side: THREE.BackSide })
)
envScene.add(envMesh)
scene.environment = pmrem.fromScene(envScene).texture
pmrem.dispose()
envMesh.geometry.dispose()
envMesh.material.dispose()

/**
 * Material
 */
const steelMat = new THREE.MeshStandardMaterial({
  color: 0xbababa,
  metalness: 0.95,
  roughness: 0.18,
  envMapIntensity: 2.4
})

/**
 * Cube Frame
 */
const cubeGroup = new THREE.Group()
scene.add(cubeGroup)

function addBeam(p1, p2, thickness = 0.26) {
  const dir = new THREE.Vector3().subVectors(p2, p1)
  const len = dir.length()
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
  const geom = new THREE.BoxGeometry(thickness, thickness, len)
  const mesh = new THREE.Mesh(geom, steelMat)
  const quat = new THREE.Quaternion()
  quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize())
  mesh.quaternion.copy(quat)
  mesh.position.copy(mid)
  cubeGroup.add(mesh)
  geom.dispose()
}

const s = 2
const h = s / 2
const yStretch = 1.4
const v = {
  nnn: new THREE.Vector3(-h, -h * yStretch, -h),
  pnn: new THREE.Vector3(h, -h * yStretch, -h),
  npn: new THREE.Vector3(-h, h * yStretch, -h),
  ppn: new THREE.Vector3(h, h * yStretch, -h),
  nnp: new THREE.Vector3(-h, -h * yStretch, h),
  pnp: new THREE.Vector3(h, -h * yStretch, h),
  npp: new THREE.Vector3(-h, h * yStretch, h),
  ppp: new THREE.Vector3(h, h * yStretch, h)
}

const edges = [
  [v.nnn, v.pnn], [v.pnn, v.pnp], [v.pnp, v.nnp], [v.nnp, v.nnn],
  [v.npn, v.ppn], [v.ppn, v.ppp], [v.ppp, v.npp], [v.npp, v.npn],
  [v.nnn, v.npn], [v.pnn, v.ppn], [v.pnp, v.ppp], [v.nnp, v.npp]
]
edges.forEach(([a, b]) => addBeam(a, b, 0.26))

cubeGroup.rotation.x = -0.12 // slight tilt
cubeGroup.rotation.z = 0.1

/**
 * ✅ Responsive resize — orthographic-like proportion (~55–60% fill)
 */
function resizeRenderer() {
  const width = container.clientWidth || window.innerWidth
  const height = container.clientHeight || window.innerHeight
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()

  const fovInRad = (camera.fov * Math.PI) / 180
  const viewHeight = 2 * Math.tan(fovInRad / 2) * camera.position.z
  const viewWidth = viewHeight * camera.aspect
  const scaleFactor = Math.min(viewWidth, viewHeight) * 0.22 // tuned for ~55-60% fill
  cubeGroup.scale.setScalar(scaleFactor)
  cubeGroup.position.y = 0 // vertically centered
}

window.addEventListener('resize', resizeRenderer)
resizeRenderer()

/**
 * Animation loop
 */
const clock = new THREE.Clock()
function animate() {
  const t = clock.getElapsedTime()
  cubeGroup.rotation.y = t * 0.12
  cubeGroup.rotation.x = Math.sin(t * 0.05) * 0.15
  cubeGroup.rotation.z = Math.cos(t * 0.04) * 0.1

  movingLight.position.x = Math.cos(t * 0.3) * 5
  movingLight.position.z = Math.sin(t * 0.3) * 5
  movingLight.position.y = 3 + Math.sin(t * 0.25) * 1.2

  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()

/**
 * Cleanup
 */
window.addEventListener('beforeunload', () => {
  controls.dispose()
  renderer.dispose()
  scene.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
      else obj.material.dispose()
    }
  })
})
