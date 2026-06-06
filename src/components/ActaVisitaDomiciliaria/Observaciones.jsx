import React from 'react';
import CajaTexto from './CajaTexto';

const Observaciones = ({ observaciones, updateObservaciones }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold text-lg mb-4 text-center bg-gray-200 py-1">5. OBSERVACIONES</h3>
      <CajaTexto
        value={observaciones}
        onChange={updateObservaciones}
        rows={5}
        placeholder="Observaciones adicionales..."
      />
    </div>
  );
};

export default Observaciones;
