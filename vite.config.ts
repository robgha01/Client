import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/my-dropdown-editor.element.ts", // your web component source file
            formats: ["es"],
        },
        outDir: "../../wwwroot/App_Plugins/Client", // Updated path
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/], // ignore the Umbraco Backoffice package in the build
        },
    },
    base: "/App_Plugins/Client/", // the base path of the app in the browser (used for assets)
});