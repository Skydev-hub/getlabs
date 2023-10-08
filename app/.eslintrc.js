module.exports = {
  root: true,
  overrides: [{
    files: ['*.ts'],
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint/eslint-plugin',
      '@angular-eslint/eslint-plugin',
      '@nrwl/eslint-plugin-nx'
    ],
    extends: [
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier'
    ],
    env: {
      node: true,
      jest: true
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@angular-eslint/directive-selector': ['error', {
        'type': 'attribute',
        'prefix': 'app',
        'style': 'camelCase'
      }],
      '@angular-eslint/component-selector': ['error', {
        'type': 'element',
        'prefix': 'app',
        'style': 'kebab-case'
      }],
      '@angular-eslint/no-conflicting-lifecycle': 'error',
      '@angular-eslint/no-host-metadata-property': 'off',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-inputs-metadata-property': 'off',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/no-outputs-metadata-property': 'off',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',
      '@angular-eslint/component-class-suffix': 'error',
      '@angular-eslint/directive-class-suffix': 'error',
      '@nrwl/nx/enforce-module-boundaries': ['error', {
        "allow": [],
        "depConstraints": [
          {
            "sourceTag": "*",
            "onlyDependOnLibsWithTags": ["*"]
          }
        ]
      }]
    }
  }, {
    'files': ['*.html'],
    'parser': '@angular-eslint/template-parser',
    'plugins': ['@angular-eslint/template'],
    'extends': ["plugin:@angular-eslint/template/recommended"],
    'rules': {
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-negated-async': 'error'
    }
  }]
};
