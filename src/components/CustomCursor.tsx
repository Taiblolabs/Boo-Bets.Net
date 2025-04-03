import { useState, useEffect } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === 'BUTTON' || 
        target.classList.contains('cursor-pointer') ||
        getComputedStyle(target).cursor === 'pointer';
        
      setIsHovering(isClickable);
    };
    
    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    
    // Ocultar el cursor predeterminado
    document.body.style.cursor = 'none';
    
    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      
      // Restaurar el cursor predeterminado
      document.body.style.cursor = 'auto';
    };
  }, []);
  
  return (
    <div 
      className={`custom-cursor ${isHovering ? 'hover' : ''} ${isClicking ? 'clicking' : ''}`} 
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      }}
    />
  );
};

export default CustomCursor; 