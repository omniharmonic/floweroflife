import * as THREE from 'three';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.clock = new THREE.Clock();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x020304, 1);
    this.container.appendChild(this.renderer.domElement);
    this.onResize = this.onResize.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', (event) => {
      if (event.key.toLowerCase() === 'f') {
        this.toggleFullscreen();
      }
    });
    this.renderer.domElement.addEventListener('dblclick', this.toggleFullscreen);
    this.onResize();
  }

  onResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height, false);
  }

  toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }

    this.container.requestFullscreen?.();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
