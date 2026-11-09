# Library Loans: Specification

Internet Programming I · I4-GIC-B, ITC · 2026–2027 · PHOUNG Sovannara (e20230093) · Lecturer: CHUN Thavorac

## 1. Project

Library Loans is a web application for a small library, such as a faculty library. Members search the catalogue, borrow books and return them; librarians manage the books and follow up on late loans. It replaces the paper notebook or spreadsheet where nobody can check availability from outside the library, late books are hard to spot, and the loan limit is not applied the same way to everyone.

This document describes the system requirements in detail (section 3) and the user stories with acceptance criteria (sections 4 to 8). It was submitted as the project proposal on 25 October 2026. Every requirement has an ID and is traced to a user story, and each acceptance criterion will get one test name in `docs/TEST_PLAN.md` at Check 6.

**Scope.** In scope: two roles with login, a book catalogue with search, filter and pagination, borrowing and returning with loan rules, overdue tracking, book management for librarians, and automated tests. Out of scope: fines and payments, reservations or waiting lists, renewing a loan, email or SMS reminders, book cover uploads, several branches and real-time updates.

## 2. Roles

| Role  | Who                             | What they can do                                                                                                                                                                            |
|-----------|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Member    | Students and staff who borrow books | Search the catalogue, see available copies, borrow up to 3 books for 14 days, see their own loans and return a book. A visitor who registers becomes a member.                                  |
| Librarian | Library staff                       | Search the catalogue, add, edit and delete books, see all loans and the overdue list, and mark any loan as returned. Librarian accounts come from the seed script; a librarian does not borrow. |

## 3. System requirements

"Shall" marks a mandatory requirement. The last column links each requirement to the user story in section 5 that it serves.

### 3.1 Functional requirements

| ID | The system shall…                                                                                                    | Story    |
|--------|--------------------------------------------------------------------------------------------------------------------------|--------------|
| AUTH-1 | let a visitor register with name, email and password, creating a Member account; a role sent in the request is ignored   | US-01        |
| AUTH-2 | reject a duplicate email, an invalid email, a name outside 2–60 characters or a password shorter than 8 characters (400) | US-01        |
| AUTH-3 | store passwords only as bcrypt hashes and never return them in a response                                                | US-01        |
| AUTH-4 | log in a user and return a JWT valid for 1 day                                                                           | US-02        |
| AUTH-5 | answer a wrong email or a wrong password with the same message (401)                                                     | US-02        |
| AUTH-6 | redirect a visitor without a token to /login and hide actions the role cannot use                                        | US-02        |
| BOOK-1 | show any logged-in user the catalogue and a detail page with total and available copies                                  | US-03, US-04 |
| BOOK-2 | search books by title or author, filter by genre and "available only", and page results (10 per page, 50 maximum)        | US-03        |
| BOOK-3 | calculate available copies as total copies minus active loans, without storing it                                        | US-04        |
| BOOK-4 | let a librarian create, view, update and delete books                                                                    | US-07        |
| BOOK-5 | require a unique ISBN of 10 or 13 digits and total copies from 0 to 100                                                  | US-07        |
| LOAN-1 | let a member borrow a book, with a due date 14 days after borrowing                                                      | US-05        |
| LOAN-2 | check rules BR-1 to BR-4 in the backend, in that order, before creating a loan                                           | US-05        |
| LOAN-3 | save a loan and check the rules in one database transaction                                                              | US-05        |
| LOAN-4 | show a member only their own loans, with the status ACTIVE, OVERDUE or RETURNED                                          | US-06        |
| LOAN-5 | let a member return their own loan and a librarian return any loan                                                       | US-06, US-08 |
| LOAN-6 | show a librarian all loans, filtered by status and searched by member, and an overdue list                               | US-08        |
| UI-1   | show API 400, 403 and 404 errors as readable messages next to the form or at the top of the page                         | all          |

### 3.2 Business rules (enforced in the backend service, not only in the UI)

