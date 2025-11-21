import { useState, useRef, useEffect } from "react";

export function ResizeHandle({ onDrag, onDoubleClick, orientation = "vertical" }) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isDragging) {
      // Cancel any pending animation frame when drag stops
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const handleMouseMove = (e) => {
      // Use requestAnimationFrame to throttle updates and ensure smooth dragging
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const currentPos = orientation === "vertical" ? e.clientX : e.clientY;
        const delta = currentPos - startPosRef.current;
        startPosRef.current = currentPos;
        onDrag(delta);
      });
    };

    const handleMouseUp = () => {
      // Immediately cancel any pending frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsDragging(false);
    };

    // Add listeners to window to ensure we catch mouseup even if cursor leaves element
    window.addEventListener("mousemove", handleMouseMove, { passive: false });
    window.addEventListener("mouseup", handleMouseUp, { passive: false });

    return () => {
      // Clean up animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onDrag, orientation]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    startPosRef.current = orientation === "vertical" ? e.clientX : e.clientY;
    setIsDragging(true);
  };

  return (
    <div
      className={`resize-handle ${orientation} ${isDragging ? "dragging" : ""}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
    />
  );
}
