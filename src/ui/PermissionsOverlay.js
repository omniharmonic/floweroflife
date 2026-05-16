export class PermissionsOverlay {
  constructor({ onEnable }) {
    this.onEnable = onEnable;
    this.root = document.createElement('section');
    this.root.className = 'permission-overlay';
    this.root.innerHTML = `
      <div class="permission-card">
        <p class="eyebrow">ambient mode is already alive</p>
        <h1>Tap to let the room breathe back.</h1>
        <p class="permission-copy">
          Enable microphone and camera reactivity for slow prismatic ripples. Nothing is recorded.
        </p>
        <button type="button">Enable mic + camera</button>
        <small>Press F or double-click the canvas for fullscreen.</small>
      </div>
    `;
    this.button = this.root.querySelector('button');
    this.button.addEventListener('click', () => this.enable());
    document.body.appendChild(this.root);
  }

  async enable() {
    this.button.disabled = true;
    this.button.textContent = 'Opening the room...';

    try {
      await this.onEnable();
      this.dismiss();
    } catch (error) {
      this.button.disabled = false;
      this.button.textContent = 'Try permissions again';
      this.showToast('Running in ambient mode. Permissions can be retried here.');
      console.info('Media permissions unavailable; continuing in ambient mode.', error);
    }
  }

  showToast(message) {
    const toast = document.createElement('button');
    toast.type = 'button';
    toast.className = 'ambient-toast';
    toast.textContent = message;
    toast.addEventListener('click', () => toast.remove());
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 8000);
  }

  dismiss() {
    this.root.classList.add('is-hidden');
    window.setTimeout(() => this.root.remove(), 900);
  }
}
