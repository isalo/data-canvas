# Security Policy

## Supported versions

DataCanvas is pre-1.0. Only the latest published version of each
`@datacanvas/*` package receives security fixes.

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Instead, report vulnerabilities privately via
[GitHub Security Advisories](https://github.com/isalo/data-canvas/security/advisories/new).

You can expect:

- An acknowledgement within 72 hours.
- A status update within 7 days.
- Credit in the release notes once a fix is published (unless you prefer to
  remain anonymous).

## Scope notes

DataCanvas generates CRUD APIs from entity metadata. Anything that allows a
client to read or write data outside the registered entities and validated
fields — bypassing the Zod schemas, reaching unregistered columns through
sort/filter parameters, or similar — is considered a vulnerability and is
high priority.
