# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

## UI layout for SkyVerse

The app now keeps only the shared `SkyScene` visible on the main presentation surface. Nonessential controls and panels are moved into a collapsible right-side drawer that opens with the floating `Open modules` button.

### Main visible surface

- `SkyScene` remains the single primary visible view.
- It is the shared renderer for AR, ceiling projection, weather, and guided sky modes.
- This keeps the UI projector-friendly and minimizes on-screen chrome.

### Drawer contents

The drawer contains panels that are useful for configuration, status, and module control, but do not need to be shown full-time:

- `ModeSwitcher` — choose AR, Ceiling, Weather, Guided, Minimal, Time Travel
- `ProjectionPanel` — projection readiness, calibration hints, and ceiling status
- `SensorPanel` — sensor readings and projection sensor state
- `ARPanel` — AR preview and supplemental AR guidance
- `SetupPanel` — location, preset, and configuration settings
- `SatellitePanel` — live satellite pass summary
- `VoicePanel` — voice command buttons and spoken-control hints
- `TestingPanel` — progress health and module completion summary

### Behavior

- The drawer is hidden by default.
- Click the floating `Open modules` button to reveal the drawer.
- Click outside the drawer or the `Close` button to hide it.
- When `Ceiling` mode becomes active, the drawer automatically closes so the SkyScene stays uncluttered.

This layout is designed for a projector-ready experience with a single visible sky surface and a secondary control panel that stays out of view until needed.
