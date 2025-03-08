import React from 'react';

const DatosVisita = ({ datosVisita, datosFuncionario, updateDatosVisita, updateDatosFuncionario }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={datosVisita.fecha}
            onChange={(e) => updateDatosVisita({ fecha: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hora</label>
          <input
            type="time"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={datosVisita.hora}
            onChange={(e) => updateDatosVisita({ hora: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ciudad</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={datosVisita.ciudad}
            onChange={(e) => updateDatosVisita({ ciudad: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">N° de Visita</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={datosVisita.numeroVisita}
            onChange={(e) => updateDatosVisita({ numeroVisita: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Objetivo de la Visita</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={datosVisita.objetivoVisita}
            onChange={(e) => updateDatosVisita({ objetivoVisita: e.target.value })}
            required
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700">Nombres y Apellidos de quien atiende la visita</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={datosFuncionario.nombreApellido}
            onChange={(e) => updateDatosFuncionario({ nombreApellido: e.target.value })}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default DatosVisita;