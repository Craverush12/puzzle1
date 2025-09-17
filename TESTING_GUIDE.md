# 🧪 Complete Testing Guide

## Method 1: Using Test Component (Quick Tests)

### Current Test Component Buttons:
1. **✅ Test Connection** - You've already done this
2. **Test Submit** - Click this to submit a test score
3. **Test Fetch** - Click this to retrieve leaderboard data

### What Each Test Does:
- **Test Submit**: Creates a test entry with:
  - Name: "Test User"
  - City: "Riyadh" 
  - Puzzle: "test-puzzle"
  - Time: 30 seconds
- **Test Fetch**: Retrieves and displays all leaderboard entries

## Method 2: Full App Flow Testing (Recommended)

### Step-by-Step Complete Test:

1. **Start Screen**
   - Click "Begin" button
   - Should navigate to user info screen

2. **User Info Screen**
   - Enter a test name (e.g., "Ahmed")
   - Select city: "Jeddah" or "Riyadh"
   - Click "Continue"
   - Should navigate to puzzle selection

3. **Puzzle Selection Screen**
   - Click on any puzzle
   - Should navigate to puzzle game

4. **Puzzle Game Screen**
   - Complete the puzzle (drag pieces to correct positions)
   - Timer should be running
   - When complete, should show completion screen

5. **Completion Screen**
   - Should show completion time
   - Click "View Leaderboard"
   - This submits your score to Supabase!

6. **Leaderboard Screen**
   - Should show your score in the list
   - Should be sorted by fastest time
   - Your test score should appear

## Method 3: Database Verification

### Check Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. Click on **leaderboard** table
4. You should see your test entries

### Expected Data Structure:
```
id | name      | city    | puzzle_id    | completion_time | created_at
1  | Test User | Riyadh  | test-puzzle  | 30000          | 2024-01-15 10:30:00
2  | Ahmed     | Jeddah  | puzzle-1     | 45000          | 2024-01-15 10:35:00
```

## Method 4: Multiple User Testing

### Test Multiple Scores:
1. Complete the full flow with different names:
   - "Ahmed" from "Jeddah" - take your time (slow score)
   - "Sara" from "Riyadh" - complete quickly (fast score)
   - "Omar" from "Jeddah" - medium speed

2. Check leaderboard shows them in correct order (fastest first)

## Method 5: Error Testing

### Test Fallback Behavior:
1. Temporarily break Supabase connection (wrong URL in .env.local)
2. Complete a puzzle
3. Should still work with localStorage fallback
4. Check browser console for fallback messages

## What to Look For:

### ✅ Success Indicators:
- Test Submit shows "Test score submitted successfully!"
- Test Fetch shows number of entries retrieved
- Full flow completes without errors
- Leaderboard shows your scores
- Supabase dashboard shows new entries

### ❌ Error Indicators:
- Console errors about Supabase connection
- "Failed to submit" messages
- Empty leaderboard when you know there should be data
- Network errors in browser dev tools

## Debugging Tips:

### Check Browser Console:
- Open Developer Tools (F12)
- Look for Supabase-related messages
- Check for any error messages

### Check Network Tab:
- Look for requests to your Supabase URL
- Check if requests are successful (200 status)
- Look for any failed requests

### Check Supabase Dashboard:
- Verify table exists
- Check if RLS policies are correct
- Look for any error logs

## Expected Results:

After testing, you should see:
1. ✅ Supabase connection working
2. ✅ Test scores being submitted
3. ✅ Leaderboard data being retrieved
4. ✅ Full app flow working end-to-end
5. ✅ Data persisting in Supabase database
