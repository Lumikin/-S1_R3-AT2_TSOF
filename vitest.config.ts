import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8", // ou 'istanbul'
      reporter: ["text", "json", "html"],

      // Força a geração do relatório mesmo se algum teste falhar
      reportOnFailure: true,
    },
  },
});
