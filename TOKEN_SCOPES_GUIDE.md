# GitHub Token Scopes - What to Select

## Required Scopes for Pushing Code

### ✅ MUST SELECT:

1. **`repo`** - Full control of private repositories
   - ✅ This is the MAIN one you need!
   - ✅ Already checked - keep it checked!
   - All sub-scopes under `repo` should be checked:
     - ✅ `repo:status` - Access commit status
     - ✅ `repo_deployment` - Access deployment status
     - ✅ `repo:invite` - Access repository invitations
     - ✅ `security_events` - Read and write security events
   - ⚠️ `public_repo` - Only needed if you have public repos (optional)

### ✅ RECOMMENDED (Already Selected):

2. **`write:packages`** - Upload packages
   - ✅ Already checked - keep it checked
   - Useful for future package management

### ❌ NOT NEEDED (Can Leave Unchecked):

- `workflow` - Only if you use GitHub Actions
- `admin:org` - Only for organization admin tasks
- `user` - Only for user profile management
- `gist` - Only for creating gists
- All other scopes - Not needed for basic repository push

## What You Should See

**Selected (Checked):**
- ✅ `repo` (and all its sub-scopes)
- ✅ `write:packages`

**Not Selected (Unchecked):**
- Everything else

## After Selecting

1. **Fill in "What's this token for?"**: 
   - Type: "TAAWUNAK Repository Push"

2. **Set Expiration**:
   - Choose a date (e.g., 90 days or 1 year)
   - Currently shows: 31.12.2028 (that's fine!)

3. **Click "Generate token"**

4. **IMPORTANT**: Copy the token immediately - you'll only see it once!

5. **After generating, authorize SSO**:
   - You'll see a yellow banner
   - Click "Configure SSO" or "Authorize"
   - Select "TwnkTechOps"
   - Click "Authorize"

## Summary

**Minimum Required:**
- ✅ `repo` (Full control) - MUST HAVE
- ✅ `write:packages` - Nice to have (already selected)

**That's it!** You don't need anything else for pushing code.

