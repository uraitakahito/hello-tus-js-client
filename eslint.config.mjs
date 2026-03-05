import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.mjs"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    files: ["*.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },

  {
    ignores: ["dist/", "node_modules/"],
  },
);
