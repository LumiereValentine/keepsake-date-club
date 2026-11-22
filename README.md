# Always, Us — private anniversary website

## Setup

1. Create two accounts in the backend (Users), then give each one role in `user_roles`: one `owner`, one `partner`. Nobody else can enter.
2. Connect Resend (connector) so date requests email the owner. Optionally set `RESEND_FROM` to an address on a verified Resend domain; the default test sender only delivers to the Resend account owner.
3. Edit wording in `src/features/anniversary/content.ts`.

## Rules

- Anniversary: 24 March 2020, Asia/Jakarta time.
- Date requests: tomorrow or later; Morning 08–11, Evening 16–18, Night 19–21.
- Photos up to 20 MB, videos up to 100 MB.

Run tests: `bunx vitest run`.
