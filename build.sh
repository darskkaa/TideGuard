#!/bin/bash
set -e

# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install --frozen-lockfile

# Build
cd Aesthetic-Vision && pnpm run build
