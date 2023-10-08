module.exports = {
  overrides: [{
    files: ['*.ts'],
    parserOptions: {
      project: 'libs/idle/tsconfig.eslint*+.json',
      sourceType: 'module'
    }
  }]
};
