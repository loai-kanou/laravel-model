# Laravel Model

VS Code tooling for Eloquent properties: `$fillable`, `$guarded`, `$casts`, `$hidden`, `$appends` + relation DocBlocks.

## Why
- Reduce mass-assignment mistakes.
- Keep model props explicit and discoverable.
- Developer experience: CodeLens, quick fixes, docblocks.

## Features
- Diagnostics for risky patterns (no `$fillable`/`$guarded`, `['*']` guarded).
- Quick Fixes to add attributes to arrays.
- Generate `$fillable` from detected mass-assignment usage.
- CodeLens summary.
- Sync DocBlocks with attributes and relations.

## Settings
- `laravelModels.migrationGlobs`: Parse migrations for extra hints.
- `laravelModels.enableDbAware`: Allow `php artisan` calls (opt-in).
- `laravelModels.artisanPath`: Customize artisan command.

## Roadmap
- Optional AST via `php-parser` for robust parsing.
- DB-aware fillable suggestions via `artisan model:show`.
- Casts editor UI (pickers).

## Development
```bash
npm i
npm run build
# Press F5 in VS Code to launch the Extension Development Host
```


## License

MIT

By: Loai Kanou