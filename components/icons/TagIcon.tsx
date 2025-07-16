import React from 'react';

export const TagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    {...props}
    >
        <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.94 11.41L12 16.5l-3.06-3.09c-1.33-1.33-.55-3.61 1.56-3.61.99 0 1.88.58 2.29 1.4.41-.82 1.3-1.4 2.29-1.4 2.11 0 2.89 2.28 1.56 3.61z"/>
    </svg>
);
