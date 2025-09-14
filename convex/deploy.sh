#!/bin/bash

# Deploy Convex functions
echo "Deploying Convex functions..."
npx convex deploy

# Generate types
echo "Generating TypeScript types..."
npx convex codegen

echo "Convex deployment complete!"