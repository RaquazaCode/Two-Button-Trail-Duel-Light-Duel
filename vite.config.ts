import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, ".worktrees/**"],
  },
});
