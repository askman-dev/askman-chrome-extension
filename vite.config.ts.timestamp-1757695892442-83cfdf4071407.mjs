// vite.config.ts
import { defineConfig } from "file:///Users/admin/Codespaces/askman-dev/askman-chrome-extension/node_modules/.pnpm/vite@5.4.10_@types+node@22.8.7_lightningcss@1.30.1_sass@1.83.4_terser@5.44.0/node_modules/vite/dist/node/index.js";
import zipPack from "file:///Users/admin/Codespaces/askman-dev/askman-chrome-extension/node_modules/.pnpm/vite-plugin-zip-pack@1.2.4_vite@5.4.10_@types+node@22.8.7_lightningcss@1.30.1_sass@1.83.4_terser@5.44.0_/node_modules/vite-plugin-zip-pack/dist/esm/index.mjs";
import { ViteToml } from "file:///Users/admin/Codespaces/askman-dev/askman-chrome-extension/node_modules/.pnpm/vite-plugin-toml@0.7.0_rollup@4.50.1/node_modules/vite-plugin-toml/dist/index.js";
import react from "file:///Users/admin/Codespaces/askman-dev/askman-chrome-extension/node_modules/.pnpm/@vitejs+plugin-react@5.0.2_vite@5.4.10_@types+node@22.8.7_lightningcss@1.30.1_sass@1.83.4_terser@5.44.0_/node_modules/@vitejs/plugin-react/dist/index.js";
import path3, { resolve as resolve3 } from "path";

// utils/plugins/make-manifest.ts
import * as fs from "fs";
import * as path from "path";

// utils/log.ts
function colorLog(message, type) {
  let color;
  switch (type) {
    case "success":
      color = COLORS.FgGreen;
      break;
    case "info":
      color = COLORS.FgBlue;
      break;
    case "error":
      color = COLORS.FgRed;
      break;
    case "warning":
      color = COLORS.FgYellow;
      break;
    default:
      color = COLORS[type];
      break;
  }
  console.log(color, message);
}
var COLORS = {
  Reset: "\x1B[0m",
  Bright: "\x1B[1m",
  Dim: "\x1B[2m",
  Underscore: "\x1B[4m",
  Blink: "\x1B[5m",
  Reverse: "\x1B[7m",
  Hidden: "\x1B[8m",
  FgBlack: "\x1B[30m",
  FgRed: "\x1B[31m",
  FgGreen: "\x1B[32m",
  FgYellow: "\x1B[33m",
  FgBlue: "\x1B[34m",
  FgMagenta: "\x1B[35m",
  FgCyan: "\x1B[36m",
  FgWhite: "\x1B[37m",
  BgBlack: "\x1B[40m",
  BgRed: "\x1B[41m",
  BgGreen: "\x1B[42m",
  BgYellow: "\x1B[43m",
  BgBlue: "\x1B[44m",
  BgMagenta: "\x1B[45m",
  BgCyan: "\x1B[46m",
  BgWhite: "\x1B[47m"
};

// utils/manifest-parser/index.ts
var ManifestParser = class {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {
  }
  static convertManifestToString(manifest) {
    if (process.env.__FIREFOX__) {
      manifest = this.convertToFirefoxCompatibleManifest(manifest);
    }
    return JSON.stringify(manifest, null, 2);
  }
  static convertToFirefoxCompatibleManifest(manifest) {
    const manifestCopy = {
      ...manifest
    };
    manifestCopy.background = {
      scripts: [manifest.background?.service_worker],
      type: "module"
    };
    manifestCopy.options_ui = {
      page: manifest.options_page,
      browser_style: false
    };
    manifestCopy.content_security_policy = {
      extension_pages: "script-src 'self'; object-src 'self' 'wasm-unsafe-eval'"
    };
    delete manifestCopy.options_page;
    return manifestCopy;
  }
};
var manifest_parser_default = ManifestParser;

// utils/plugins/make-manifest.ts
import url from "url";
import * as process2 from "process";
var __vite_injected_original_dirname = "/Users/admin/Codespaces/askman-dev/askman-chrome-extension/utils/plugins";
var { resolve } = path;
var rootDir = resolve(__vite_injected_original_dirname, "..", "..");
var distDir = resolve(rootDir, "dist");
var manifestFile = resolve(rootDir, "manifest.js");
var getManifestWithCacheBurst = () => {
  const withCacheBurst = (path4) => `${path4}?${Date.now().toString()}`;
  if (process2.platform === "win32") {
    return import(withCacheBurst(url.pathToFileURL(manifestFile).href));
  }
  return import(withCacheBurst(manifestFile));
};
function makeManifest(config) {
  function makeManifest2(manifest, to, cacheKey) {
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to);
    }
    const manifestPath = resolve(to, "manifest.json");
    if (cacheKey) {
      manifest.content_scripts.forEach((script) => {
        script.css &&= script.css.map((css) => css.replace("<KEY>", cacheKey));
      });
    }
    fs.writeFileSync(manifestPath, manifest_parser_default.convertManifestToString(manifest));
    colorLog(`Manifest file copy complete: ${manifestPath}`, "success");
  }
  return {
    name: "make-manifest",
    buildStart() {
      this.addWatchFile(manifestFile);
    },
    async writeBundle() {
      const invalidationKey = config.getCacheInvalidationKey?.();
      const manifest = await getManifestWithCacheBurst();
      makeManifest2(manifest.default, distDir, invalidationKey);
    }
  };
}

// utils/plugins/custom-dynamic-import.ts
function customDynamicImport() {
  return {
    name: "custom-dynamic-import",
    renderDynamicImport({ moduleId }) {
      if (!moduleId.includes("node_modules") && process.env.__FIREFOX__) {
        return {
          left: `
          {
            const dynamicImport = (path) => import(path);
            dynamicImport(browser.runtime.getURL('./') + 
            `,
          right: ".split('../').join(''))}"
        };
      }
      return {
        left: "import(",
        right: ")"
      };
    }
  };
}

// utils/plugins/add-hmr.ts
import * as path2 from "path";
import { readFileSync } from "fs";
var __vite_injected_original_dirname2 = "/Users/admin/Codespaces/askman-dev/askman-chrome-extension/utils/plugins";
var isDev = process.env.__DEV__ === "true";
var DUMMY_CODE = `export default function(){};`;
function getInjectionCode(fileName) {
  return readFileSync(path2.resolve(__vite_injected_original_dirname2, "..", "reload", "injections", fileName), { encoding: "utf8" });
}
function addHmr(config) {
  const { background = false, view = true } = config || {};
  const idInBackgroundScript = "virtual:reload-on-update-in-background-script";
  const idInView = "virtual:reload-on-update-in-view";
  const scriptHmrCode = isDev ? getInjectionCode("script.js") : DUMMY_CODE;
  const viewHmrCode = isDev ? getInjectionCode("view.js") : DUMMY_CODE;
  return {
    name: "add-hmr",
    resolveId(id) {
      if (id === idInBackgroundScript || id === idInView) {
        return getResolvedId(id);
      }
    },
    load(id) {
      if (id === getResolvedId(idInBackgroundScript)) {
        return background ? scriptHmrCode : DUMMY_CODE;
      }
      if (id === getResolvedId(idInView)) {
        return view ? viewHmrCode : DUMMY_CODE;
      }
    }
  };
}
function getResolvedId(id) {
  return "\0" + id;
}

