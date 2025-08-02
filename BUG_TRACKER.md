# Bug Tracker - Kas Kelas Application

## Overview
This document tracks all known bugs and their resolution status. We'll fix them one by one systematically.

## Bug Categories
- 🔴 **Critical**: Application breaking bugs
- 🟡 **Major**: Features not working correctly
- 🟢 **Minor**: UI/UX issues or small inconsistencies

## Active Bugs

### 🔴 Critical Bugs
1. **[BUG-001]** Database Connection Issues
   - **Description**: Application might not connect to local PostgreSQL
   - **Status**: ⏳ Pending
   - **Steps to Reproduce**: 
     1. Start the application
     2. Check console for connection errors
   - **Solution**: Update database connection strings in `.env`

### 🟡 Major Bugs
1. **[BUG-002]** Authentication System
   - **Description**: Login might use Supabase instead of local auth
   - **Status**: ⏳ Pending
   - **Solution**: Implement local authentication using `app_users` table

2. **[BUG-003]** Session Management
   - **Description**: Sessions might not persist properly
   - **Status**: ⏳ Pending
   - **Solution**: Implement proper session handling with PostgreSQL

### 🟢 Minor Bugs
1. **[BUG-004]** UI Responsiveness
   - **Description**: Some pages might not be fully responsive
   - **Status**: ⏳ Pending
   - **Solution**: Review and fix Tailwind CSS classes

## Fixed Bugs

### ✅ Resolved
<!-- Move bugs here once fixed -->

## Bug Resolution Process

1. **Identify**: Run the application and identify the bug
2. **Document**: Add the bug to this tracker with details
3. **Prioritize**: Assign appropriate severity level
4. **Debug**: Use console logs, debugger, and PostgreSQL logs
5. **Fix**: Implement the solution
6. **Test**: Verify the fix works correctly
7. **Update**: Move bug to "Resolved" section

## Debugging Commands

```bash
# Start development environment
./start-dev.sh

# View application logs
npm run dev

# View database logs
npm run db:logs

# Connect to PostgreSQL directly
npm run db:psql

# Check database status
docker-compose ps

# Reset database (if needed)
npm run db:reset
```

## Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5432
lsof -ti:5432 | xargs kill -9
```

### Database Connection Failed
1. Check if Docker is running
2. Verify `.env` file has correct credentials
3. Ensure PostgreSQL container is healthy
4. Check firewall settings

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps
1. Start the development environment
2. Test each feature systematically
3. Document any new bugs found
4. Fix bugs in order of priority
5. Update this tracker as bugs are resolved