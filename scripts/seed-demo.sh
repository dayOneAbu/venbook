#!/bin/bash

# Configuration
URL="http://localhost:3001/api/auth/sign-up/email"
PORT=3001

echo "🚀 Starting Automated Demo Seeding..."

# 1. Reset Database
echo "🧹 Resetting database..."
npx prisma db push --force-reset

# 2. Start Dev Server
echo "⚡ Starting dev server on port $PORT..."
PORT=$PORT npm run dev > /dev/null 2>&1 &
SERVER_PID=$!

# 3. Wait for Server
echo "⏳ Waiting for server to be ready..."
until curl -s "http://localhost:$PORT/api/auth/session" > /dev/null; do
  sleep 2
done
echo "✅ Server is up!"

# 4. Register Demo Accounts via API
emails=(
  "admin@venbook.com"
  "owner@skylight.com"
  "owner@hilton.com"
  "owner@sheraton.com"
  "owner@haile.com"
  "owner@kuriftu.com"
  "owner@harmony.com"
  "owner@jupiter.com"
  "owner@radisson.com"
  "owner@elilly.com"
  "owner@golden.com"
)

for email in "${emails[@]}"
do
  echo "👤 Registering $email..."
  curl -s -X POST $URL \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$email\",
      \"password\": \"password123\",
      \"name\": \"Demo User\"
    }" > /dev/null
done

# 5. Run High-Scale Relational Seeding
echo "📊 Seeding high-scale relational data..."
npx tsx prisma/seed-high-scale.ts

# 6. Cleanup
echo "🛑 Stopping dev server..."
kill $SERVER_PID

echo "✨ Demo seeding complete! You can now run 'npm run dev' to start the application."
