module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'rules': {
    "ignoreUrls": true,
    "ignoreStrings": true,
    "ignoreTemplateLiterals": true,
    "ignoreRegExpLiterals": true,
  },
};
