import React from 'react';

const CondicionesSalud = ({ antecedentesClinico, updateAntecedentesClinico }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold text-lg mb-4 text-center bg-gray-200 py-1">4. CONDICIONES DE SALUD</h3>
      
      <div className="mb-4">
        <h4 className="font-medium text-md mb-2 text-gray-700">Salud Física</h4>
        <textarea
          className="w-full h-32 rounded-md border-gray-300 shadow-sm p-2 border"
          value={antecedentesClinico.saludFisica}
          onChange={(e) => updateAntecedentesClinico({ saludFisica: e.target.value })}
          placeholder="Describa las condiciones de salud física, diagnósticos, tratamientos, etc."
        />
      </div>
      
      <div>
        <h4 className="font-medium text-md mb-2 text-gray-700">Salud Mental</h4>
        <textarea
          className="w-full h-32 rounded-md border-gray-300 shadow-sm p-2 border"
          value={antecedentesClinico.saludMental}
          onChange={(e) => updateAntecedentesClinico({ saludMental: e.target.value })}
          placeholder="Describa las condiciones de salud mental, estado cognitivo, emocional, etc."
        />
      </div>
    </div>
  );
};

export default CondicionesSalud;