# SDK Repository Guide

This repository publishes framework-neutral clients for the Zilobase Toolkit
API. Framework-specific behavior belongs in explicit adapter packages.

## Repository boundaries

- Keep project API keys and all package-root SDK usage on trusted servers.
- Do not add connector implementations, provider HTTP clients, database code,
  migrations, credentials, dashboards, result views, or deployment settings.
- Treat the committed OpenAPI document as the only platform contract shared
  with this public repository.
- Never retry tool execution automatically.
- Preserve browser export guards as packages gain browser conditions.

## Verification

Run the most focused workspace checks during development. Once the full
workspace verification command is introduced, use it before release changes.
