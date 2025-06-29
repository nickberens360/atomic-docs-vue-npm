// src/utils/prism-vue.js
import Prism from 'prismjs';

// Define Vue as a language that extends markup, javascript, and css
Prism.languages.vue = {
  // Vue template syntax
  'template-tag': {
    pattern: /<template[\s\S]*?>|<\/template>/,
    alias: 'markup'
  },
  'script-tag': {
    pattern: /<script[\s\S]*?>|<\/script>/,
    alias: 'javascript'
  },
  'style-tag': {
    pattern: /<style[\s\S]*?>|<\/style>/,
    alias: 'css'
  },
  // Vue directives
  'directive': {
    pattern: /v-[\w-]+(?=[\s=])/,
    alias: 'keyword'
  },
  // Vue component tags
  'component-tag': {
    pattern: /<[A-Z]\w*(?:\s+[^>]*)?>/,
    inside: Prism.languages.markup.tag
  },
  // Vue interpolation
  'interpolation': {
    pattern: /\{\{[\s\S]*?\}\}/,
    inside: {
      'expression': {
        pattern: /[\s\S]+/,
        inside: Prism.languages.javascript
      },
      'punctuation': /\{\{|\}\}/
    }
  }
};

// Add Vue language to Prism
export default Prism.languages.vue;