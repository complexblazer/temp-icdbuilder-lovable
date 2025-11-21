import { useState, useRef, useEffect } from "react";

export function ResizeHandle({ onDrag, onDoubleClick, orientation = "vertical" }) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const currentPos = orientation === "vertical" ? e.clientX : e.clientY;
      const delta = currentPos - startPosRef.current;
      startPosRef.current = currentPos;
      onDrag(delta);
    };

    const handleMouseUp = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    // Use capture phase to ensure we get the event first
    document.addEventListener("mousemove", handleMouseMove, { capture: true, passive: false });
    document.addEventListener("mouseup", handleMouseUp, { capture: true, passive: false });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove, { capture: true });
      document.removeEventListener("mouseup", handleMouseUp, { capture: true });
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
