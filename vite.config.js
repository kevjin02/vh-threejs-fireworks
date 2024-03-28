import glsl from "vite-plugin-glsl";

export default {
  base: "./",
  root: "src/",
  publicDir: "../public/",
  server: {
    host: true,
  },
  plugins: [glsl()],
};
