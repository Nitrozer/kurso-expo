#!/bin/bash
# Patch expo-pencilkit-ui for GoodNotes-style behavior
# Run after npm install

FILE="node_modules/expo-pencilkit-ui/ios/ExpoPencilKitView.swift"

if [ -f "$FILE" ]; then
  sed -i '' 's/canvasView.drawingPolicy = .anyInput/canvasView.drawingPolicy = .pencilOnly/' "$FILE"
  sed -i '' 's/canvasView.maximumZoomScale = 4.0/canvasView.maximumZoomScale = 5.0/' "$FILE"
  sed -i '' 's/canvasView.bounces = false/canvasView.bounces = true/' "$FILE"
  sed -i '' 's/canvasView.bouncesZoom = false/canvasView.bouncesZoom = true/' "$FILE"
  sed -i '' 's/canvasView.isOpaque = true/canvasView.isOpaque = false/' "$FILE"
  echo "✅ expo-pencilkit-ui patched (pencilOnly, zoom 5x, transparent)"
else
  echo "⚠️ expo-pencilkit-ui not found, skipping patch"
fi
