import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",

  external: ["playcanvas"],

  plugins: [nodeResolve(), typescript()],

  output: {
    sourcemap: false,
    file: "build/umd/playcanvas-datgui.js",
    format: "umd",
    extend: true,
    name: "pc",
    globals: {
      playcanvas: "pc",
      "dat.gui": "dat",
    },
  },
};