// utils/plugins/watch-rebuild.ts
import { WebSocket } from "file:///Users/admin/Codespaces/askman-dev/askman-chrome-extension/node_modules/.pnpm/ws@8.18.3/node_modules/ws/wrapper.mjs";

// utils/reload/interpreter/index.ts
var MessageInterpreter = class {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {
  }
  static send(message) {
    return JSON.stringify(message);
  }
  static receive(serializedMessage) {
    return JSON.parse(serializedMessage);
  }
};

// utils/reload/constant.ts
var LOCAL_RELOAD_SOCKET_PORT = 8081;
var LOCAL_RELOAD_SOCKET_URL = `ws://localhost:${LOCAL_RELOAD_SOCKET_PORT}`;

// utils/plugins/watch-rebuild.ts
function watchRebuild(config) {
  const ws = new WebSocket(LOCAL_RELOAD_SOCKET_URL);
  return {
    name: "watch-rebuild",
    writeBundle() {
      ws.send(MessageInterpreter.send({ type: "build_complete" }));
      sendNextQueue(() => {
        config.afterWriteBundle();
      });
    }
  };
}
function sendNextQueue(callback) {
  setTimeout(() => {
    callback();
  }, 0);
}

// utils/plugins/inline-vite-preload-script.ts
function inlineVitePreloadScript() {
  let __vitePreload = "";
  return {
    name: "replace-vite-preload-script-plugin",
    async renderChunk(code, chunk, options, meta) {
      if (!/content/.test(chunk.fileName)) {
        return null;
      }
      if (!__vitePreload) {
        const chunkName = Object.keys(meta.chunks).find((key) => /preload/.test(key));
        const modules = meta.chunks?.[chunkName]?.modules;
        __vitePreload = modules?.[Object.keys(modules)?.[0]]?.code;
        __vitePreload = __vitePreload?.replaceAll("const ", "var ");
        __vitePreload = __vitePreload?.replaceAll("assetsURL(dep)", "chrome.runtime.getURL(dep)");
        if (!__vitePreload) {
          return null;
        }
      }
      return {
        code: __vitePreload + code.split(`
`).slice(1).join(`
`)
      };
    }
  };
}

