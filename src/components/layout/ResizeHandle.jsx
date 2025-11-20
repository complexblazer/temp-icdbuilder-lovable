import { useState, useRef, useEffect } from 'react';

export function ResizeHandle({ onDrag, onDoubleClick }) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const delta = e.clientX - startXRef.current;
      startXRef.current = e.clientX;
      onDrag(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onDrag]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    setIsDragging(true);
  };

  return (
    <div
      className={`resize-handle ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
    />
  );
}
