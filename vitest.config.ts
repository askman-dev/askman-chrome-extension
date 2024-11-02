import { defineConfig, mergeConfig } from 'vitest/config';

// export default defineConfig({
//   plugins: [ViteToml()],
//   test: {
//     exclude: ['**/third-party/**', '**/node_modules/**'],
//     globals: true,
//     environment: 'jsdom',
//   },
//   resolve: {
//     alias: {
//       '@src': path.resolve(__dirname, './src'),
//       '@root': path.resolve(__dirname, './'),
//       '@assets': path.resolve(__dirname, './src/assets')
//     }
//   }
// })
import viteConfig from './vite.config';

export default defineConfig(
  mergeConfig(viteConfig, {
    test: {
      exclude: ['**/third-party/**', '**/node_modules/**'],
      globals: true,
      environment: 'jsdom',
      deps: {
        optimizer: {
          web: {
            include: ['**/*.toml'], // Changed from /\.toml$/ to '**/*.toml'
          },
        },
      },
    },
  }),
);
