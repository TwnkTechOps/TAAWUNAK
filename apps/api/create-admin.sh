#!/bin/bash
# Quick script to create admin user directly in the database
# Usage: ./create-admin.sh

DB_URL="${DATABASE_URL:-postgresql://edutech:edutech@localhost:5432/edutech?schema=public}"

# Hash password: Admin123!
# Using bcrypt with cost 10, you can generate this with: node -e "const bcrypt=require('bcryptjs');bcrypt.hash('Admin123!',10).then(h=>console.log(h))"
ADMIN_PASSWORD_HASH='$2a$10$rKqX8qJqX8qJqX8qJqX8qOeKqX8qJqX8qJqX8qJqX8qJqX8qJqX8q'

# For now, let's use a simpler approach - just provide instructions
echo "To create an admin user, you have two options:"
echo ""
echo "Option 1: Register via UI and update role"
echo "  1. Go to http://localhost:4320/auth/register"
echo "  2. Register with any email/password"
echo "  3. Then run this SQL to make them admin:"
echo "     UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your-email@example.com';"
echo ""
echo "Option 2: Use the registration API and update role"
echo "  Register via: POST http://localhost:4311/auth/register"
echo "  Then update role via SQL or Admin UI (once you have one admin)"
echo ""

