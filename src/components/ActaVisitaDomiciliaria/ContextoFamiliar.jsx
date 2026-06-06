import React from 'react';
import CajaTexto from './CajaTexto';

const ContextoFamiliar = ({ situacionEncontrada, updateSituacionEncontrada }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold text-lg mb-4 text-center bg-gray-200 py-1">3. CONTEXTO FAMILIAR, REDES DE APOYO Y CONDICIONES SOCIOECONÓMICAS</h3>
      <CajaTexto
        value={situacionEncontrada}
        onChange={updateSituacionEncontrada}
        rows={7}
        placeholder="Describa el contexto familiar, las redes de apoyo y las condiciones socioeconómicas del adulto mayor..."
      />
    </div>
  );
};

export default ContextoFamiliar;
