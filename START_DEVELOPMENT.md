Next Steps (when you say "Start Development"):
  1. Check what the actual session contains during API calls
  2. Fix session organizationId population in JWT callback
  3. Ensure user signs out/in to refresh JWT token
  4. Verify notifications display correctly in UI

  The notifications system is fully functional - it's just a session authentication data mismatch preventing the API from returning the user's notifications.