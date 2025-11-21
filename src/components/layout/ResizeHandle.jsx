import { useState, useRef, useEffect } from "react";

export function ResizeHandle({ onDrag, onDoubleClick, orientation = "vertical", style }) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isDragging) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const handleMouseMove = (e) => {
      e.preventDefault(); // ✅ Prevents browser drag interference
      e.stopPropagation(); // ✅ Stops event bubbling
      
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

    const handleMouseUp = (e) => {
      e.preventDefault(); // ✅ Prevents default behavior
      e.stopPropagation(); // ✅ Stops event bubbling
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsDragging(false);
    };

    // ✅ Use capture phase for reliable event handling
    window.addEventListener("mousemove", handleMouseMove, { passive: false, capture: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: false, capture: true });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      window.removeEventListener("mousemove", handleMouseMove, { capture: true });
      window.removeEventListener("mouseup", handleMouseUp, { capture: true });
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
      style={{
        ...style, // ✅ Apply parent styles (grid positioning)
        // ✅ Reduce repaints during drag
        willChange: isDragging ? 'background' : 'auto',
        userSelect: 'none', // ✅ Prevent text selection
      }}
    />
  );
}
