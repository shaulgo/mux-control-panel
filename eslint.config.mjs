import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Top-level ignore block so ESLint skips generated/build artifacts
  {
    ignores: [
      "**/node_modules/**",
      ".next/**",
      ".next/**/**",
      ".next/types/**",
      "coverage/**",
      "test-results/**",
      ".playwright/**",
      "dist/**",
      "build/**"
    ]
  },

  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Project rules
  {
    rules: {
      // React specific rules
      "react-hooks/exhaustive-deps": "error",
      "react/jsx-key": "error",
      "react/no-unescaped-entities": "off",

      // General rules
      "prefer-const": "error",
      "no-var": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "eqeqeq": ["error", "always"]
    }
  }
];

export default eslintConfig;
