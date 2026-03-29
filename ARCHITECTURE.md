# Rancher Dashboard - Architecture Analysis

> Personal study notes for understanding the codebase.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3.5 |
| State | Vuex 4 |
| Routing | Vue Router 4 |
| HTTP | Axios |
| Styling | SCSS + CSS Variables |
| Language | TypeScript 5.6 (gradual migration from JS) |
| Build | Webpack 5 via Vue CLI 5 |
| Tests | Jest (unit) + Cypress (E2E) |

## Directory Structure

```
dashboard/
├── shell/                  # Core application
│   ├── assets/             # Styles, fonts, images, translations
│   ├── components/         # ~138 reusable Vue components
│   ├── composables/        # 18 Vue 3 composition functions
│   ├── config/             # Types, routes, settings, product configs
│   ├── core/               # Extension system framework
│   ├── detail/             # Resource detail views (by K8s type)
│   ├── dialog/             # Modal dialogs
│   ├── directives/         # 11 custom Vue directives
│   ├── edit/               # Resource edit forms (by K8s type)
│   ├── initialize/         # App bootstrap (entry, plugins, components)
│   ├── list/               # Resource list views (by K8s type)
│   ├── mixins/             # 24 legacy mixins (migrating to composables)
│   ├── models/             # 119 resource model classes
│   ├── pages/              # Top-level route pages
│   ├── plugins/            # Plugins (Steve API, i18n, axios, etc.)
│   ├── store/              # 31 Vuex store modules
│   └── utils/              # 87 utility modules
├── pkg/                    # Extension packages
│   ├── rancher-components/ # Shared component library (@rancher/components)
│   ├── eks/                # Amazon EKS provisioning
│   ├── aks/                # Azure AKS provisioning
│   ├── gke/                # Google GKE provisioning
│   ├── harvester-manager/  # Harvester HCI management
│   ├── rancher-prime/      # Premium features
│   ├── kubectl-explain/    # kubectl explain plugin
│   └── imported/           # Imported cluster support
├── cypress/                # E2E tests
├── storybook/              # Component documentation
├── docusaurus/             # Public docs
└── scripts/                # Build & utility scripts
```

## Core Architecture

### 1. Steve API Layer (`shell/plugins/steve/`)

The dashboard communicates with Rancher backend through **Steve** — a unified API abstraction over Kubernetes.

**Three store instances:**

| Store | Endpoint | Purpose |
|---|---|---|
| `management` | `/v1` | Management cluster resources |
| `cluster` | `/k8s/clusters/:id/v1` | Active cluster resources (dynamic) |
| `rancher` | `/v3` | Legacy Norman API (users, auth, settings) |

**Request pipeline:**
```
Component → store.dispatch → dedup check → HTTP request → normalize → cache → return
```

- Request deduplication for identical in-flight GET requests
- WebSocket streaming for real-time updates (`/v1/subscribe`)
- Web Workers for background processing

### 2. Model System (`shell/models/`)

One model class per Kubernetes resource type, following an inheritance chain:

```
SteveModel → HybridModel → Resource    (K8s resources via /v1)
NormanModel → HybridModel → Resource   (Rancher resources via /v3)
```

Models provide:
- Computed getters for derived state
- Action methods (`save()`, `remove()`, `reload()`)
- Route helpers (`detailLocation`, `editLocation`)
- Custom validation

### 3. CRUD Convention

Resources follow a file naming convention:

```
Type: apps.deployment →
  shell/list/apps.deployment.vue        # List view
  shell/detail/apps.deployment.vue      # Detail view
  shell/edit/apps.deployment/index.vue  # Create/Edit form
```

Registered via `type-map` store module, which maps types to components, permissions, and display config.

### 4. State Management (`shell/store/`)

**31 Vuex modules**, key ones:

| Module | Responsibility |
|---|---|
| `management`, `cluster`, `rancher` | Steve API stores |
| `auth` | User session, tokens, RBAC |
| `i18n` | Translations & locale |
| `type-map` | Resource type registry |
| `prefs` | User preferences (theme, language) |
| `growl` | Toast notifications |
| `catalog` | Helm chart repos & apps |
| `uiplugins` | Extension management |

### 5. Routing (`shell/config/router/`)

- Vue Router with `createWebHistory`
- Navigation guards for auth, product loading, install redirects
- Cluster-scoped routes: `/c/:cluster/explorer/...`
- Dynamic imports for code splitting

### 6. Extension System (`shell/core/`, `pkg/`)

Extensions can register routes, components, models, formatters, provisioners, etc.

**Auto-import mechanism** (`shell/pkg/auto-import.js`):
- Scans `pkg/*/` folders for conventional directories
- Generates webpack chunks for code splitting
- Extensions loaded via UI Plugin Operator or built-in

**Extension entry point pattern:**
```typescript
// pkg/my-extension/index.ts
export default function(plugin: IPlugin): void {
  importTypes(plugin);  // auto-register models, views, etc.
}
```

## Component Patterns

### Migration Status

| Pattern | Count | Direction |
|---|---|---|
| Options API (`export default {}`) | ~303 | Legacy |
| `defineComponent` + `setup()` | ~5 | Transitional |
| `<script setup>` | ~51 | Preferred for new code |

### Key Reusable Components

| Component | Path | Usage |
|---|---|---|
| `Tabbed` / `Tab` | `shell/components/Tabbed/` | Tab navigation |
| `SortableTable` | `shell/components/SortableTable/` | Data tables |
| `Banner` | `pkg/rancher-components/.../Banner/` | Alerts & messages |
| `FileSelector` | `shell/components/form/FileSelector.vue` | File upload |
| `LabeledInput` | `pkg/rancher-components/.../LabeledInput/` | Form inputs |
| `ResourceTable` | `shell/components/ResourceTable.vue` | K8s resource lists |
| `AsyncButton` | `shell/components/AsyncButton.vue` | Loading buttons |
| `CodeMirror` | via plugin | YAML/JSON editor |

## Styling

### Theme System

- CSS custom properties (`--primary`, `--border`, `--body-bg`, etc.)
- Light/dark mode via `.theme-light` / `.theme-dark` classes
- SCSS variables in `shell/assets/styles/base/`
- Scoped `<style lang="scss" scoped>` per component
- SUSE branding theme available

### CSS Architecture

```
assets/styles/
├── base/        # Variables, mixins, typography, spacing
├── vendor/      # Normalize, third-party
├── global/      # Buttons, cards, forms, tables
├── themes/      # Light, dark, modern, SUSE
└── app.scss     # Main entry
```

## i18n

- YAML-based translations (`shell/assets/translations/en-us.yaml`)
- Dot-notation keys: `t('generic.save')`
- IntlMessageFormat for interpolation
- Extensions provide their own `l10n/` translations
- Available locales: `en-us`, `zh-hans`

## Testing

| Type | Tool | Location |
|---|---|---|
| Unit | Jest | `**/__tests__/*.test.ts` alongside source |
| E2E | Cypress | `cypress/e2e/tests/` |
| Component docs | Storybook | `storybook/` |
| Visual regression | Percy | via Cypress |

## Dev Commands

```bash
API=<rancher-url> yarn dev   # Dev server at https://127.0.0.1:8005
yarn build                    # Production build
yarn lint                     # ESLint
yarn test:ci                  # Jest unit tests
yarn cy:open                  # Cypress interactive
```
