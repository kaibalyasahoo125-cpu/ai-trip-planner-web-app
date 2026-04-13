# AI Trip Planner - Next.js Auth Fix TODO

## Steps (Approved Plan):
- [x] 1. Edit package.json: Change dev script to `next dev` (disable Turbopack)
- [x] 2. Edit middleware.ts: Update public matcher to include sign-up routes  
- [x] 3. Edit app/layout.tsx: Fix Provider wrapping inside ClerkProvider
- [x] 4. Edit app/provider.tsx: Remove unused <header />
- [x] 5. Run `npm install`
- [x] 6. Instruct user to add Clerk env vars to .env.local
- [ ] 7. Run `npm run dev`
- [ ] 8. Test sign-in/sign-up at localhost:3000/sign-in, /sign-up
- [ ] 9. Test protected route redirect (e.g., home page)

Current progress: Starting edits...
