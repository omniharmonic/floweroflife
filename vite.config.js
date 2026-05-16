import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.js'],
  },
});
