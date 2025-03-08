import React from 'react';

const Observaciones = ({ observaciones, updateObservaciones }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold text-lg mb-4 text-center bg-gray-200 py-1">5. OBSERVACIONES</h3>
      <textarea
        className="w-full h-32 rounded-md border-gray-300 shadow-sm p-2 border"
        value={observaciones}
        onChange={(e) => updateObservaciones(e.target.value)}
        placeholder="Observaciones adicionales..."
      />
    </div>
  );
};

export default Observaciones;