| ID | Rule                                                                            | Response                                                |
|--------|-------------------------------------------------------------------------------------|-------------------------------------------------------------|
| BR-1   | A member cannot borrow a book they already have on loan                             | 400 · You already borrowed this book.                       |
| BR-2   | A member with an overdue loan cannot borrow                                         | 400 · Return your overdue books before borrowing a new one. |
| BR-3   | A member has at most 3 active loans                                                 | 400 · You can borrow at most 3 books at a time.             |
| BR-4   | A book with no available copy cannot be borrowed                                    | 400 · No copies of this book are available.                 |
| BR-5   | A loan is due 14 days after it is borrowed; it is overdue when not returned by then | Shown as OVERDUE                                            |
| BR-6   | A returned loan cannot be returned again                                            | 400 · This loan is already returned.                        |
| BR-7   | ISBN is unique and has 10 or 13 digits                                              | 400 · A book with this ISBN already exists.                 |
| BR-8   | Total copies cannot be lower than the copies on loan                                | 400 · Total copies cannot be less than the copies on loan.  |
| BR-9   | A book with active loans cannot be deleted                                          | 400 · This book has active loans and cannot be deleted.     |

The values 3 (loan limit), 14 (loan days), 10 and 50 (page sizes) are defined once, in one backend constants file.

### 3.3 Non-functional requirements

| ID | Requirement                                                                                               | How it is checked              |
|--------|---------------------------------------------------------------------------------------------------------------|------------------------------------|
| SEC-1  | Passwords hashed with bcrypt (cost 10); JWT signed with JWT_SECRET from .env, which is never committed        | Database check; .gitignore         |
| SEC-2  | Global ValidationPipe with whitelist: unknown fields are removed, invalid fields return 400                   | API test                           |
| SEC-3  | Wrong role returns 403; another member's loan returns 404 (IDOR protection)                                   | API tests                          |
| SEC-4  | CORS allows only the frontend origin; no response contains passwordHash                                       | Manual check; API test             |
| PERF-1 | The catalogue with 1,000 books returns one page in under 500 ms                                               | Timed request on seeded data       |
| REL-1  | Data survives a backend restart; two members cannot take the last copy at the same time                       | Restart test; parallel API test    |
| REL-2  | Bad input never causes a 500 error                                                                            | API tests                          |
| USE-1  | Borrowing takes at most 2 actions from the catalogue (open the book, click Borrow)                            | Manual walk-through                |
| USE-2  | Layouts work from 360 px to 1,440 px wide; every list has a loading and an empty state                        | Browser dev tools; component tests |
| MAIN-1 | TypeScript strict mode; npm run build passes with no type errors; one NestJS module per resource              | CI                                 |
| PORT-1 | A new developer runs both apps from a fresh clone in under 10 minutes with the README and the seeded accounts | A classmate tries it               |

### 3.4 Data requirements

Three entities, all in PostgreSQL through Prisma, with two one-to-many relations (User → Loans, Book → Loans).

| Entity  | Main fields                                                                                                              | Rules                                                       |
|-------------|------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| User        | name, email, passwordHash, role (MEMBER, LIBRARIAN), createdAt                                                               | Email unique; self-registered users are members                 |
| Book (main) | title, author, isbn, genre (FICTION, SCIENCE, TECHNOLOGY, HISTORY, LANGUAGE, OTHER), publishedYear, description, totalCopies | Full CRUD; ISBN unique; available copies calculated             |
| Loan        | userId, bookId, borrowedAt, dueDate, returnedAt                                                                              | Active while returnedAt is empty; status calculated, not stored |

`npx prisma db seed` creates 1 librarian, 2 members, 15 books in at least 4 genres, and loans that are active, overdue and returned.

### 3.5 Software and hardware requirements

