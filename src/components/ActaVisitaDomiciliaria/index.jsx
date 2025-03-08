"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DatosVisita from './DatosVisita';
import IdentificacionAdultoMayor from './IdentificacionAdultoMayor';
import DatosFamiliar from './DatosFamiliar';
import ContextoFamiliar from './ContextoFamiliar';
import CondicionesSalud from './CondicionesSalud';
import Observaciones from './Observaciones';
import FirmaAutorizacion from './FirmaAutorizacion';
import useFormData from '@/components/hooks/useFormData';
// Importar directamente las constantes
import { HEADER_LOGO, FOOTER_BANNER } from './logoimages';

const ActaVisitaDomiciliaria = () => {
  const { 
    formData, 
    updateDatosVisita, 
    updateDatosFuncionario,
    updateDatosAdultoMayor,
    updateDatosFamiliares,
    addFamiliar,
    removeFamiliar,
    updateSituacionEncontrada,
    updateAntecedentesClinico,
    updateObservaciones,
    updateFirmas
  } = useFormData();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Guardar en localStorage para demostración
    localStorage.setItem(`visita_${Date.now()}`, JSON.stringify(formData));
    
    // Aquí podrías enviar a un servidor si hay conexión
    alert('Acta guardada correctamente');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
      <CardContent className="p-6">
        {/* Usar HEADER_LOGO como una sola imagen para el encabezado */}
        <div className="mb-6">
          <img 
            src={HEADER_LOGO} 
            alt="Encabezado Alcaldía de Barranquilla" 
            className="w-full" 
          />
        </div>

        {/* Título y contenido del formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <DatosVisita 
            datosVisita={formData.datosVisita}
            datosFuncionario={formData.datosFuncionario}
            updateDatosVisita={updateDatosVisita}
            updateDatosFuncionario={updateDatosFuncionario}
          />
          
          <IdentificacionAdultoMayor
            datosAdultoMayor={formData.datosAdultoMayor}
            updateDatosAdultoMayor={updateDatosAdultoMayor}
          />
          
          <DatosFamiliar
            datosFamiliares={formData.datosFamiliares}
            updateDatosFamiliares={updateDatosFamiliares}
            addFamiliar={addFamiliar}
            removeFamiliar={removeFamiliar}
          />
          
          <ContextoFamiliar
            situacionEncontrada={formData.situacionEncontrada}
            updateSituacionEncontrada={updateSituacionEncontrada}
          />
          
          <CondicionesSalud
            antecedentesClinico={formData.antecedentesClinico}
            updateAntecedentesClinico={updateAntecedentesClinico}
          />
          
          <Observaciones
            observaciones={formData.observaciones}
            updateObservaciones={updateObservaciones}
          />
          
          <FirmaAutorizacion
            firmas={formData.firmas}
            updateFirmas={updateFirmas}
          />

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              className="bg-gray-300 text-gray-800 rounded-md px-6 py-2 font-medium hover:bg-gray-400"
              onClick={() => window.print()}
            >
              Imprimir
            </button>
            <button
              type="reset"
              className="bg-red-500 text-white rounded-md px-6 py-2 font-medium hover:bg-red-600"
            >
              Limpiar
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white rounded-md px-6 py-2 font-medium hover:bg-green-700"
            >
              Guardar
            </button>
          </div>
        </form>

        {/* Pie de página con la imagen del footer */}
        <div className="mt-12">
          <img 
            src={FOOTER_BANNER} 
            alt="Pie de página Alcaldía de Barranquilla" 
            className="w-full" 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActaVisitaDomiciliaria;