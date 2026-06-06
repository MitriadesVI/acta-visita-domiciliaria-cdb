import React from 'react';
import CajaTexto from './CajaTexto';

const CondicionesSalud = ({ antecedentesClinico, updateAntecedentesClinico }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold text-lg mb-4 text-center bg-gray-200 py-1">4. CONDICIONES DE SALUD</h3>

      <div className="mb-4">
        <h4 className="font-medium text-md mb-2 text-gray-700">Salud Física</h4>
        <CajaTexto
          value={antecedentesClinico.saludFisica}
          onChange={(v) => updateAntecedentesClinico({ saludFisica: v })}
          rows={5}
          placeholder="Describa las condiciones de salud física, diagnósticos, tratamientos, etc."
        />
      </div>

      <div>
        <h4 className="font-medium text-md mb-2 text-gray-700">Salud Mental</h4>
        <CajaTexto
          value={antecedentesClinico.saludMental}
          onChange={(v) => updateAntecedentesClinico({ saludMental: v })}
          rows={5}
          placeholder="Describa las condiciones de salud mental, estado cognitivo, emocional, etc."
        />
      </div>
    </div>
  );
};

export default CondicionesSalud;
