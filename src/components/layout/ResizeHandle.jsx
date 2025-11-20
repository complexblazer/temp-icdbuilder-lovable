import { useState, useRef, useEffect } from 'react';

export function ResizeHandle({ onDrag, onDoubleClick, orientation = 'vertical' }) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const currentPos = orientation === 'vertical' ? e.clientX : e.clientY;
      const delta = currentPos - startPosRef.current;
      startPosRef.current = currentPos;
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
  }, [isDragging, onDrag, orientation]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    startPosRef.current = orientation === 'vertical' ? e.clientX : e.clientY;
    setIsDragging(true);
  };

  return (
    <div
      className={`resize-handle ${orientation} ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
    />
  );
}
