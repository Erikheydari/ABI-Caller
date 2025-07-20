# ABI-Caller

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
bun install
```

### Compile and Hot-Reload for Development

```sh
bun dev
```

### Type-Check, Compile and Minify for Production

```sh
bun run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
bun lint
```

## Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages. The deployment happens automatically when you push to the `main` branch.

#### Manual Deployment

If you want to deploy manually:

```sh
# Deploy to GitHub Pages
npm run deploy

# Deploy with clean (removes old files)
npm run deploy:clean
```

#### Setup Instructions

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Set Source to "GitHub Actions"

2. **Push your code** to the `main` branch to trigger automatic deployment

3. **Your site will be available at**: `https://[your-username].github.io/ABI-Caller/`

#### Custom Domain (Optional)

If you have a custom domain, uncomment and update the `cname` field in `.github/workflows/deploy.yml`.

### Local Preview

To preview the production build locally:

```sh
npm run build
npm run preview
```
