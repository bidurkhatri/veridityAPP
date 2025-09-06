// ESLint accessibility configuration for Veridity
// Add this to your .eslintrc.js or eslint.config.js

module.exports = {
  extends: [
    '@eslint/js/recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended', // Accessibility rules
  ],
  plugins: [
    'jsx-a11y'
  ],
  rules: {
    // Enhanced accessibility rules for Veridity
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/autocomplete-valid': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/html-has-lang': 'error',
    'jsx-a11y/iframe-has-title': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/lang': 'error',
    'jsx-a11y/media-has-caption': 'error',
    'jsx-a11y/mouse-events-have-key-events': 'error',
    'jsx-a11y/no-access-key': 'error',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/no-distracting-elements': 'error',
    'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'error',
    'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
    'jsx-a11y/no-noninteractive-tabindex': 'error',
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/scope': 'error',
    'jsx-a11y/tabindex-no-positive': 'error',
    
    // Custom rules for Veridity components
    'jsx-a11y/prefer-tag-over-role': 'warn',
    'jsx-a11y/control-has-associated-label': 'warn',
    
    // Tab order and focus management
    'jsx-a11y/no-onchange': 'off', // Allow onChange for better UX
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  overrides: [
    {
      files: ['**/*.test.{js,jsx,ts,tsx}'],
      rules: {
        // Relax some rules for test files
        'jsx-a11y/no-autofocus': 'off',
      }
    }
  ]
};

// GitHub Actions CI configuration for accessibility testing
const ciConfig = {
  axeConfig: {
    // Axe core configuration for automated testing
    rules: {
      'color-contrast': { enabled: true },
      'focus-order-semantics': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'landmark-one-main': { enabled: true },
      'page-has-heading-one': { enabled: true },
      'region': { enabled: true },
      'skip-link': { enabled: true },
      'tabindex': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  },
  routes: [
    '/', // Dashboard
    '/proof/generate', // Proof generation
    '/proof/history', // Proof history
    '/settings', // Settings
    '/organization', // Organization dashboard
    '/admin', // Admin panel
  ],
  thresholds: {
    violations: 0, // No accessibility violations allowed
    incomplete: 5, // Max 5 incomplete checks
  }
};

module.exports.ciConfig = ciConfig;