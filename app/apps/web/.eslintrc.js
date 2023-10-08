module.exports = {
  overrides: [{
    files: ['*.ts'],
    parserOptions: {
      project: 'apps/web/tsconfig.eslint*+.json',
      sourceType: 'module'
    }
  }]
};