| Part              | Requirement                                                                                                       |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------|
| Frontend              | Vue 3 + TypeScript with Vite, Pinia, Vue Router; tests with Vitest and Vue Test Utils                                 |
| Backend               | NestJS 11 on Node.js 24 LTS; class-validator, @nestjs/jwt, bcrypt; tests with Jest + Supertest                        |
| Database              | PostgreSQL 16 (local or Docker) with Prisma ORM and committed migrations; separate test database in `backend/.env.test` |
| Development machine   | Windows, macOS or Linux laptop with at least 8 GB RAM, Node.js 24 and Git                                             |
| User device           | Phone, tablet or computer with a current Chrome, Firefox or Edge browser                                              |
| Source control and CI | Public GitHub repository `ip1-e20230093`; GitHub Actions from Check 6                 |

## 4. Story overview

Eight stories across the two roles: three for members, three for both roles, and two for librarians.

| ID | Story                                | Role  | Planned check |
|--------|------------------------------------------|-----------|-------------------|
| US-01  | Register                                 | Member    | Check 5           |
| US-02  | Log in                                   | Both      | Check 5           |
| US-03  | Find a book (search, filter, pagination) | Both      | Checks 2, 4, 6    |
| US-04  | View a book                              | Both      | Checks 2, 4       |
| US-05  | Borrow a book                            | Member    | Checks 2, 4, 5    |
| US-06  | See my loans and return a book           | Member    | Checks 2, 4, 5    |
| US-07  | Manage books                             | Librarian | Checks 2, 3, 4    |
| US-08  | Track all loans and overdue loans        | Librarian | Checks 4, 5       |

## 5. User stories

### US-01: Register (Member)

As a student, I want to create an account so that I can borrow books.

| AC | Acceptance criterion                                                                                                                                              |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| AC1    | With a name of 2 to 60 characters, a valid email and a password of 8 or more characters, a Member account is created and I see "Account created. You can log in now." |
| AC2    | An email already in use shows "This email is already registered."                                                                                                     |
| AC3    | An invalid field shows a message under that field, and the API also rejects it with 400.                                                                              |
| AC4    | A role sent in the request is ignored: every new account is a Member.                                                                                                 |

**Status:** Not done

### US-02: Log in (Both)

As a user, I want to log in so that I see the pages for my role.

| AC | Acceptance criterion                                                                                                            |
|--------|-------------------------------------------------------------------------------------------------------------------------------------|
| AC1    | Correct credentials take me to /books. A member's menu shows My loans; a librarian's menu shows Add book and All loans.             |
| AC2    | A wrong email or a wrong password shows the same message, "Invalid email or password." (API 401), and no token is stored.           |
| AC3    | Opening any page except /login and /register without logging in redirects to /login; an API call without a valid token returns 401. |
| AC4    | A member who opens a librarian page (/books/new, /loans) is sent to /books, and the API returns 403. Logging out removes the token. |

**Status:** Not done

### US-03: Find a book (Both)

As a member, I want to search and filter the catalogue so that I can quickly find a book I want.

| AC | Acceptance criterion                                                                                                                            |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| AC1    | The list shows 10 books per page with title, author, genre and available copies, sorted by title, with Previous and Next buttons and "Page X of Y". |
| AC2    | Typing "harry" shows only books whose title or author contains "harry", ignoring upper and lower case.                                              |
| AC3    | The genre and "available only" filters combine with the search; an empty result shows "No books found."                                             |
| AC4    | A page below 1 or a page size above 50 is refused with 400.                                                                                         |

**Status:** Not done

### US-04: View a book (Both)

As a member, I want to open a book's page so that I can see its details and whether a copy is available.

| AC | Acceptance criterion                                                                                                                |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------|
| AC1    | /books/:id shows title, author, ISBN, genre, published year, description, total copies and available copies (total minus active loans). |
| AC2    | When no copy is available, the Borrow button is disabled and shows "No copies available".                                               |
| AC3    | An unknown id shows "Book not found." (API 404).                                                                                        |

**Status:** Not done

### US-05: Borrow a book (Member)

As a member, I want to borrow a book so that I can take it home for two weeks.

