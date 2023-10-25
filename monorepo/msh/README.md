# Create a React Library with TypeScript and Vite

This repository is an Floor plan model builder using Lerna+Vite+Yarn Workspaces / Typescript+React+ESLint.

## Getting Started

First, install the dependencies of the monorepo:

```bash
yarn install
```

```bash
yarn lerna bootstrap
```

Build everything:

```bash
yarn lerna run build
```

or just

```bash
yarn build
```

Run the development server of the msh-builder project:

```bash
yarn start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

if you want to run tests on specific module:

```bash
yarn lerna run test --scope=msh-builder
```
