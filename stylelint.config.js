export default {
  extends: ['stylelint-config-standard', 'stylelint-config-standard-vue'],
  ignoreFiles: [
    '**/dist/**',
    '**/coverage/**',
    '**/.vitepress/cache/**',
    '**/.vitepress/dist/**',
  ],
  overrides: [
    {
      // Custom properties are the library's public theming API, so they share a namespace
      files: ['packages/vue/**/*.{css,vue}'],
      rules: {
        'custom-property-pattern': [
          '^paperpic-[a-z0-9]+(-[a-z0-9]+)*$',
          {
            message: name => `Expected custom property "${name}" to be "--paperpic-*" in kebab-case`,
          },
        ],
      },
    },
  ],
}
