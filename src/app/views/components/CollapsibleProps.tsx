import React, { useState } from 'react';

interface CollapsibleProps {
  children: React.ReactNode;
  type: 'object' | 'array';
}

const Collapsible: React.FC<CollapsibleProps> = ({ children, type }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative pl-6 my-1">
      {/* Arrow container with absolute positioning */}
      <div 
        className="absolute left-0 top-0 w-6 h-6 flex items-center justify-center cursor-pointer select-none bg-white"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        contentEditable={false}
        suppressContentEditableWarning={true}
      >
        <span className="text-gray-500 pointer-events-none">
          {isOpen ? '▼' : '▶'}
        </span>
      </div>

      {/* Opening brace/bracket */}
      <span className="select-none">{type === 'object' ? '{' : '['}</span>

      {/* Content container */}
      <div className={`
        pl-4 
        ${isOpen ? 'block' : 'hidden'}
      `}>
        {children}
      </div>

      {/* Closing brace/bracket */}
      <span className="select-none">{type === 'object' ? '}' : ']'}</span>

      <style jsx>{`
        /* Opcional: Estilos específicos para los triángulos */
        span {
          font-size: 0.8em;
          line-height: 1;
        }
      `}</style>
    </div>
  );
};

export default Collapsible;