// vite.config.ts
import { viteStaticCopy } from "file:///Users/admin/Codespaces/askman-dev/askman-chrome-extension/node_modules/.pnpm/vite-plugin-static-copy@1.0.6_vite@5.4.10_@types+node@22.8.7_lightningcss@1.30.1_sass@1.83.4_terser@5.44.0_/node_modules/vite-plugin-static-copy/dist/index.js";
var __vite_injected_original_dirname3 = "/Users/admin/Codespaces/askman-dev/askman-chrome-extension";
var rootDir2 = resolve3(__vite_injected_original_dirname3);
var srcDir = resolve3(rootDir2, "src");
var pagesDir = resolve3(srcDir, "pages");
var assetsDir = resolve3(srcDir, "assets");
var outDir = resolve3(rootDir2, "dist");
var publicDir = resolve3(rootDir2, "public");
var isDev2 = process.env.__DEV__ === "true";
var isProduction = !isDev2;
var enableHmrInBackgroundScript = true;
var cacheInvalidationKeyRef = { current: generateKey() };
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@root": rootDir2,
      "@src": srcDir,
      "@assets": assetsDir,
      "@pages": pagesDir,
      "monaco-editor": "monaco-editor/esm/vs/editor/editor.api.js"
    }
  },
  plugins: [
    ViteToml(),
    makeManifest({
      getCacheInvalidationKey
    }),
    react(),
    customDynamicImport(),
    addHmr({ background: enableHmrInBackgroundScript, view: true }),
    isDev2 && watchRebuild({ afterWriteBundle: regenerateCacheInvalidationKey }),
    inlineVitePreloadScript(),
    viteStaticCopy({
      targets: [
        {
          src: "src/assets/conf/*",
          dest: "assets/conf"
        }
      ]
    }),
    isProduction && zipPack({
      outDir,
      outFileName: `extension-v${process.env.npm_package_version || "1.0.0"}.zip`
    })
  ],
  publicDir,
  build: {
    outDir,
    /** Can slow down build speed. */
    // sourcemap: isDev,
    minify: isProduction,
    modulePreload: false,
    reportCompressedSize: isProduction,
    emptyOutDir: !isDev2,
    rollupOptions: {
      input: {
        devtools: resolve3(pagesDir, "devtools", "index.html"),
        panel: resolve3(pagesDir, "panel", "index.html"),
        contentInjected: resolve3(pagesDir, "content", "injected", "index.ts"),
        contentUI: resolve3(pagesDir, "content", "ui", "index.ts"),
        background: resolve3(pagesDir, "background", "index.ts"),
        contentStyle: resolve3(pagesDir, "content", "style.scss"),
        popup: resolve3(pagesDir, "popup", "index.html"),
        "thought-prism": resolve3(pagesDir, "thought-prism", "index.html"),
        options: resolve3(pagesDir, "options", "index.html"),
        sidepanel: resolve3(pagesDir, "sidepanel", "index.html")
      },
      output: {
        entryFileNames: "src/pages/[name]/index.js",
        chunkFileNames: isDev2 ? "assets/js/[name].js" : "assets/js/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          const { name } = path3.parse(assetInfo.name);
          const assetFileName = name === "contentStyle" ? `${name}${getCacheInvalidationKey()}` : name;
          return `assets/[ext]/${assetFileName}.chunk.[ext]`;
        }
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    setupFiles: "./test-utils/vitest.setup.js"
  },
  server: {
    host: "localhost",
    // or '127.0.0.1'
    port: 8081
    // specify the port
  },
  optimizeDeps: {
    include: ["monaco-editor"]
  }
});
function getCacheInvalidationKey() {
  return cacheInvalidationKeyRef.current;
}
function regenerateCacheInvalidationKey() {
  cacheInvalidationKeyRef.current = generateKey();
  return cacheInvalidationKeyRef;
}
function generateKey() {
  return `${Date.now().toFixed()}`;
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidXRpbHMvcGx1Z2lucy9tYWtlLW1hbmlmZXN0LnRzIiwgInV0aWxzL2xvZy50cyIsICJ1dGlscy9tYW5pZmVzdC1wYXJzZXIvaW5kZXgudHMiLCAidXRpbHMvcGx1Z2lucy9jdXN0b20tZHluYW1pYy1pbXBvcnQudHMiLCAidXRpbHMvcGx1Z2lucy9hZGQtaG1yLnRzIiwgInV0aWxzL3BsdWdpbnMvd2F0Y2gtcmVidWlsZC50cyIsICJ1dGlscy9yZWxvYWQvaW50ZXJwcmV0ZXIvaW5kZXgudHMiLCAidXRpbHMvcmVsb2FkL2NvbnN0YW50LnRzIiwgInV0aWxzL3BsdWdpbnMvaW5saW5lLXZpdGUtcHJlbG9hZC1zY3JpcHQudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWRtaW4vQ29kZXNwYWNlcy9hc2ttYW4tZGV2L2Fza21hbi1jaHJvbWUtZXh0ZW5zaW9uXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYWRtaW4vQ29kZXNwYWNlcy9hc2ttYW4tZGV2L2Fza21hbi1jaHJvbWUtZXh0ZW5zaW9uL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9hZG1pbi9Db2Rlc3BhY2VzL2Fza21hbi1kZXYvYXNrbWFuLWNocm9tZS1leHRlbnNpb24vdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIFVzZXJDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgVXNlckNvbmZpZyBhcyBWaXRlc3RVc2VyQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5pbXBvcnQgemlwUGFjayBmcm9tICd2aXRlLXBsdWdpbi16aXAtcGFjayc7IC8vIFx1NkRGQlx1NTJBMFx1OEZEOVx1ODg0Q1xuaW1wb3J0IHsgVml0ZVRvbWwgfSBmcm9tICd2aXRlLXBsdWdpbi10b21sJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCwgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgbWFrZU1hbmlmZXN0IGZyb20gJy4vdXRpbHMvcGx1Z2lucy9tYWtlLW1hbmlmZXN0JztcbmltcG9ydCBjdXN0b21EeW5hbWljSW1wb3J0IGZyb20gJy4vdXRpbHMvcGx1Z2lucy9jdXN0b20tZHluYW1pYy1pbXBvcnQnO1xuaW1wb3J0IGFkZEhtciBmcm9tICcuL3V0aWxzL3BsdWdpbnMvYWRkLWhtcic7XG5pbXBvcnQgd2F0Y2hSZWJ1aWxkIGZyb20gJy4vdXRpbHMvcGx1Z2lucy93YXRjaC1yZWJ1aWxkJztcbmltcG9ydCBpbmxpbmVWaXRlUHJlbG9hZFNjcmlwdCBmcm9tICcuL3V0aWxzL3BsdWdpbnMvaW5saW5lLXZpdGUtcHJlbG9hZC1zY3JpcHQnO1xuaW1wb3J0IHsgdml0ZVN0YXRpY0NvcHkgfSBmcm9tICd2aXRlLXBsdWdpbi1zdGF0aWMtY29weSc7XG5cbmNvbnN0IHJvb3REaXIgPSByZXNvbHZlKF9fZGlybmFtZSk7XG5jb25zdCBzcmNEaXIgPSByZXNvbHZlKHJvb3REaXIsICdzcmMnKTtcbmNvbnN0IHBhZ2VzRGlyID0gcmVzb2x2ZShzcmNEaXIsICdwYWdlcycpO1xuY29uc3QgYXNzZXRzRGlyID0gcmVzb2x2ZShzcmNEaXIsICdhc3NldHMnKTtcbmNvbnN0IG91dERpciA9IHJlc29sdmUocm9vdERpciwgJ2Rpc3QnKTtcbmNvbnN0IHB1YmxpY0RpciA9IHJlc29sdmUocm9vdERpciwgJ3B1YmxpYycpO1xuXG5jb25zdCBpc0RldiA9IHByb2Nlc3MuZW52Ll9fREVWX18gPT09ICd0cnVlJztcbmNvbnN0IGlzUHJvZHVjdGlvbiA9ICFpc0RldjtcblxuLy8gRU5BQkxFIEhNUiBJTiBCQUNLR1JPVU5EIFNDUklQVFxuY29uc3QgZW5hYmxlSG1ySW5CYWNrZ3JvdW5kU2NyaXB0ID0gdHJ1ZTtcbmNvbnN0IGNhY2hlSW52YWxpZGF0aW9uS2V5UmVmID0geyBjdXJyZW50OiBnZW5lcmF0ZUtleSgpIH07XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0Byb290Jzogcm9vdERpcixcbiAgICAgICdAc3JjJzogc3JjRGlyLFxuICAgICAgJ0Bhc3NldHMnOiBhc3NldHNEaXIsXG4gICAgICAnQHBhZ2VzJzogcGFnZXNEaXIsXG4gICAgICAnbW9uYWNvLWVkaXRvcic6ICdtb25hY28tZWRpdG9yL2VzbS92cy9lZGl0b3IvZWRpdG9yLmFwaS5qcycsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIFZpdGVUb21sKCksXG4gICAgbWFrZU1hbmlmZXN0KHtcbiAgICAgIGdldENhY2hlSW52YWxpZGF0aW9uS2V5LFxuICAgIH0pLFxuICAgIHJlYWN0KCksXG4gICAgY3VzdG9tRHluYW1pY0ltcG9ydCgpLFxuICAgIGFkZEhtcih7IGJhY2tncm91bmQ6IGVuYWJsZUhtckluQmFja2dyb3VuZFNjcmlwdCwgdmlldzogdHJ1ZSB9KSxcbiAgICBpc0RldiAmJiB3YXRjaFJlYnVpbGQoeyBhZnRlcldyaXRlQnVuZGxlOiByZWdlbmVyYXRlQ2FjaGVJbnZhbGlkYXRpb25LZXkgfSksXG4gICAgaW5saW5lVml0ZVByZWxvYWRTY3JpcHQoKSxcbiAgICB2aXRlU3RhdGljQ29weSh7XG4gICAgICB0YXJnZXRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBzcmM6ICdzcmMvYXNzZXRzL2NvbmYvKicsXG4gICAgICAgICAgZGVzdDogJ2Fzc2V0cy9jb25mJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSksXG4gICAgaXNQcm9kdWN0aW9uICYmXG4gICAgICB6aXBQYWNrKHtcbiAgICAgICAgb3V0RGlyLFxuICAgICAgICBvdXRGaWxlTmFtZTogYGV4dGVuc2lvbi12JHtwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9uIHx8ICcxLjAuMCd9LnppcGAsXG4gICAgICB9KSxcbiAgXSxcbiAgcHVibGljRGlyLFxuICBidWlsZDoge1xuICAgIG91dERpcixcbiAgICAvKiogQ2FuIHNsb3cgZG93biBidWlsZCBzcGVlZC4gKi9cbiAgICAvLyBzb3VyY2VtYXA6IGlzRGV2LFxuICAgIG1pbmlmeTogaXNQcm9kdWN0aW9uLFxuICAgIG1vZHVsZVByZWxvYWQ6IGZhbHNlLFxuICAgIHJlcG9ydENvbXByZXNzZWRTaXplOiBpc1Byb2R1Y3Rpb24sXG4gICAgZW1wdHlPdXREaXI6ICFpc0RldixcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICBkZXZ0b29sczogcmVzb2x2ZShwYWdlc0RpciwgJ2RldnRvb2xzJywgJ2luZGV4Lmh0bWwnKSxcbiAgICAgICAgcGFuZWw6IHJlc29sdmUocGFnZXNEaXIsICdwYW5lbCcsICdpbmRleC5odG1sJyksXG4gICAgICAgIGNvbnRlbnRJbmplY3RlZDogcmVzb2x2ZShwYWdlc0RpciwgJ2NvbnRlbnQnLCAnaW5qZWN0ZWQnLCAnaW5kZXgudHMnKSxcbiAgICAgICAgY29udGVudFVJOiByZXNvbHZlKHBhZ2VzRGlyLCAnY29udGVudCcsICd1aScsICdpbmRleC50cycpLFxuICAgICAgICBiYWNrZ3JvdW5kOiByZXNvbHZlKHBhZ2VzRGlyLCAnYmFja2dyb3VuZCcsICdpbmRleC50cycpLFxuICAgICAgICBjb250ZW50U3R5bGU6IHJlc29sdmUocGFnZXNEaXIsICdjb250ZW50JywgJ3N0eWxlLnNjc3MnKSxcbiAgICAgICAgcG9wdXA6IHJlc29sdmUocGFnZXNEaXIsICdwb3B1cCcsICdpbmRleC5odG1sJyksXG4gICAgICAgICd0aG91Z2h0LXByaXNtJzogcmVzb2x2ZShwYWdlc0RpciwgJ3Rob3VnaHQtcHJpc20nLCAnaW5kZXguaHRtbCcpLFxuICAgICAgICBvcHRpb25zOiByZXNvbHZlKHBhZ2VzRGlyLCAnb3B0aW9ucycsICdpbmRleC5odG1sJyksXG4gICAgICAgIHNpZGVwYW5lbDogcmVzb2x2ZShwYWdlc0RpciwgJ3NpZGVwYW5lbCcsICdpbmRleC5odG1sJyksXG4gICAgICB9LFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnc3JjL3BhZ2VzL1tuYW1lXS9pbmRleC5qcycsXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiBpc0RldiA/ICdhc3NldHMvanMvW25hbWVdLmpzJyA6ICdhc3NldHMvanMvW25hbWVdLltoYXNoXS5qcycsXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiBhc3NldEluZm8gPT4ge1xuICAgICAgICAgIGNvbnN0IHsgbmFtZSB9ID0gcGF0aC5wYXJzZShhc3NldEluZm8ubmFtZSk7XG4gICAgICAgICAgY29uc3QgYXNzZXRGaWxlTmFtZSA9IG5hbWUgPT09ICdjb250ZW50U3R5bGUnID8gYCR7bmFtZX0ke2dldENhY2hlSW52YWxpZGF0aW9uS2V5KCl9YCA6IG5hbWU7XG4gICAgICAgICAgcmV0dXJuIGBhc3NldHMvW2V4dF0vJHthc3NldEZpbGVOYW1lfS5jaHVuay5bZXh0XWA7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIGVudmlyb25tZW50OiAnanNkb20nLFxuICAgIGluY2x1ZGU6IFsnKiovKi50ZXN0LnRzJywgJyoqLyoudGVzdC50c3gnXSxcbiAgICBzZXR1cEZpbGVzOiAnLi90ZXN0LXV0aWxzL3ZpdGVzdC5zZXR1cC5qcycsXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6ICdsb2NhbGhvc3QnLCAvLyBvciAnMTI3LjAuMC4xJ1xuICAgIHBvcnQ6IDgwODEsIC8vIHNwZWNpZnkgdGhlIHBvcnRcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWydtb25hY28tZWRpdG9yJ10sXG4gIH0sXG59IGFzIFVzZXJDb25maWcgJiBWaXRlc3RVc2VyQ29uZmlnKTtcbmZ1bmN0aW9uIGdldENhY2hlSW52YWxpZGF0aW9uS2V5KCkge1xuICByZXR1cm4gY2FjaGVJbnZhbGlkYXRpb25LZXlSZWYuY3VycmVudDtcbn1cbmZ1bmN0aW9uIHJlZ2VuZXJhdGVDYWNoZUludmFsaWRhdGlvbktleSgpIHtcbiAgY2FjaGVJbnZhbGlkYXRpb25LZXlSZWYuY3VycmVudCA9IGdlbmVyYXRlS2V5KCk7XG4gIHJldHVybiBjYWNoZUludmFsaWRhdGlvbktleVJlZjtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVLZXkoKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke0RhdGUubm93KCkudG9GaXhlZCgpfWA7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9hZG1pbi9Db2Rlc3BhY2VzL2Fza21hbi1kZXYvYXNrbWFuLWNocm9tZS1leHRlbnNpb24vdXRpbHMvcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FkbWluL0NvZGVzcGFjZXMvYXNrbWFuLWRldi9hc2ttYW4tY2hyb21lLWV4dGVuc2lvbi91dGlscy9wbHVnaW5zL21ha2UtbWFuaWZlc3QudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FkbWluL0NvZGVzcGFjZXMvYXNrbWFuLWRldi9hc2ttYW4tY2hyb21lLWV4dGVuc2lvbi91dGlscy9wbHVnaW5zL21ha2UtbWFuaWZlc3QudHNcIjtpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGNvbG9yTG9nIGZyb20gJy4uL2xvZyc7XG5pbXBvcnQgTWFuaWZlc3RQYXJzZXIgZnJvbSAnLi4vbWFuaWZlc3QtcGFyc2VyJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luT3B0aW9uIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgKiBhcyBwcm9jZXNzIGZyb20gJ3Byb2Nlc3MnO1xuXG5jb25zdCB7IHJlc29sdmUgfSA9IHBhdGg7XG5cbmNvbnN0IHJvb3REaXIgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJy4uJyk7XG5jb25zdCBkaXN0RGlyID0gcmVzb2x2ZShyb290RGlyLCAnZGlzdCcpO1xuY29uc3QgbWFuaWZlc3RGaWxlID0gcmVzb2x2ZShyb290RGlyLCAnbWFuaWZlc3QuanMnKTtcblxuY29uc3QgZ2V0TWFuaWZlc3RXaXRoQ2FjaGVCdXJzdCA9ICgpOiBQcm9taXNlPHsgZGVmYXVsdDogY2hyb21lLnJ1bnRpbWUuTWFuaWZlc3RWMyB9PiA9PiB7XG4gIGNvbnN0IHdpdGhDYWNoZUJ1cnN0ID0gKHBhdGg6IHN0cmluZykgPT4gYCR7cGF0aH0/JHtEYXRlLm5vdygpLnRvU3RyaW5nKCl9YDtcbiAgLyoqXG4gICAqIEluIFdpbmRvd3MsIGltcG9ydCgpIGRvZXNuJ3Qgd29yayB3aXRob3V0IGZpbGU6Ly8gcHJvdG9jb2wuXG4gICAqIFNvLCB3ZSBuZWVkIHRvIGNvbnZlcnQgcGF0aCB0byBmaWxlOi8vIHByb3RvY29sLiAodXJsLnBhdGhUb0ZpbGVVUkwpXG4gICAqL1xuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xuICAgIHJldHVybiBpbXBvcnQod2l0aENhY2hlQnVyc3QodXJsLnBhdGhUb0ZpbGVVUkwobWFuaWZlc3RGaWxlKS5ocmVmKSk7XG4gIH1cbiAgcmV0dXJuIGltcG9ydCh3aXRoQ2FjaGVCdXJzdChtYW5pZmVzdEZpbGUpKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1ha2VNYW5pZmVzdChjb25maWc/OiB7IGdldENhY2hlSW52YWxpZGF0aW9uS2V5PzogKCkgPT4gc3RyaW5nIH0pOiBQbHVnaW5PcHRpb24ge1xuICBmdW5jdGlvbiBtYWtlTWFuaWZlc3QobWFuaWZlc3Q6IGNocm9tZS5ydW50aW1lLk1hbmlmZXN0VjMsIHRvOiBzdHJpbmcsIGNhY2hlS2V5Pzogc3RyaW5nKSB7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHRvKSkge1xuICAgICAgZnMubWtkaXJTeW5jKHRvKTtcbiAgICB9XG4gICAgY29uc3QgbWFuaWZlc3RQYXRoID0gcmVzb2x2ZSh0bywgJ21hbmlmZXN0Lmpzb24nKTtcbiAgICBpZiAoY2FjaGVLZXkpIHtcbiAgICAgIC8vIE5hbWluZyBjaGFuZ2UgZm9yIGNhY2hlIGludmFsaWRhdGlvblxuICAgICAgbWFuaWZlc3QuY29udGVudF9zY3JpcHRzLmZvckVhY2goc2NyaXB0ID0+IHtcbiAgICAgICAgc2NyaXB0LmNzcyAmJj0gc2NyaXB0LmNzcy5tYXAoY3NzID0+IGNzcy5yZXBsYWNlKCc8S0VZPicsIGNhY2hlS2V5KSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmcy53cml0ZUZpbGVTeW5jKG1hbmlmZXN0UGF0aCwgTWFuaWZlc3RQYXJzZXIuY29udmVydE1hbmlmZXN0VG9TdHJpbmcobWFuaWZlc3QpKTtcblxuICAgIGNvbG9yTG9nKGBNYW5pZmVzdCBmaWxlIGNvcHkgY29tcGxldGU6ICR7bWFuaWZlc3RQYXRofWAsICdzdWNjZXNzJyk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdtYWtlLW1hbmlmZXN0JyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgdGhpcy5hZGRXYXRjaEZpbGUobWFuaWZlc3RGaWxlKTtcbiAgICB9LFxuICAgIGFzeW5jIHdyaXRlQnVuZGxlKCkge1xuICAgICAgY29uc3QgaW52YWxpZGF0aW9uS2V5ID0gY29uZmlnLmdldENhY2hlSW52YWxpZGF0aW9uS2V5Py4oKTtcbiAgICAgIGNvbnN0IG1hbmlmZXN0ID0gYXdhaXQgZ2V0TWFuaWZlc3RXaXRoQ2FjaGVCdXJzdCgpO1xuICAgICAgbWFrZU1hbmlmZXN0KG1hbmlmZXN0LmRlZmF1bHQsIGRpc3REaXIsIGludmFsaWRhdGlvbktleSk7XG4gICAgfSxcbiAgfTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2FkbWluL0NvZGVzcGFjZXMvYXNrbWFuLWRldi9hc2ttYW4tY2hyb21lLWV4dGVuc2lvbi91dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FkbWluL0NvZGVzcGFjZXMvYXNrbWFuLWRldi9hc2ttYW4tY2hyb21lLWV4dGVuc2lvbi91dGlscy9sb2cudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FkbWluL0NvZGVzcGFjZXMvYXNrbWFuLWRldi9hc2ttYW4tY2hyb21lLWV4dGVuc2lvbi91dGlscy9sb2cudHNcIjt0eXBlIENvbG9yVHlwZSA9ICdzdWNjZXNzJyB8ICdpbmZvJyB8ICdlcnJvcicgfCAnd2FybmluZycgfCBrZXlvZiB0eXBlb2YgQ09MT1JTO1xudHlwZSBWYWx1ZU9mPFQ+ID0gVFtrZXlvZiBUXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29sb3JMb2cobWVzc2FnZTogc3RyaW5nLCB0eXBlOiBDb2xvclR5cGUpIHtcbiAgbGV0IGNvbG9yOiBWYWx1ZU9mPHR5cGVvZiBDT0xPUlM+O1xuXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3N1Y2Nlc3MnOlxuICAgICAgY29sb3IgPSBDT0xPUlMuRmdHcmVlbjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2luZm8nOlxuICAgICAgY29sb3IgPSBDT0xPUlMuRmdCbHVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZXJyb3InOlxuICAgICAgY29sb3IgPSBDT0xPUlMuRmdSZWQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgIGNvbG9yID0gQ09MT1JTLkZnWWVsbG93O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbG9yID0gQ09MT1JTW3R5cGVdO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICBjb25zb2xlLmxvZyhjb2xvciwgbWVzc2FnZSk7XG59XG5cbmNvbnN0IENPTE9SUyA9IHtcbiAgUmVzZXQ6ICdcXHgxYlswbScsXG4gIEJyaWdodDogJ1xceDFiWzFtJyxcbiAgRGltOiAnXFx4MWJbMm0nLFxuICBVbmRlcnNjb3JlOiAnXFx4MWJbNG0nLFxuICBCbGluazogJ1xceDFiWzVtJyxcbiAgUmV2ZXJzZTogJ1xceDFiWzdtJyxcbiAgSGlkZGVuOiAnXFx4MWJbOG0nLFxuICBGZ0JsYWNrOiAnXFx4MWJbMzBtJyxcbiAgRmdSZWQ6ICdcXHgxYlszMW0nLFxuICBGZ0dyZWVuOiAnXFx4MWJbMzJtJyxcbiAgRmdZZWxsb3c6ICdcXHgxYlszM20nLFxuICBGZ0JsdWU6ICdcXHgxYlszNG0nLFxuICBGZ01hZ2VudGE6ICdcXHgxYlszNW0nLFxuICBGZ0N5YW46ICdcXHgxYlszNm0nLFxuICBGZ1doaXRlOiAnXFx4MWJbMzdtJyxcbiAgQmdCbGFjazogJ1xceDFiWzQwbScsXG4gIEJnUmVkOiAnXFx4MWJbNDFtJyxcbiAgQmdHcmVlbjogJ1xceDFiWzQybScsXG4gIEJnWWVsbG93OiAnXFx4MWJbNDNtJyxcbiAgQmdCbHVlOiAnXFx4MWJbNDRtJyxcbiAgQmdNYWdlbnRhOiAnXFx4MWJbNDVtJyxcbiAgQmdDeWFuOiAnXFx4MWJbNDZtJyxcbiAgQmdXaGl0ZTogJ1xceDFiWzQ3bScsXG59IGFzIGNvbnN0O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWRtaW4vQ29kZXNwYWNlcy9hc2ttYW4tZGV2L2Fza21hbi1jaHJvbWUtZXh0ZW5zaW9uL3V0aWxzL21hbmlmZXN0LXBhcnNlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FkbWluL0NvZGVzcGFjZXMvYXNrbWFuLWRldi9hc2ttYW4tY2hyb21lLWV4dGVuc2lvbi91dGlscy9tYW5pZmVzdC1wYXJzZXIvaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FkbWluL0NvZGVzcGFjZXMvYXNrbWFuLWRldi9hc2ttYW4tY2hyb21lLWV4dGVuc2lvbi91dGlscy9tYW5pZmVzdC1wYXJzZXIvaW5kZXgudHNcIjt0eXBlIE1hbmlmZXN0ID0gY2hyb21lLnJ1bnRpbWUuTWFuaWZlc3RWMztcblxuY2xhc3MgTWFuaWZlc3RQYXJzZXIge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LWZ1bmN0aW9uXG4gIHByaXZhdGUgY29uc3RydWN0b3IoKSB7fVxuXG4gIHN0YXRpYyBjb252ZXJ0TWFuaWZlc3RUb1N0cmluZyhtYW5pZmVzdDogTWFuaWZlc3QpOiBzdHJpbmcge1xuICAgIGlmIChwcm9jZXNzLmVudi5fX0ZJUkVGT1hfXykge1xuICAgICAgbWFuaWZlc3QgPSB0aGlzLmNvbnZlcnRUb0ZpcmVmb3hDb21wYXRpYmxlTWFuaWZlc3QobWFuaWZlc3QpO1xuICAgIH1cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkobWFuaWZlc3QsIG51bGwsIDIpO1xuICB9XG5cbiAgc3RhdGljIGNvbnZlcnRUb0ZpcmVmb3hDb21wYXRpYmxlTWFuaWZlc3QobWFuaWZlc3Q6IE1hbmlmZXN0KSB7XG4gICAgY29uc3QgbWFuaWZlc3RDb3B5ID0ge1xuICAgICAgLi4ubWFuaWZlc3QsXG4gICAgfSBhcyB7IFtrZXk6IHN0cmluZ106IHVua25vd24gfTtcblxuICAgIG1hbmlmZXN0Q29weS5iYWNrZ3JvdW5kID0ge1xuICAgICAgc2NyaXB0czogW21hbmlmZXN0LmJhY2tncm91bmQ/LnNlcnZpY2Vfd29ya2VyXSxcbiAgICAgIHR5cGU6ICdtb2R1bGUnLFxuICAgIH07XG4gICAgbWFuaWZlc3RDb3B5Lm9wdGlvbnNfdWkgPSB7XG4gICAgICBwYWdlOiBtYW5pZmVzdC5vcHRpb25zX3BhZ2UsXG4gICAgICBicm93c2VyX3N0eWxlOiBmYWxzZSxcbiAgICB9O1xuICAgIG1hbmlmZXN0Q29weS5jb250ZW50X3NlY3VyaXR5X3BvbGljeSA9IHtcbiAgICAgIGV4dGVuc2lvbl9wYWdlczogXCJzY3JpcHQtc3JjICdzZWxmJzsgb2JqZWN0LXNyYyAnc2VsZicgJ3dhc20tdW5zYWZlLWV2YWwnXCIsXG4gICAgfTtcbiAgICBkZWxldGUgbWFuaWZlc3RDb3B5Lm9wdGlvbnNfcGFnZTtcbiAgICByZXR1cm4gbWFuaWZlc3RDb3B5IGFzIE1hbmlmZXN0O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1hbmlmZXN0UGFyc2VyO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWRtaW4vQ29kZXNwYWNlcy9hc2ttYW4tZGV2L2Fza21hbi1jaHJvbWUtZXh0ZW5zaW9uL3V0aWxzL3BsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9hZG1pbi9Db2Rlc3BhY2VzL2Fza21hbi1kZXYvYXNrbWFuLWNocm9tZS1leHRlbnNpb24vdXRpbHMvcGx1Z2lucy9jdXN0b20tZHluYW1pYy1pbXBvcnQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FkbWluL0NvZGVzcGFjZXMvYXNrbWFuLWRldi9hc2ttYW4tY2hyb21lLWV4dGVuc2lvbi91dGlscy9wbHVnaW5zL2N1c3RvbS1keW5hbWljLWltcG9ydC50c1wiO2ltcG9ydCB0eXBlIHsgUGx1Z2luT3B0aW9uIH0gZnJvbSAndml0ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGN1c3RvbUR5bmFtaWNJbXBvcnQoKTogUGx1Z2luT3B0aW9uIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY3VzdG9tLWR5bmFtaWMtaW1wb3J0JyxcbiAgICByZW5kZXJEeW5hbWljSW1wb3J0KHsgbW9kdWxlSWQgfSkge1xuICAgICAgaWYgKCFtb2R1bGVJZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykgJiYgcHJvY2Vzcy5lbnYuX19GSVJFRk9YX18pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsZWZ0OiBgXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgZHluYW1pY0ltcG9ydCA9IChwYXRoKSA9PiBpbXBvcnQocGF0aCk7XG4gICAgICAgICAgICBkeW5hbWljSW1wb3J0KGJyb3dzZXIucnVudGltZS5nZXRVUkwoJy4vJykgKyBcbiAgICAgICAgICAgIGAsXG4gICAgICAgICAgcmlnaHQ6IFwiLnNwbGl0KCcuLi8nKS5qb2luKCcnKSl9XCIsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAnaW1wb3J0KCcsXG4gICAgICAgIHJpZ2h0OiAnKScsXG4gICAgICB9O1xuICAgIH0sXG4gIH07XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9hZG1pbi9Db2Rlc3BhY2VzL2Fza21hbi1kZXYvYXNrbWFuLWNocm9tZS1leHRlbnNpb24vdXRpbHMvcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FkbWluL0NvZGVzcGFjZXMvYXNrbWFuLWRldi9hc2ttYW4tY2hyb21lLWV4dGVuc2lvbi91dGlscy9wbHVnaW5zL2FkZC1obXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FkbWluL0NvZGVzcGFjZXMvYXNrbWFuLWRldi9hc2ttYW4tY2hyb21lLWV4dGVuc2lvbi91dGlscy9wbHVnaW5zL2FkZC1obXIudHNcIjtpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5PcHRpb24gfSBmcm9tICd2aXRlJztcblxuY29uc3QgaXNEZXYgPSBwcm9jZXNzLmVudi5fX0RFVl9fID09PSAndHJ1ZSc7XG5cbmNvbnN0IERVTU1ZX0NPREUgPSBgZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKXt9O2A7XG5cbmZ1bmN0aW9uIGdldEluamVjdGlvbkNvZGUoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiByZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJ3JlbG9hZCcsICdpbmplY3Rpb25zJywgZmlsZU5hbWUpLCB7IGVuY29kaW5nOiAndXRmOCcgfSk7XG59XG5cbnR5cGUgQ29uZmlnID0ge1xuICBiYWNrZ3JvdW5kPzogYm9vbGVhbjtcbiAgdmlldz86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhZGRIbXIoY29uZmlnPzogQ29uZmlnKTogUGx1Z2luT3B0aW9uIHtcbiAgY29uc3QgeyBiYWNrZ3JvdW5kID0gZmFsc2UsIHZpZXcgPSB0cnVlIH0gPSBjb25maWcgfHwge307XG4gIGNvbnN0IGlkSW5CYWNrZ3JvdW5kU2NyaXB0ID0gJ3ZpcnR1YWw6cmVsb2FkLW9uLXVwZGF0ZS1pbi1iYWNrZ3JvdW5kLXNjcmlwdCc7XG4gIGNvbnN0IGlkSW5WaWV3ID0gJ3ZpcnR1YWw6cmVsb2FkLW9uLXVwZGF0ZS1pbi12aWV3JztcblxuICBjb25zdCBzY3JpcHRIbXJDb2RlID0gaXNEZXYgPyBnZXRJbmplY3Rpb25Db2RlKCdzY3JpcHQuanMnKSA6IERVTU1ZX0NPREU7XG4gIGNvbnN0IHZpZXdIbXJDb2RlID0gaXNEZXYgPyBnZXRJbmplY3Rpb25Db2RlKCd2aWV3LmpzJykgOiBEVU1NWV9DT0RFO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2FkZC1obXInLFxuICAgIHJlc29sdmVJZChpZCkge1xuICAgICAgaWYgKGlkID09PSBpZEluQmFja2dyb3VuZFNjcmlwdCB8fCBpZCA9PT0gaWRJblZpZXcpIHtcbiAgICAgICAgcmV0dXJuIGdldFJlc29sdmVkSWQoaWQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbG9hZChpZCkge1xuICAgICAgaWYgKGlkID09PSBnZXRSZXNvbHZlZElkKGlkSW5CYWNrZ3JvdW5kU2NyaXB0KSkge1xuICAgICAgICByZXR1cm4gYmFja2dyb3VuZCA/IHNjcmlwdEhtckNvZGUgOiBEVU1NWV9DT0RFO1xuICAgICAgfVxuXG4gICAgICBpZiAoaWQgPT09IGdldFJlc29sdmVkSWQoaWRJblZpZXcpKSB7XG4gICAgICAgIHJldHVybiB2aWV3ID8gdmlld0htckNvZGUgOiBEVU1NWV9DT0RFO1xuICAgICAgfVxuICAgIH0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFJlc29sdmVkSWQoaWQ6IHN0cmluZykge1xuICByZXR1cm4gJ1xcMCcgKyBpZDtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2FkbWluL0NvZGVzcGFjZXMvYXNrbWFuLWRldi9hc2ttYW4tY2hyb21lLWV4dGVuc2lvbi91dGlscy9wbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYWRtaW4vQ29kZXNwYWNlcy9hc2ttYW4tZGV2L2Fza21hbi1jaHJvbWUtZXh0ZW5zaW9uL3V0aWxzL3BsdWdpbnMvd2F0Y2gtcmVidWlsZC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYWRtaW4vQ29kZXNwYWNlcy9hc2ttYW4tZGV2L2Fza21hbi1jaHJvbWUtZXh0ZW5zaW9uL3V0aWxzL3BsdWdpbnMvd2F0Y2gtcmVidWlsZC50c1wiO2ltcG9ydCB0eXBlIHsgUGx1Z2luT3B0aW9uIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBXZWJTb2NrZXQgfSBmcm9tICd3cyc7XG5pbXBvcnQgTWVzc2FnZUludGVycHJldGVyIGZyb20gJy4uL3JlbG9hZC9pbnRlcnByZXRlcic7XG5pbXBvcnQgeyBMT0NBTF9SRUxPQURfU09DS0VUX1VSTCB9IGZyb20gJy4uL3JlbG9hZC9jb25zdGFudCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHdhdGNoUmVidWlsZChjb25maWc6IHsgYWZ0ZXJXcml0ZUJ1bmRsZTogKCkgPT4gdm9pZCB9KTogUGx1Z2luT3B0aW9uIHtcbiAgY29uc3Qgd3MgPSBuZXcgV2ViU29ja2V0KExPQ0FMX1JFTE9BRF9TT0NLRVRfVVJMKTtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnd2F0Y2gtcmVidWlsZCcsXG4gICAgd3JpdGVCdW5kbGUoKSB7XG4gICAgICAvKipcbiAgICAgICAqIFdoZW4gdGhlIGJ1aWxkIGlzIGNvbXBsZXRlLCBzZW5kIGEgbWVzc2FnZSB0byB0aGUgcmVsb2FkIHNlcnZlci5cbiAgICAgICAqIFRoZSByZWxvYWQgc2VydmVyIHdpbGwgc2VuZCBhIG1lc3NhZ2UgdG8gdGhlIGNsaWVudCB0byByZWxvYWQgb3IgcmVmcmVzaCB0aGUgZXh0ZW5zaW9uLlxuICAgICAgICovXG4gICAgICB3cy5zZW5kKE1lc3NhZ2VJbnRlcnByZXRlci5zZW5kKHsgdHlwZTogJ2J1aWxkX2NvbXBsZXRlJyB9KSk7XG5cbiAgICAgIHNlbmROZXh0UXVldWUoKCkgPT4ge1xuICAgICAgICBjb25maWcuYWZ0ZXJXcml0ZUJ1bmRsZSgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2VuZE5leHRRdWV1ZShjYWxsYmFjazogKCkgPT4gdm9pZCkge1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBjYWxsYmFjaygpO1xuICB9LCAwKTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2FkbWluL0NvZGVzcGFjZXMvYXNrbWFuLWRldi9hc2ttYW4tY2hyb21lLWV4dGVuc2lvbi91dGlscy9yZWxvYWQvaW50ZXJwcmV0ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9hZG1pbi9Db2Rlc3BhY2VzL2Fza21hbi1kZXYvYXNrbWFuLWNocm9tZS1leHRlbnNpb24vdXRpbHMvcmVsb2FkL2ludGVycHJldGVyL2luZGV4LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9hZG1pbi9Db2Rlc3BhY2VzL2Fza21hbi1kZXYvYXNrbWFuLWNocm9tZS1leHRlbnNpb24vdXRpbHMvcmVsb2FkL2ludGVycHJldGVyL2luZGV4LnRzXCI7aW1wb3J0IHR5cGUgeyBXZWJTb2NrZXRNZXNzYWdlLCBTZXJpYWxpemVkTWVzc2FnZSB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZXNzYWdlSW50ZXJwcmV0ZXIge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LWZ1bmN0aW9uXG4gIHByaXZhdGUgY29uc3RydWN0b3IoKSB7fVxuXG4gIHN0YXRpYyBzZW5kKG1lc3NhZ2U6IFdlYlNvY2tldE1lc3NhZ2UpOiBTZXJpYWxpemVkTWVzc2FnZSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuICB9XG4gIHN0YXRpYyByZWNlaXZlKHNlcmlhbGl6ZWRNZXNzYWdlOiBTZXJpYWxpemVkTWVzc2FnZSk6IFdlYlNvY2tldE1lc3NhZ2Uge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHNlcmlhbGl6ZWRNZXNzYWdlKTtcbiAgfVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWRtaW4vQ29kZXNwYWNlcy9hc2ttYW4tZGV2L2Fza21hbi1jaHJvbWUtZXh0ZW5zaW9uL3V0aWxzL3JlbG9hZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FkbWluL0NvZGVzcGFjZXMvYXNrbWFuLWRldi9hc2ttYW4tY2hyb21lLWV4dGVuc2lvbi91dGlscy9yZWxvYWQvY29uc3RhbnQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FkbWluL0NvZGVzcGFjZXMvYXNrbWFuLWRldi9hc2ttYW4tY2hyb21lLWV4dGVuc2lvbi91dGlscy9yZWxvYWQvY29uc3RhbnQudHNcIjtleHBvcnQgY29uc3QgTE9DQUxfUkVMT0FEX1NPQ0tFVF9QT1JUID0gODA4MTtcbmV4cG9ydCBjb25zdCBMT0NBTF9SRUxPQURfU09DS0VUX1VSTCA9IGB3czovL2xvY2FsaG9zdDoke0xPQ0FMX1JFTE9BRF9TT0NLRVRfUE9SVH1gO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWRtaW4vQ29kZXNwYWNlcy9hc2ttYW4tZGV2L2Fza21hbi1jaHJvbWUtZXh0ZW5zaW9uL3V0aWxzL3BsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9hZG1pbi9Db2Rlc3BhY2VzL2Fza21hbi1kZXYvYXNrbWFuLWNocm9tZS1leHRlbnNpb24vdXRpbHMvcGx1Z2lucy9pbmxpbmUtdml0ZS1wcmVsb2FkLXNjcmlwdC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYWRtaW4vQ29kZXNwYWNlcy9hc2ttYW4tZGV2L2Fza21hbi1jaHJvbWUtZXh0ZW5zaW9uL3V0aWxzL3BsdWdpbnMvaW5saW5lLXZpdGUtcHJlbG9hZC1zY3JpcHQudHNcIjsvKipcbiAqIHNvbHV0aW9uIGZvciBtdWx0aXBsZSBjb250ZW50IHNjcmlwdHNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2ttYW4tZGV2L2Fza21hbi1jaHJvbWUtZXh0ZW5zaW9uL2lzc3Vlcy8xNzcjaXNzdWVjb21tZW50LTE3ODQxMTI1MzZcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5saW5lVml0ZVByZWxvYWRTY3JpcHQoKSB7XG4gIGxldCBfX3ZpdGVQcmVsb2FkID0gJyc7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3JlcGxhY2Utdml0ZS1wcmVsb2FkLXNjcmlwdC1wbHVnaW4nLFxuICAgIGFzeW5jIHJlbmRlckNodW5rKGNvZGUsIGNodW5rLCBvcHRpb25zLCBtZXRhKSB7XG4gICAgICBpZiAoIS9jb250ZW50Ly50ZXN0KGNodW5rLmZpbGVOYW1lKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICghX192aXRlUHJlbG9hZCkge1xuICAgICAgICBjb25zdCBjaHVua05hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IE9iamVjdC5rZXlzKG1ldGEuY2h1bmtzKS5maW5kKGtleSA9PiAvcHJlbG9hZC8udGVzdChrZXkpKTtcbiAgICAgICAgY29uc3QgbW9kdWxlcyA9IG1ldGEuY2h1bmtzPy5bY2h1bmtOYW1lXT8ubW9kdWxlcztcbiAgICAgICAgX192aXRlUHJlbG9hZCA9IG1vZHVsZXM/LltPYmplY3Qua2V5cyhtb2R1bGVzKT8uWzBdXT8uY29kZTtcbiAgICAgICAgX192aXRlUHJlbG9hZCA9IF9fdml0ZVByZWxvYWQ/LnJlcGxhY2VBbGwoJ2NvbnN0ICcsICd2YXIgJyk7XG4gICAgICAgIF9fdml0ZVByZWxvYWQgPSBfX3ZpdGVQcmVsb2FkPy5yZXBsYWNlQWxsKCdhc3NldHNVUkwoZGVwKScsICdjaHJvbWUucnVudGltZS5nZXRVUkwoZGVwKScpO1xuXG4gICAgICAgIGlmICghX192aXRlUHJlbG9hZCkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb2RlOiBfX3ZpdGVQcmVsb2FkICsgY29kZS5zcGxpdChgXFxuYCkuc2xpY2UoMSkuam9pbihgXFxuYCksXG4gICAgICB9O1xuICAgIH0sXG4gIH07XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxvQkFBZ0M7QUFFekMsT0FBTyxhQUFhO0FBQ3BCLFNBQVMsZ0JBQWdCO0FBQ3pCLE9BQU8sV0FBVztBQUNsQixPQUFPQSxTQUFRLFdBQUFDLGdCQUFlOzs7QUNOZ1gsWUFBWSxRQUFRO0FBQ2xhLFlBQVksVUFBVTs7O0FDRVAsU0FBUixTQUEwQixTQUFpQixNQUFpQjtBQUNqRSxNQUFJO0FBRUosVUFBUSxNQUFNO0FBQUEsSUFDWixLQUFLO0FBQ0gsY0FBUSxPQUFPO0FBQ2Y7QUFBQSxJQUNGLEtBQUs7QUFDSCxjQUFRLE9BQU87QUFDZjtBQUFBLElBQ0YsS0FBSztBQUNILGNBQVEsT0FBTztBQUNmO0FBQUEsSUFDRixLQUFLO0FBQ0gsY0FBUSxPQUFPO0FBQ2Y7QUFBQSxJQUNGO0FBQ0UsY0FBUSxPQUFPLElBQUk7QUFDbkI7QUFBQSxFQUNKO0FBRUEsVUFBUSxJQUFJLE9BQU8sT0FBTztBQUM1QjtBQUVBLElBQU0sU0FBUztBQUFBLEVBQ2IsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsS0FBSztBQUFBLEVBQ0wsWUFBWTtBQUFBLEVBQ1osT0FBTztBQUFBLEVBQ1AsU0FBUztBQUFBLEVBQ1QsUUFBUTtBQUFBLEVBQ1IsU0FBUztBQUFBLEVBQ1QsT0FBTztBQUFBLEVBQ1AsU0FBUztBQUFBLEVBQ1QsVUFBVTtBQUFBLEVBQ1YsUUFBUTtBQUFBLEVBQ1IsV0FBVztBQUFBLEVBQ1gsUUFBUTtBQUFBLEVBQ1IsU0FBUztBQUFBLEVBQ1QsU0FBUztBQUFBLEVBQ1QsT0FBTztBQUFBLEVBQ1AsU0FBUztBQUFBLEVBQ1QsVUFBVTtBQUFBLEVBQ1YsUUFBUTtBQUFBLEVBQ1IsV0FBVztBQUFBLEVBQ1gsUUFBUTtBQUFBLEVBQ1IsU0FBUztBQUNY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LGFBQWE7QUFBQSxJQUNiLFNBQVMsQ0FBQyxnQkFBZ0IsZUFBZTtBQUFBLElBQ3pDLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBLEVBQ1I7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxlQUFlO0FBQUEsRUFDM0I7QUFDRixDQUFrQztBQUNsQyxTQUFTLDBCQUEwQjtBQUNqQyxTQUFPLHdCQUF3QjtBQUNqQztBQUNBLFNBQVMsaUNBQWlDO0FBQ3hDLDBCQUF3QixVQUFVLFlBQVk7QUFDOUMsU0FBTztBQUNUO0FBRUEsU0FBUyxjQUFzQjtBQUM3QixTQUFPLEdBQUcsS0FBSyxJQUFJLEVBQUUsUUFBUSxDQUFDO0FBQ2hDOyIsCiAgIm5hbWVzIjogWyJwYXRoIiwgInJlc29sdmUiLCAicHJvY2VzcyIsICJwYXRoIiwgIm1ha2VNYW5pZmVzdCIsICJwYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lIiwgInJvb3REaXIiLCAicmVzb2x2ZSIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSIsICJpc0RldiIsICJwYXRoIl0KfQo=
