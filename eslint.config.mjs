import { defineConfig, globalIgnores } from "eslint/config";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

// To get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
            ecmaVersion: 12,
            sourceType: "module",
            parserOptions: {},
        },

        extends: compat.extends("prettier"),

        plugins: {
            jsdoc,
        },

        rules: {
            "jsdoc/check-alignment": "warn",
            "jsdoc/check-param-names": "error",
            "max-len": [
                "warn",
                {
                    code: 120,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                    ignoreRegExpLiterals: true,
                },
            ],
        },
    },
    globalIgnores([
        "**/.DS_Store",
        "**/node_modules/*",
        "**/dist/*",
        "**/package-lock.json",
        "!**/.*.js",
    ]),
]);
