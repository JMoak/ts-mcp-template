# ts-mcp-template

Lightweight TypeScript MCP server template using stdio transport, Zod for input validation, and Biome for linting/formatting.

Features:
- Minimal MCP server with `echo` tool
- Zod runtime validation + JSON Schema exposure via `zod-to-json-schema`
- ESM, TypeScript, and `npm`-friendly packaging for `npx` usage
- Biome config for lint/format

## Install / Build

- Install deps: `npm install`
- Build: `npm run build` (outputs to `dist/`)

## Usage

Run via Node directly:

```
node dist/index.js
```

Or, once published, run with npx:

```
npx ts-mcp-template
```

The server communicates over stdio per MCP conventions. It exposes a single tool:

- name: `echo`
- description: Echo back input text
- input schema:
  - `text` (string, required): Text to echo back
  - `uppercase` (boolean, optional): Return text uppercased

## Dev Notes

- Node >= 18.17
- TypeScript config preserves shebang for CLI use.
- For lint/format:
  - Lint: `npm run lint`
  - Format: `npm run format`

## License

MIT
