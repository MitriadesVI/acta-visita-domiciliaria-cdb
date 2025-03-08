import React from 'react';

const DatosFamiliar = ({ datosFamiliares, updateDatosFamiliares, addFamiliar, removeFamiliar }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold text-lg mb-4 text-center bg-gray-200 py-1">2. DATOS DE FAMILIARES ENCONTRADOS</h3>
      {datosFamiliares.map((familiar, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-300">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Nombres y Apellidos</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={familiar.nombreApellido}
              onChange={(e) => updateDatosFamiliares(index, { nombreApellido: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Parentesco</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={familiar.parentesco}
              onChange={(e) => updateDatosFamiliares(index, { parentesco: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={familiar.direccion}
              onChange={(e) => updateDatosFamiliares(index, { direccion: e.target.value })}
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                value={familiar.telefono}
                onChange={(e) => updateDatosFamiliares(index, { telefono: e.target.value })}
              />
            </div>
            {index > 0 && (
              <button
                type="button"
                className="bg-red-500 text-white rounded-md px-2 py-2 mb-1"
                onClick={() => removeFamiliar(index)}
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      ))}
      <button
        type="button"
        className="bg-blue-500 text-white rounded-md px-4 py-2 mt-2"
        onClick={addFamiliar}
      >
        Agregar Familiar
      </button>
    </div>
  );
};

export default DatosFamiliar;