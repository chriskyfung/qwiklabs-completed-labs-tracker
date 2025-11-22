import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

export default [
    // Global ignores
    {
        ignores: [
            "**/.DS_Store",
            "**/node_modules/**",
            "**/dist/**",
            "**/package-lock.json",
            "**/coverage/**",
            "!**/.*.js",
        ],
    },

    // Base configuration for all JS files
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.greasemonkey,
            },
        },
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

    // Configuration for the main UserScript file
    {
        files: ["qwiklabs-explorer.user.js"],
        languageOptions: {
            globals: {
                Dexie: "readonly",
                process: "readonly",
            },
        },
    },

    // Configuration for test files
    {
        files: ["__tests__/**/*.js", "vitest.setup.js"],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.vitest,
            },
        },
    },

    // Prettier config to disable conflicting rules
    prettierConfig,
];