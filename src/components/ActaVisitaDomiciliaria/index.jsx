"use client";
import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DatosVisita from './DatosVisita';
import IdentificacionAdultoMayor from './IdentificacionAdultoMayor';
import DatosFamiliar from './DatosFamiliar';
import ContextoFamiliar from './ContextoFamiliar';
import CondicionesSalud from './CondicionesSalud';
import Observaciones from './Observaciones';
import EvidenciaFotografica from './EvidenciaFotografica';
import FirmaAutorizacion from './FirmaAutorizacion';
import useFormData from '@/components/hooks/useFormData';
import { generarActaPdf } from '@/lib/generarActaPdf';
// Importar directamente las constantes
import { HEADER_LOGO, FOOTER_BANNER } from './logoimages';

const ActaVisitaDomiciliaria = () => {
  const formRef = useRef(null);
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
    updateFirmas,
    updateFotos,
    resetFormData
  } = useFormData();

  const [generandoPdf, setGenerandoPdf] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Guardar en localStorage para demostración
    localStorage.setItem(`visita_${Date.now()}`, JSON.stringify(formData));

    // Aquí podrías enviar a un servidor si hay conexión
    alert('Acta guardada correctamente');
  };

  const handleImprimir = () => {
    // Sin campos obligatorios: el acta puede imprimirse aunque falten datos
    // (frecuente cuando no se encuentra a la persona, la dirección, etc.).
    window.print();
  };

  const handleDescargarPdf = async () => {
    setGenerandoPdf(true);
    try {
      await generarActaPdf(formData);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Ocurrió un error al generar el PDF. Revisa la consola para más detalle.');
    } finally {
      setGenerandoPdf(false);
    }
  };

  const handleLimpiar = () => {
    if (window.confirm('¿Seguro que deseas limpiar toda el acta? Se perderán los datos no guardados.')) {
      resetFormData();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg acta-print">
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
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="print:break-inside-avoid">
            <DatosVisita
              datosVisita={formData.datosVisita}
              datosFuncionario={formData.datosFuncionario}
              updateDatosVisita={updateDatosVisita}
              updateDatosFuncionario={updateDatosFuncionario}
            />
          </div>

          <div className="print:break-inside-avoid">
            <IdentificacionAdultoMayor
              datosAdultoMayor={formData.datosAdultoMayor}
              updateDatosAdultoMayor={updateDatosAdultoMayor}
            />
          </div>

          <div className="print:break-inside-avoid">
            <DatosFamiliar
              datosFamiliares={formData.datosFamiliares}
              updateDatosFamiliares={updateDatosFamiliares}
              addFamiliar={addFamiliar}
              removeFamiliar={removeFamiliar}
            />
          </div>

          <div className="print:break-inside-avoid">
            <ContextoFamiliar
              situacionEncontrada={formData.situacionEncontrada}
              updateSituacionEncontrada={updateSituacionEncontrada}
            />
          </div>

          <div className="print:break-inside-avoid">
            <CondicionesSalud
              antecedentesClinico={formData.antecedentesClinico}
              updateAntecedentesClinico={updateAntecedentesClinico}
            />
          </div>

          <div className="print:break-inside-avoid">
            <Observaciones
              observaciones={formData.observaciones}
              updateObservaciones={updateObservaciones}
            />
          </div>

          <div className="print:break-inside-avoid">
            <EvidenciaFotografica
              fotos={formData.fotos}
              updateFotos={updateFotos}
            />
          </div>

          <FirmaAutorizacion
            firmas={formData.firmas}
            updateFirmas={updateFirmas}
          />

          {/* Botones de acción */}
          <div className="flex flex-wrap justify-end gap-4 mt-6 print:hidden">
            <button
              type="button"
              disabled={generandoPdf}
              className="bg-indigo-600 text-white rounded-md px-6 py-2 font-medium hover:bg-indigo-700 disabled:opacity-60"
              onClick={handleDescargarPdf}
            >
              {generandoPdf ? 'Generando PDF…' : 'Descargar PDF'}
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-800 rounded-md px-6 py-2 font-medium hover:bg-gray-400"
              onClick={handleImprimir}
            >
              Imprimir
            </button>
            <button
              type="button"
              className="bg-red-500 text-white rounded-md px-6 py-2 font-medium hover:bg-red-600"
              onClick={handleLimpiar}
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
