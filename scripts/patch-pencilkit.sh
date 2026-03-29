#!/bin/bash
# Patch expo-pencilkit-ui for GoodNotes-style behavior
# Run after npm install

DIR="node_modules/expo-pencilkit-ui"
FILE="$DIR/ios/ExpoPencilKitView.swift"

# Ensure build directory exists (npm sometimes strips it)
if [ -d "$DIR" ] && [ ! -f "$DIR/build/index.js" ]; then
  mkdir -p "$DIR/build"
  # Download and extract build files if missing
  npm pack expo-pencilkit-ui@1.0.4 --pack-destination /tmp --silent 2>/dev/null
  if [ -f "/tmp/expo-pencilkit-ui-1.0.4.tgz" ]; then
    tar xzf /tmp/expo-pencilkit-ui-1.0.4.tgz -C /tmp 2>/dev/null
    cp /tmp/package/build/* "$DIR/build/" 2>/dev/null
    rm -rf /tmp/package /tmp/expo-pencilkit-ui-1.0.4.tgz
    echo "✅ expo-pencilkit-ui build files restored"
  fi
fi

# Patch Swift for GoodNotes behavior
if [ -f "$FILE" ]; then
  sed -i '' 's/canvasView.drawingPolicy = .anyInput/canvasView.drawingPolicy = .pencilOnly/' "$FILE"
  sed -i '' 's/canvasView.maximumZoomScale = 4.0/canvasView.maximumZoomScale = 5.0/' "$FILE"
  sed -i '' 's/canvasView.bounces = false/canvasView.bounces = true/' "$FILE"
  sed -i '' 's/canvasView.bouncesZoom = false/canvasView.bouncesZoom = true/' "$FILE"
  sed -i '' 's/canvasView.isOpaque = true/canvasView.isOpaque = false/' "$FILE"
  echo "✅ expo-pencilkit-ui patched (pencilOnly, zoom 5x, transparent)"
else
  echo "⚠️ expo-pencilkit-ui Swift file not found, skipping patch"
fi
