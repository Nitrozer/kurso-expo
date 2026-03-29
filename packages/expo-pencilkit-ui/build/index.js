import { requireNativeModule, requireNativeViewManager, } from "expo-modules-core";
import React, { useImperativeHandle, useRef } from "react";
import { Platform, findNodeHandle } from "react-native";
let ExpoPencilKit = null;
let ExpoPencilKitViewManager = null;
if (Platform.OS === "ios") {
    ExpoPencilKit = requireNativeModule("ExpoPencilKitModule");
    ExpoPencilKitViewManager = requireNativeViewManager("ExpoPencilKitModule");
}
/**
 * PencilKit View Component
 */
export const PencilKitView = React.forwardRef((props, ref) => {
    const viewRef = useRef(null);
    useImperativeHandle(ref, () => ({
        setupToolPicker: async () => {
            if (Platform.OS === "ios" &&
                ExpoPencilKit &&
                viewRef.current) {
                const viewTag = findNodeHandle(viewRef.current);
                if (viewTag) {
                    await ExpoPencilKit.setupToolPicker(viewTag);
                }
            }
        },
        clearDrawing: async () => {
            if (Platform.OS === "ios" &&
                ExpoPencilKit &&
                viewRef.current) {
                const viewTag = findNodeHandle(viewRef.current);
                if (viewTag) {
                    await ExpoPencilKit.clearDrawing(viewTag);
                }
            }
        },
        undo: async () => {
            if (Platform.OS === "ios" &&
                ExpoPencilKit &&
                viewRef.current) {
                const viewTag = findNodeHandle(viewRef.current);
                if (viewTag) {
                    await ExpoPencilKit.undo(viewTag);
                }
            }
        },
        redo: async () => {
            if (Platform.OS === "ios" &&
                ExpoPencilKit &&
                viewRef.current) {
                const viewTag = findNodeHandle(viewRef.current);
                if (viewTag) {
                    await ExpoPencilKit.redo(viewTag);
                }
            }
        },
        captureDrawing: async () => {
            if (Platform.OS === "ios" &&
                ExpoPencilKit &&
                viewRef.current) {
                const viewTag = findNodeHandle(viewRef.current);
                if (viewTag) {
                    return await ExpoPencilKit.captureDrawing(viewTag);
                }
            }
            return "";
        },
        getCanvasDataAsBase64: async () => {
            if (Platform.OS === "ios" &&
                ExpoPencilKit &&
                viewRef.current) {
                const viewTag = findNodeHandle(viewRef.current);
                if (viewTag) {
                    return await ExpoPencilKit.getCanvasDataAsBase64(viewTag);
                }
            }
            return "";
        },
        setCanvasDataFromBase64: async (base64String) => {
            if (Platform.OS === "ios" &&
                ExpoPencilKit &&
                viewRef.current) {
                const viewTag = findNodeHandle(viewRef.current);
                if (viewTag) {
                    return await ExpoPencilKit.setCanvasDataFromBase64(viewTag, base64String);
                }
            }
            return false;
        },
        canUndo: async () => {
            if (Platform.OS === "ios" &&
                ExpoPencilKit &&
                viewRef.current) {
                const viewTag = findNodeHandle(viewRef.current);
                if (viewTag) {
                    return await ExpoPencilKit.canUndo(viewTag);
                }
            }
            return false;
        },
        canRedo: async () => {
            if (Platform.OS === "ios" &&
                ExpoPencilKit &&
                viewRef.current) {
                const viewTag = findNodeHandle(viewRef.current);
                if (viewTag) {
                    return await ExpoPencilKit.canRedo(viewTag);
                }
            }
            return false;
        },
        setCanvasBackgroundColor: async (colorString) => {
            if (Platform.OS === "ios" &&
                ExpoPencilKit &&
                viewRef.current) {
                const viewTag = findNodeHandle(viewRef.current);
                if (viewTag) {
                    await ExpoPencilKit.setCanvasBackgroundColor(viewTag, colorString);
                }
            }
        },
        getCanvasBackgroundColor: async () => {
            if (Platform.OS === "ios" &&
                ExpoPencilKit &&
                viewRef.current) {
                const viewTag = findNodeHandle(viewRef.current);
                if (viewTag) {
                    return await ExpoPencilKit.getCanvasBackgroundColor(viewTag);
                }
            }
            return "#FFFFFF";
        },
        showColorPicker: async () => {
            if (Platform.OS === "ios" &&
                ExpoPencilKit &&
                viewRef.current) {
                const viewTag = findNodeHandle(viewRef.current);
                if (viewTag) {
                    await ExpoPencilKit.showColorPicker(viewTag);
                }
            }
        },
    }), []);
    if (Platform.OS !== "ios" || !ExpoPencilKitViewManager) {
        return null;
    }
    return React.createElement(ExpoPencilKitViewManager, {
        ...props,
        ref: viewRef,
    });
});
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map