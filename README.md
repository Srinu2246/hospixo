# Hospixo Client

Hospixo tenant-facing web application for restaurant owners, managers, and staff to manage onboarding, branches, menus, POS operations, and business insights.

This repository is dedicated to the Hospixo client application. The internal Hospixo administration application is maintained in a separate repository, while backend services are maintained in [hospixo-backend](https://github.com/hospixo/hospixo-backend).

## Purpose

Hospixo is building a unified hospitality operating system, starting with restaurants. The client application gives tenant users a workspace for managing their business across organization, company, and branch levels.

The initial audience includes restaurant owners, tenant administrators, branch managers, and authorized operational staff.

## Repository status

This repository is being initialized following the separation of the admin and client applications. The application source, package manifest, and verified setup instructions have not yet been added.

The capabilities below describe the intended product scope; they are not a statement that these features are implemented in this repository.

## Intended scope

- Tenant onboarding and organization, company, and branch management.
- User access and workflows based on assigned roles and permissions.
- Menu and catalog management, including categories, items, and branch availability.
- Restaurant operations, including floors, tables, reservations, orders, and POS workflows.
- Operational dashboards with daily, weekly, and monthly views, including breakfast, lunch, and dinner sessions.
- Item performance and collection reporting to support business decisions.

Inventory, procurement, workforce management, finance, and AI-assisted workflows are part of the broader Hospixo roadmap. Their client implementation will depend on product priorities and available backend contracts.

## Application boundaries

| Application | Responsibility |
| --- | --- |
| Hospixo Client | Tenant-facing business and restaurant operations |
| Hospixo Admin | Internal platform administration and support |
| Hospixo Backend | Shared APIs, authentication, authorization, tenancy, and business rules |

The client must respect organization, company, and branch access boundaries. The backend remains responsible for enforcing permissions and tenant isolation.

## Technology direction

The existing Hospixo frontend uses Next.js, React, TypeScript, and Tailwind CSS. The separated client application should preserve the existing architecture and dependencies where appropriate.

Exact framework versions, package-manager commands, directory structure, and deployment settings must be documented after the client source is imported and validated.

## Getting started

Clone the repository:

```bash
git clone https://github.com/hospixo/hospixo_client.git
cd hospixo_client
```

Installation and development commands will be added after the application source and package manifest are available.

Configuration must be documented in a safe `.env.example` with placeholder values. Never commit credentials, access tokens, private keys, or real customer data. Any variable exposed to the browser must be safe for public access.

## Development guidelines

- Inspect the existing client code and backend API contracts before making changes.
- Keep client changes within this repository's scope.
- Preserve established design patterns and shared component conventions.
- Support loading, empty, validation, permission-denied, and failure states.
- Use backend responses for business data and server-enforced access decisions.
- Link changes to a tracked issue and document acceptance criteria.
- Run applicable lint, type, build, and meaningful test checks before merging.
- Document API dependencies and gaps rather than inventing endpoints.

## Release documentation

Before the first deployment, document the environment-to-branch mapping, API configuration, CI checks, hosting settings, health verification, and rollback procedure for this standalone application.

## Ownership

Maintained by Hospixo Technologies Private Limited.

This is a private company repository. No open-source license is granted by this README.
