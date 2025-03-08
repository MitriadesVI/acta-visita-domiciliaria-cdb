import React from 'react';

const IdentificacionAdultoMayor = ({ datosAdultoMayor, updateDatosAdultoMayor }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold text-lg mb-4 text-center bg-gray-200 py-1">1. IDENTIFICACIÓN DEL ADULTO MAYOR</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombres y Apellidos</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={datosAdultoMayor.nombreApellido}
            onChange={(e) => updateDatosAdultoMayor({ nombreApellido: e.target.value })}
            required
          />
        </div>
        <div className="flex gap-2">
          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-700">Tipo Doc.</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={datosAdultoMayor.tipoDocumento}
              onChange={(e) => updateDatosAdultoMayor({ tipoDocumento: e.target.value })}
              required
            >
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="TI">TI</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="w-2/3">
            <label className="block text-sm font-medium text-gray-700">N° Documento</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={datosAdultoMayor.numeroDocumento}
              onChange={(e) => updateDatosAdultoMayor({ numeroDocumento: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dirección</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={datosAdultoMayor.direccion}
            onChange={(e) => updateDatosAdultoMayor({ direccion: e.target.value })}
            required
          />
        </div>
        <div className="flex gap-2">
          <div className="w-2/3">
            <label className="block text-sm font-medium text-gray-700">Barrio</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={datosAdultoMayor.barrio}
              onChange={(e) => updateDatosAdultoMayor({ barrio: e.target.value })}
              required
            />
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={datosAdultoMayor.telefono}
              onChange={(e) => updateDatosAdultoMayor({ telefono: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={datosAdultoMayor.fechaNacimiento}
              onChange={(e) => updateDatosAdultoMayor({ fechaNacimiento: e.target.value })}
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700">Edad</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-50"
              value={datosAdultoMayor.edad}
              readOnly
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-700">Sexo</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={datosAdultoMayor.sexo}
              onChange={(e) => updateDatosAdultoMayor({ sexo: e.target.value })}
              required
            >
              <option value="">Seleccione</option>
              <option value="F">F</option>
              <option value="M">M</option>
            </select>
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-700">Tipo Sangre</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={datosAdultoMayor.tipoSangre}
              onChange={(e) => updateDatosAdultoMayor({ tipoSangre: e.target.value })}
            >
              <option value="">Seleccione</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-700">Estado Civil</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={datosAdultoMayor.estadoCivil}
              onChange={(e) => updateDatosAdultoMayor({ estadoCivil: e.target.value })}
              required
            >
              <option value="Soltero">Soltero</option>
              <option value="Casado">Casado</option>
              <option value="U. Libre">U. Libre</option>
              <option value="Viudo">Viudo</option>
              <option value="Separado">Separado</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SISBEN</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="sisben"
                checked={datosAdultoMayor.sisben === true}
                onChange={() => updateDatosAdultoMayor({ sisben: true })}
              />
              <span className="ml-2">Si</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="sisben"
                checked={datosAdultoMayor.sisben === false}
                onChange={() => updateDatosAdultoMayor({ sisben: false })}
              />
              <span className="ml-2">No</span>
            </label>
            {datosAdultoMayor.sisben && (
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Grupo SISBEN"
                  className="block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={datosAdultoMayor.grupoSisben || ''}
                  onChange={(e) => updateDatosAdultoMayor({ grupoSisben: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700">EPS</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={datosAdultoMayor.eps}
              onChange={(e) => updateDatosAdultoMayor({ eps: e.target.value })}
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700">Condición de Discapacidad</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={datosAdultoMayor.condicionDiscapacidad}
              onChange={(e) => updateDatosAdultoMayor({ condicionDiscapacidad: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentificacionAdultoMayor;