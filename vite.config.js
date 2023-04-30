import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import inject from "@rollup/plugin-inject";
import { resolve } from "path"; // 主要用于alias文件路径别名
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    inject({
      $: "jquery", // 这里会自动载入 node_modules 中的 jquery
      jQuery: "jquery",
      "windows.jQuery": "jquery",
    }),
  ],
  /**
   * 在生产中服务时的基本公共路径。
   * @default '/'
   */
  base: "./",

  //  构建
  build: {
    outDir: "dist", //指定打包输出路径
    assetsDir: "assets", //指定静态资源存放路径
    cssCodeSplit: true, //css代码拆分,禁用则所有样式保存在一个css里面
    sourcemap: false, //是否构建source map 文件

    // 生产环境取消 console
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    //会打包出 css js 等文件夹 目录显得清晰
    rollupOptions: {
      output: {
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: "[ext]/[name]-[hash].[ext]",
      },
    },
  },

  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },

  // 别名
  resolve: {
    alias: {
      "@": resolve(__dirname, ".", "src"),
      components: resolve(__dirname, ".", "src/components"),
      pages: resolve(__dirname, ".", "src/pages"),
      assets: resolve(__dirname, ".", "src/assets"),
      services: resolve(__dirname, ".", "src/services"),
    },
  },

  // 本地服务
  server: {
    host: "0.0.0.0", // ip
    port: 8080, // 端口号
    open: false, // 是否自动在浏览器打开
    https: false, // 是否开启 https
  },
});
