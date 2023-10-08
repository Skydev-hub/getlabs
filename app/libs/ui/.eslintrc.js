module.exports = {
  overrides: [{
    files: ['*.ts'],
    parserOptions: {
      project: ['libs/ui/tsconfig.lib*+.json', 'libs/ui/tsconfig.spec*+.json'],
      sourceType: 'module'
    }
  }]
};
