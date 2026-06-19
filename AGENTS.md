<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Critical Rules (Learned from Audit)

1. NEVER use `dark:` classes. The app is always dark. Use design tokens from globals.css only.
2. NEVER nest `useQuery`/`useMutation` inside functions returned from a hook. Export flat hooks.
3. ALWAYS use `useRouter` and `usePathname` from `@/lib/i18n-navigation`, not `next/navigation`.
4. ALWAYS use `useTranslations` / `getTranslations` — zero hardcoded UI strings.
5. ALL API GET responses must be wrapped: `{ data: { [resource]: [...] } }`.
6. ALL API error responses must have `{ error: { ar, en, code } }` shape.
7. Use Lucide icons (`lucide-react`) — never emojis in production UI.
8. Every new page route must be protected by middleware automatically.
9. `requireAuth()` must be the first call in every API route handler.
10. `clinicScope(session)` must be in every Prisma query on clinic-scoped models.
