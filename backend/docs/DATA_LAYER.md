# Data Layer — In-Memory Mock Database

This build replaces Postgres/Prisma with a **zero-setup, in-memory mock database**
so the whole app runs immediately after `npm install && npm start` — no
database server, connection string, migrations, or seed command required.

## Why this exists

The original project used Prisma + PostgreSQL. That's the right choice for
production, but it means anyone opening the project needs a running Postgres
instance, a `DATABASE_URL`, and a migration/seed step before anything works.
For handing this off as a ready-to-run MVP/demo, that friction was removed:
the exact same Express routes, controllers, services, validators, and the
**entire React frontend are untouched**. Only the database connection itself
(`backend/src/config/prisma.js`) was swapped for a mock client with the same
API surface.

## How it works

```
backend/src/config/
├── prisma.js              # exports the mock client — every service still
│                             does `const prisma = require('../config/prisma')`
└── mockdb/
    ├── schema.js           # relations + unique constraints for every model
    ├── helpers.js           # where/orderBy/include/select engine
    ├── client.js            # generic findMany/create/update/delete/aggregate/... 
    └── store.js              # the actual in-memory data + demo seed
```

The mock client implements the same methods your services already call:
`findMany`, `findUnique`, `findFirst`, `create`, `createMany`, `update`,
`updateMany`, `upsert`, `delete`, `deleteMany`, `count`, `aggregate`,
`$transaction`, `$connect`, `$disconnect` — including `where` filters
(`equals`, `in`, `contains` + `mode: 'insensitive'`, `gte`/`lte`, `OR`/`AND`),
`orderBy`, pagination (`skip`/`take`), relational `include`/`select`, and
`_count`. Because the API shape matches Prisma, **no service, controller,
route, or frontend file had to change.**

Data lives in a plain JS object in memory. It resets to the seed data every
time the server process restarts — that's expected for a demo build. If you
later want to persist data across restarts or move to a real database, swap
`backend/src/config/prisma.js` back to a real `@prisma/client` instance; the
original schema is kept at `backend/docs/data-model-reference.prisma` for
that purpose, and every service already talks to `prisma.<model>.<method>()`
in standard Prisma call shape.

## Demo login credentials

All demo accounts share one password: **`Demo@1234`**

| Role | Email |
|---|---|
| Super Admin | `superadmin@hrpc.org` |
| National Admin | `national.admin@hrpc.org` |
| State Admin (Maharashtra) | `state.admin@hrpc.org` |
| District Admin (Pune) | `district.admin@hrpc.org` |
| Taluka Admin (Haveli) | `taluka.admin@hrpc.org` |
| City Admin (Pune City) | `city.admin@hrpc.org` |
| Volunteer | `volunteer.demo@hrpc.org` |
| Member | `member.demo@hrpc.org` |

You can also register a brand-new account from the public site — new users
are created for real (in memory) and can log in immediately.

## What's pre-seeded

- 5 states → districts → talukas → cities (India geography sample)
- One user per role above, plus 2 extra member accounts
- Member, Volunteer, and Intern profiles with attendance/tasks/reports
- 3 complaints (registered, under investigation, resolved) with notes
- 1 crowdfunding campaign with an update, and 4 donations (online/offline,
  success/pending, one recurring)
- 2 beneficiaries linked to real complaints
- 2 events (one upcoming, one completed) with registrations
- 20 verified Human Rights Links across all categories
- System settings, notifications, and an activity log

## Full CRUD confirmed working

Create/read/update/delete was smoke-tested end-to-end for: auth
(register/login/refresh/password reset), members (apply → approve → renew),
complaints (register → assign → note → resolve), donations (online/offline
+ financial summary), volunteers (register → approve → tasks/attendance),
interns (register → mentor → daily reports), events (create → register →
QR check-in → feedback), campaigns (create → updates → raised-amount
aggregation), beneficiaries, Human Rights Links, notifications, and the
Super Admin geography/role/settings/activity-log tools.
