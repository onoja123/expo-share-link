# Contributing

Thanks for helping out. This is a small module, so the loop is short.

## Setup

```sh
npm install
cd example && npm install
```

## Run the example app

```sh
cd example
npx expo run:ios      # or: npx expo run:android
```

The example links the module from the parent folder, so native changes need a rebuild and TypeScript changes reload with Metro.

## Before opening a pull request

```sh
npm run lint
npm run build
npm test
```

Keep changes focused. If you add a platform behaviour, add it to the platform table in the README and to `CHANGELOG.md` under "Unpublished".
