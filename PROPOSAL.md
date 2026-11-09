# Library Loans

## Problem

A small library, such as a faculty library, tracks its loans on paper or in a spreadsheet, so members cannot check from outside whether a book is available. Librarians cannot easily see who has which book or which loans are late, and the loan limit is not applied the same way to everyone.

## Users and roles

- **Member** (students and staff): searches the catalogue, sees available copies, borrows up to 3 books for 14 days, sees their own loans and returns a book. A visitor who registers becomes a member.
- **Librarian** (library staff): adds, edits and deletes books, sees all loans and the overdue list, and marks any loan as returned. Librarian accounts come from the seed script; a librarian does not borrow.

## User stories

1. As a visitor, I want to create an account so that I can borrow books.
   Accepted when: a valid name, email and password (8+ characters) create a Member account; an email already in use shows "This email is already registered."; a role sent in the request is ignored.
2. As a user, I want to log in so that I see the pages for my role.
   Accepted when: correct credentials open /books with the menu for my role; a wrong email or password shows "Invalid email or password." (401); pages other than /login and /register redirect to /login without a token.
3. As a member, I want to search and filter the catalogue so that I can quickly find a book.
   Accepted when: the list shows 10 books per page sorted by title; "harry" finds books whose title or author contains "harry", ignoring case; genre and "available only" filters combine with the search, and an empty result shows "No books found."
4. As a member, I want to open a book's page so that I can see its details and whether a copy is available.
   Accepted when: /books/:id shows the details and available copies (total minus active loans); with no copy left the Borrow button is disabled; an unknown id shows "Book not found."
5. As a member, I want to borrow a book so that I can take it home for two weeks.
   Accepted when: Borrow creates a loan due 14 days later and available copies go down by 1 without a reload; I cannot borrow the same book twice, borrow with an overdue loan, have more than 3 active loans, or take a book with no copy left (400 with a clear message); a librarian gets 403.
6. As a member, I want to see my loans and return a book so that I know what to bring back and when.
   Accepted when: My loans shows only my loans with status ACTIVE, OVERDUE or RETURNED; overdue loans are red with the days late; Return gives the copy back, and another member's loan returns 404.
7. As a librarian, I want to add, edit and delete books so that the catalogue matches the shelves.
   Accepted when: a book with a title, author, unique ISBN, genre and total copies is added; invalid fields show a message under the field (400); a book with active loans cannot be deleted; a member gets 403.
8. As a librarian, I want to see all loans and which are overdue so that I can follow up with members.
   Accepted when: All loans lists every loan with the member and book, filtered by status and searched by member; OVERDUE is sorted oldest first with the days late; I can mark any active or overdue loan as returned.
9. As a member, I want to renew a loan so that I can keep a book longer when nobody else needs it.
   Accepted when: Renew moves the due date 14 days later, once per loan, and is refused for an overdue loan.
10. As a member, I want to reserve a book that has no copy available so that I get it when it comes back.
    Accepted when: I join a waiting list for the book, and the first member in the list can borrow the next returned copy before anyone else.

## MVP scope

Must have: story 1, 2, 3, 4, 5, 6, 7, 8

Nice to have: story 9, 10

## Entities

| Entity | Main attributes | Relations |
|---|---|---|
| User | name, email (unique), passwordHash, role (MEMBER or LIBRARIAN), createdAt | has many Loans |
| Book | title, author, isbn (unique), genre, publishedYear, description, totalCopies | has many Loans |
| Loan | userId, bookId, borrowedAt, dueDate, returnedAt | belongs to one User and one Book |

Available copies (total copies minus active loans) and the loan status (ACTIVE, OVERDUE, RETURNED) are calculated, not stored.

## Stretch feature

Search + pagination.

What it does in this app: the catalogue is searched by title or author (ignoring case), filtered by genre and "available only", and paged 10 books at a time (at most 50). The librarian's All loans list is also filtered by status, searched by member and paged.

## Repository

https://github.com/Vann06-2005/ip1-e20230093
