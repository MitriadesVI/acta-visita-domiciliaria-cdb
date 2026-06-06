import React from 'react';

// Caja de texto de tamaño variable. En pantalla es un <textarea> con scroll;
// en impresión/PDF se renderiza como un bloque que CRECE con el contenido
// (muestra todo el texto, sea 1 párrafo o 5), con borde limpio.
const CajaTexto = ({ value, onChange, placeholder, rows = 6 }) => (
  <>
    <textarea
      className="w-full rounded-md border-gray-300 shadow-sm p-2 border print:hidden"
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
    <div className="hidden print:block w-full border border-gray-500 rounded-md p-2 whitespace-pre-wrap break-words text-sm leading-snug min-h-[2.5rem]">
      {value ? value : ' '}
    </div>
  </>
);

export default CajaTexto;
