#!/bin/bash

# setup.sh - ProManage SaaS Setup Script

set -e

echo “🚀 Setting up ProManage SaaS - Phase 3”
echo “=======================================”

# Colors for output

RED=’\033[0;31m’
GREEN=’\033[0;32m’
BLUE=’\033[0;34m’
YELLOW=’\033[1;33m’
NC=’\033[0m’ # No Color

# Check if Node.js is installed

if ! command -v node &> /dev/null; then
echo -e “${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}”
exit 1
fi

# Check Node.js version

NODE_VERSION=$(node -v | cut -d’v’ -f2 | cut -d’.’ -f1)
if [ “$NODE_VERSION” -lt 18 ]; then
echo -e “${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}”
exit 1
fi

echo -e “${GREEN}✅ Node.js $(node -v) detected${NC}”

# Create project structure

echo -e “${BLUE}📁 Creating project structure…${NC}”
mkdir -p promanage-saas/api/src/{projects,tasks,views,files,custom-fields}/{entities,dto,services,controllers}
mkdir -p promanage-saas/{web,shared,docs,devops,db}

cd promanage-saas/api

# Create package.json if it doesn’t exist

if [ ! -f “package.json” ]; then
echo -e “${BLUE}📦 Creating package.json…${NC}”
cat > package.json << ‘EOF’
{
“name”: “promanage-api”,
“version”: “1.0.0”,
“description”: “ProManage SaaS - Multi-tenant Project Management API”,
“author”: “ProManage Team”,
“private”: true,
“license”: “MIT”,
“scripts”: {
“build”: “nest build”,
“format”: “prettier –write "src/**/*.ts" "test/**/*.ts"”,
“start”: “nest start”,
“start:dev”: “nest start –watch”,
“start:debug”: “nest start –debug –watch”,
“start:prod”: “node dist/main”,
“lint”: “eslint "{src,apps,libs,test}/**/*.ts" –fix”,
“test”: “jest”,
“test:watch”: “jest –watch”,
“test:cov”: “jest –coverage”,
“test:debug”: “node –inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest –runInBand”,
“test:e2e”: “jest –config ./test/jest-e2e.json”,
“db:setup”: “npm run docker:up && sleep 5 && npm run db:create”,
“db:create”: “npm run typeorm schema:sync”,
“db:seed”: “ts-node src/database/seeds/index.ts”,
“db:reset”: “npm run typeorm schema:drop && npm run db:create”,
“docker:up”: “docker-compose up -d”,
“docker:down”: “docker-compose down”
},
“dependencies”: {
“@nestjs/common”: “^10.0.0”,
“@nestjs/core”: “^10.0.0”,
“@nestjs/platform-express”: “^10.0.0”,
“@nestjs/typeorm”: “^10.0.0”,
“@nestjs/config”: “^3.0.0”,
“@nestjs/swagger”: “^7.0.0”,
“@nestjs/cache-manager”: “^2.0.0”,
“@nestjs/throttler”: “^5.0.0”,
“@nestjs/schedule”: “^4.0.0”,
“@nestjs/jwt”: “^10.0.0”,
“@nestjs/passport”: “^10.0.0”,
“typeorm”: “^0.3.17”,
“pg”: “^8.11.0”,
“redis”: “^4.6.0”,
“cache-manager”: “^5.2.0”,
“cache-manager-redis-store”: “^3.0.1”,
“@aws-sdk/client-s3”: “^3.400.0”,
“@aws-sdk/s3-request-presigner”: “^3.400.0”,
“sharp”: “^0.32.0”,
“class-validator”: “^0.14.0”,
“class-transformer”: “^0.5.0”,
“bcrypt”: “^5.1.0”,
“passport”: “^0.6.0”,
“passport-jwt”: “^4.0.1”,
“passport-local”: “^1.0.0”,
“mime-types”: “^2.1.35”,
“uuid”: “^9.0.0”,
“reflect-metadata”: “^0.1.13”,
“rxjs”: “^7.8.1”
},
“devDependencies”: {
“@nestjs/cli”: “^10.0.0”,
“@nestjs/schematics”: “^10.0.0”,
“@nestjs/testing”: “^10.0.0”,
“@types/express”: “^4.17.17”,
“@types/jest”: “^29.5.2”,
“@types/node”: “^20.3.1”,
“@types/supertest”: “^2.0.12”,
“@types/bcrypt”: “^5.0.0”,
“@types/passport-jwt”: “^3.0.9”,
“@types/passport-local”: “^1.0.35”,
“@types/mime-types”: “^2.1.1”,
“@types/uuid”: “^9.0.2”,
“@typescript-eslint/eslint-plugin”: “^6.0.0”,
“@typescript-eslint/parser”: “^6.0.0”,
“eslint”: “^8.42.0”,
“eslint-config-prettier”: “^9.0.0”,
“eslint-plugin-prettier”: “^5.0.0”,
“jest”: “^29.5.0”,
“prettier”: “^3.0.0”,
“source-map-support”: “^0.5.21”,
“supertest”: “^6.3.3”,
“ts-jest”: “^29.1.0”,
“ts-loader”: “^9.4.3”,
“ts-node”: “^10.9.1”,
“tsconfig-paths”: “^4.2.1”,
“typescript”: “^5.1.3”
}
}
EOF
fi

# Install dependencies

echo -e “${BLUE}📥 Installing dependencies…${NC}”
npm install

# Create environment file

if [ ! -f “.env” ]; then
echo -e “${BLUE}⚙️  Creating environment file…${NC}”
cat > .env << ‘EOF’
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

# Database

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=promanage
DB_SYNCHRONIZE=true
DB_LOGGING=true

# Redis

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d

# AWS S3

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET=promanage-files-dev

# File Upload

FILE_MAX_SIZE=104857600
FILE_ALLOWED_TYPES=image/*,application/pdf,text/*

# Rate Limiting

THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Security

CORS_ORIGIN=http://localhost:3000
BCRYPT_ROUNDS=12

# Monitoring

LOG_LEVEL=debug
ENABLE_SWAGGER=true
EOF
fi

# Create TypeScript config

if [ ! -f “tsconfig.json” ]; then
echo -e “${BLUE}📝 Creating TypeScript configuration…${NC}”
cat > tsconfig.json << ‘EOF’
{
“compilerOptions”: {
“module”: “commonjs”,
“declaration”: true,
“removeComments”: true,
“emitDecoratorMetadata”: true,
“experimentalDecorators”: true,
“allowSyntheticDefaultImports”: true,
“target”: “ES2021”,