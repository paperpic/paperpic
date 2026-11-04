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
      // Custom properties and classes are public and global, so they share a namespace
      files: ['packages/{core,vue}/**/*.{css,vue}'],
      rules: {
        'custom-property-pattern': [
          '^paperpic-[a-z0-9]+(-[a-z0-9]+)*$',
          {
            message: name => `Expected custom property "${name}" to be "--paperpic-*" in kebab-case`,
          },
        ],
        'selector-class-pattern': [
          '^paperpic(-[a-z0-9]+)*$',
          {
            message: name => `Expected class "${name}" to be "paperpic" or "paperpic-*" in kebab-case`,
          },
        ],
      },
    },
  ],
}
