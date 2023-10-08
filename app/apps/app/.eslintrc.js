module.exports = {
  overrides: [{
    files: ['*.ts'],
    parserOptions: {
      project: 'apps/app/tsconfig.eslint*+.json',
      sourceType: 'module'
    }
  }, {
    files: ['*.html'],
    parserOptions: {
      project: 'apps/app/tsconfig.eslint*+.json',
      sourceType: 'module'
    }
  }]
};