| AC | Acceptance criterion                                                                                                                                                              |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| AC1    | Clicking Borrow creates a loan due 14 days later, and available copies go down by 1 on the book page, the catalogue and My loans without a page reload.                               |
| AC2    | If a rule fails, the API returns 400 with the first failing message, checked in the order BR-1, BR-2, BR-3, BR-4. The message is shown next to the Borrow button and nothing changes. |
| AC3    | A librarian cannot borrow (the API returns 403).                                                                                                                                      |

**Status:** Not done

### US-06: See my loans and return a book (Member)

As a member, I want to see my loans and return a book so that I know what to bring back and when.

| AC | Acceptance criterion                                                                                                                      |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| AC1    | My loans lists only my loans with book title, borrowed date, due date and status (ACTIVE, OVERDUE, RETURNED), filterable by status and paged. |
| AC2    | Overdue loans are shown in red with the number of days late.                                                                                  |
| AC3    | Return sets the return date to now and available copies go up by 1; returning it again shows "This loan is already returned."                 |
| AC4    | Asking for or returning another member's loan by its id returns 404, as if it did not exist.                                                  |

**Status:** Not done

### US-07: Manage books (Librarian)

As a librarian, I want to add, edit and delete books so that the catalogue matches the shelves.

| AC | Acceptance criterion                                                                                                                  |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------|
| AC1    | Creating a book with a title, author, ISBN, genre and total copies (year and description optional) adds it to the catalogue.              |
| AC2    | An invalid field shows a message under the field (API 400); a duplicate ISBN shows "A book with this ISBN already exists."                |
| AC3    | Editing saves the new values; lowering total copies below the copies on loan shows "Total copies cannot be less than the copies on loan." |
| AC4    | Deleting asks for confirmation; a book with active loans is refused with "This book has active loans and cannot be deleted."              |
| AC5    | A member cannot create, edit or delete books (the API returns 403).                                                                       |

**Status:** Not done

### US-08: Track all loans and overdue loans (Librarian)

As a librarian, I want to see all loans and which are overdue so that I can follow up with members.

| AC | Acceptance criterion                                                                                                                     |
|--------|----------------------------------------------------------------------------------------------------------------------------------------------|
| AC1    | All loans lists every loan with member name and email, book title, dates and status, newest first, with page controls.                       |
| AC2    | I can filter by status and search by member name or email; with status OVERDUE the list is sorted by due date, oldest first, with days late. |
| AC3    | Mark returned works on any active or overdue loan, with the same rules as US-06.                                                             |
| AC4    | A member cannot open All loans (the API returns 403).                                                                                        |

**Status:** Not done

## 6. Guard table

Permissions behind the stories, used for the guards at Check 5. Y = allowed; Own = only the user's own loans (others return 404); — = 403. Without a token, everything except register and log in returns 401.

| Action                          | Member | Librarian |
|-------------------------------------|------------|---------------|
| Register, log in                    | Y          | Y             |
| Search, filter and view books       | Y          | Y             |
| Create, update and delete books     | —          | Y             |
| Borrow a book                       | Y          | —             |
| View loans                          | Own        | Y             |
| Return a loan                       | Own        | Y             |
| View all loans and the overdue list | —          | Y             |

## 7. Advanced feature: search and pagination

The advanced feature for Check 6 is search, filter and pagination on the book catalogue (US-03). Its limits, which will be tested:

| Limit   | Expected behaviour                                                            |
|-------------|-----------------------------------------------------------------------------------|
| Page size   | 10 by default; pageSize below 1 or above 50 is refused with 400                   |
| Page number | page below 1 is refused with 400; a page after the last one returns an empty list |
| Search      | Case-insensitive, matches title or author; an empty search shows all books        |
| No result   | Shows "No books found." instead of an empty table                                 |

## 8. Story status

Every story starts as **Not done**. At each check the status is updated in `docs/SPEC.md`, and at Check 7 every story is marked Done or Not done; a Done story must pass all its acceptance criteria in the tagged commit.
