import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Portal({ children }) {
  const el = useRef(document.createElement('div'));

  useEffect(() => {
    const nodo = el.current;
    document.body.appendChild(nodo);
    return () => document.body.removeChild(nodo);
  }, []);

  return createPortal(children, el.current);
}