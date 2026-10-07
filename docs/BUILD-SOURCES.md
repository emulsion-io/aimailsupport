# AI Mail Extended 1.8.0 — source build

Build environment used: Windows, Node.js 24.11.1 and npm 11.6.2.
The existing PII dependency declares Node.js >=24.12.0. The verified environment
prints an npm engine warning without blocking installation or build; use a
compatible Node.js version for future development.
Install Node.js from https://nodejs.org/ (npm is included).
The dependencies are pinned in package-lock.json. No API key is needed to build.

From the extracted source archive:

```console
npm ci
node -e "for (const locale of ['en','fr','it']) require('fs').mkdirSync('ai-mail-support/_locales/'+locale,{recursive:true})"
npm run build
npm run package -- ai-mail-extended-1.8.0.xpi
```

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.
The XPI is created in dist/. Compare extracted file content rather than ZIP timestamps.
The source archive excludes generated bundles, node_modules, caches, tests and credentials.
DOMPurify is copied unmodified from npm; the build generates VENDOR.md with its exact version and source URL.
