import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import axios from 'axios'

const riskColors = {
  high: 0xef4444,
  medium: 0xf97316,
  low: 0x22c55e,
}

function CityView3D() {
  const mountRef = useRef(null)
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchZones() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/traffic-zones')
        setZones(response.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchZones()
  }, [])

  useEffect(() => {
    if (loading || zones.length === 0) return

    const width = mountRef.current.clientWidth
    const height = 500

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1e293b)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(15, 15, 20)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    mountRef.current.innerHTML = ''
    mountRef.current.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    scene.add(directionalLight)

    const groundGeometry = new THREE.PlaneGeometry(30, 30)
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x334155 })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    scene.add(ground)

    const spacing = 5
    const startX = -((zones.length - 1) * spacing) / 2

    zones.forEach((zone, index) => {
      const height = zone.level === 'high' ? 6 : zone.level === 'medium' ? 4 : 2

      const geometry = new THREE.BoxGeometry(2, height, 2)
      const material = new THREE.MeshStandardMaterial({
        color: riskColors[zone.level] || 0x888888,
      })
      const cube = new THREE.Mesh(geometry, material)

      cube.position.set(startX + index * spacing, height / 2, 0)
      scene.add(cube)
    })

    let animationId
    function animate() {
      animationId = requestAnimationFrame(animate)
      scene.rotation.y += 0.003
      renderer.render(scene, camera)
    }
    animate()

    function handleResize() {
      const newWidth = mountRef.current.clientWidth
      camera.aspect = newWidth / height
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, height)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [zones, loading])

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">3D City Risk Visualization</h2>
      <p className="text-gray-500 mb-4">
        Building height and color represent congestion risk per zone — taller and redder means higher risk.
      </p>

      {loading && <p className="text-gray-500">Loading city data...</p>}

      <div
        ref={mountRef}
        className="rounded-lg overflow-hidden shadow"
        style={{ height: '500px', width: '100%' }}
      ></div>
    </div>
  )
}

export default CityView3D