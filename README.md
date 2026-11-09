# Library Loans

A web app for a small library: members search the catalogue, borrow and return books; librarians manage the books and follow up on late loans. See [PROPOSAL.md](PROPOSAL.md) and [docs/SPEC.md](docs/SPEC.md).

## How to run

The frontend (M1) runs against a mock API: json-server reads and saves `frontend/db.json`. From M2 it is replaced by the NestJS API.

Requires Node 24 LTS.

```bash
cd frontend
npm install
cp .env.example .env   # optional: VITE_API_URL defaults to http://localhost:3000
npm run api            # terminal 1: mock API on http://localhost:3000
npm run dev            # terminal 2: the app on http://localhost:5173
```

Other commands, in `frontend/`:

```bash
npm run test:unit -- --run   # component, store and router tests (they fake fetch, so the API need not run)
npm run type-check           # TypeScript in strict mode
npm run lint                 # ESLint
npm run build                # type-check and production build
```

Borrowing and adding books change `frontend/db.json`. `git checkout frontend/db.json` resets the demo data.

There is no login yet (it comes in M3). Pick **Member** or **Librarian** in the header: the member acts as Sok Dara, the librarian as Lim Sophea.

## Features

| Page | Route | Role | Story |
|---|---|---|---|
| Catalogue with search, genre and "available only" filters | `/books` | Both | US-03 |
| Book detail and Borrow | `/books/:id` | Both (Borrow: member) | US-04, US-05 |
| Add a book, with validation | `/books/new` | Librarian | US-07 |
| My loans and Return | `/my-loans` | Member | US-06 |
| 404 page | any unknown URL | Both | |

A page for one role sends the other role back to the catalogue. The catalogue and My loans show loading, empty, error and success states.

## Screenshots

Wireframes of every screen are in [docs/wireframes](docs/wireframes).
