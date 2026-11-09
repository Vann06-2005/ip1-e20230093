# Milestones

## M0: Proposal

Tag: `m0`

**Which story did you cut from the MVP, and why?**

I cut story 10, reserving a book that has no copy available. It needs a waiting list per book, a rule that holds the returned copy for the first member in the list, and a way to tell that member the book is back, which means email or real-time notifications that are out of scope. The core flow works without it: a member can still see on the book page when a copy is available again and borrow it then. Renewing a loan (story 9) is also nice to have, because it is only a small change to the due date that I can add after the MVP if there is time.

## M1: Frontend prototype

Tag: `m1`

**What state lives in the store and what stays inside a component? Why?**

The store keeps data that several pages need and that must stay the same everywhere: the list of books with their available copies (books store), the member's loans (loans store) and the current role (session store). When a member borrows a book on the detail page, the loans store reloads the book in the books store, so the catalogue and My loans show the new number of copies without a page reload; if each page kept its own copy, they would disagree. State that only matters to one screen stays inside the component: the form fields and `submitted` flag in `BookForm`, the search text and filters of the catalogue (`useBookFilters`), and the `pending` and error message of the Borrow button. Nobody else needs them, and they should reset when the user leaves the page.
