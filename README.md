# Pencil

## Setting up

```bash
git clone https://github.com/wtasg/pencil.git
cd pencil
npm install
npm run start
```

## Development

This project uses **TypeScript**. Available scripts:

```bash
npm run build      # TypeScript type checking
npm run lint       # ESLint code quality checks
npm run lint:fix   # Auto-fix linting issues
```

## Testing

Unit tests:

```bash
npm test
```

Electron E2E smoke tests (Playwright):

```bash
npm run test:e2e
```

Run headed locally:

```bash
npm run test:e2e:headed
```

## Based on existing but abandoned project

This project is based on [evlous/pencil@](https://github.com/evolus/pencil/commit/b8bef24042e4ec2c1a2c30c20a12db3bf38668ca)

Still GPL v2
