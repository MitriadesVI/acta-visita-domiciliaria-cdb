"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FolderOpen, FilePlus, Check, Loader2 } from 'lucide-react';
import DatosVisita from './DatosVisita';
import IdentificacionAdultoMayor from './IdentificacionAdultoMayor';
import DatosFamiliar from './DatosFamiliar';
import ContextoFamiliar from './ContextoFamiliar';
import CondicionesSalud from './CondicionesSalud';
import Observaciones from './Observaciones';
import EvidenciaFotografica from './EvidenciaFotografica';
import FirmaAutorizacion from './FirmaAutorizacion';
import MisActas from './MisActas';
import useFormData from '@/components/hooks/useFormData';
import { guardarActa, obtenerActa, tieneDatos, ESTADOS } from '@/lib/actasDb';
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
    resetFormData,
    loadFormData
  } = useFormData();

  const [vista, setVista] = useState('editor'); // 'editor' | 'lista'
  const [actaId, setActaId] = useState(null);
  const [estado, setEstado] = useState('borrador');
  const [guardando, setGuardando] = useState(false);
  const [guardadoEn, setGuardadoEn] = useState(null);

  const actaIdRef = useRef(null);
  const saltarAutosave = useRef(false);

  // Autoguardado local (debounced): protege el trabajo de campo aunque se
  // cierre la app o se caiga la conexión. Solo guarda si hay datos reales.
  useEffect(() => {
    if (vista !== 'editor') return;
    if (saltarAutosave.current) {
      saltarAutosave.current = false;
      return;
    }
    if (!tieneDatos(formData)) return;
    const t = setTimeout(async () => {
      setGuardando(true);
      try {
        const id = await guardarActa(formData, { id: actaIdRef.current, estado });
        if (!actaIdRef.current) {
          actaIdRef.current = id;
          setActaId(id);
        }
        setGuardadoEn(new Date());
      } catch (e) {
        console.error('Error al autoguardar:', e);
      } finally {
        setGuardando(false);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [formData, estado, vista]);

  const nuevaActa = () => {
    resetFormData();
    actaIdRef.current = null;
    setActaId(null);
    setEstado('borrador');
    setGuardadoEn(null);
    setVista('editor');
  };

  const abrirActa = async (id) => {
    const acta = await obtenerActa(id);
    if (!acta) return;
    saltarAutosave.current = true;
    loadFormData(acta.formData);
    actaIdRef.current = id;
    setActaId(id);
    setEstado(acta.estado || 'borrador');
    setGuardadoEn(acta.lastUpdated ? new Date(acta.lastUpdated) : null);
    setVista('editor');
  };

  const guardarBorrador = async () => {
    setGuardando(true);
    try {
      const id = await guardarActa(formData, { id: actaIdRef.current, estado });
      actaIdRef.current = id;
      setActaId(id);
      setGuardadoEn(new Date());
    } catch (e) {
      console.error('Error al guardar:', e);
      alert('No se pudo guardar el acta en este dispositivo.');
    } finally {
      setGuardando(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    guardarBorrador();
  };

  const handleImprimir = () => {
    // Imprime el acta tal cual el formulario (membrete, secciones, firmas y
    // fotos). En el diálogo del navegador puedes elegir "Guardar como PDF".
    // Sin campos obligatorios: se puede imprimir aunque falten datos.
    window.print();
  };

  if (vista === 'lista') {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
        <CardContent className="p-6">
          <MisActas onAbrir={abrirActa} onNueva={nuevaActa} actaActivaId={actaId} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg acta-print">
      <CardContent className="p-6">
        {/* Barra de gestión del acta (no se imprime) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setVista('lista')}
              className="flex items-center text-sm bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300"
            >
              <FolderOpen size={16} className="mr-1" /> Mis Actas
            </button>
            <button
              type="button"
              onClick={nuevaActa}
              className="flex items-center text-sm bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300"
            >
              <FilePlus size={16} className="mr-1" /> Nueva acta
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Estado:</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="text-sm rounded-md border-gray-300 shadow-sm p-1.5 border"
            >
              {Object.entries(ESTADOS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-500 min-w-[110px] text-right">
              {guardando ? (
                <span className="flex items-center justify-end">
                  <Loader2 size={12} className="mr-1 animate-spin" /> Guardando…
                </span>
              ) : guardadoEn ? (
                <span className="flex items-center justify-end text-green-600">
                  <Check size={12} className="mr-1" /> Guardado
                </span>
              ) : (
                'Sin guardar'
              )}
            </span>
          </div>
        </div>

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
          <div>
            <DatosVisita
              datosVisita={formData.datosVisita}
              datosFuncionario={formData.datosFuncionario}
              updateDatosVisita={updateDatosVisita}
              updateDatosFuncionario={updateDatosFuncionario}
            />
          </div>

          <div>
            <IdentificacionAdultoMayor
              datosAdultoMayor={formData.datosAdultoMayor}
              updateDatosAdultoMayor={updateDatosAdultoMayor}
            />
          </div>

          <div>
            <DatosFamiliar
              datosFamiliares={formData.datosFamiliares}
              updateDatosFamiliares={updateDatosFamiliares}
              addFamiliar={addFamiliar}
              removeFamiliar={removeFamiliar}
            />
          </div>

          <div>
            <ContextoFamiliar
              situacionEncontrada={formData.situacionEncontrada}
              updateSituacionEncontrada={updateSituacionEncontrada}
            />
          </div>

          <div>
            <CondicionesSalud
              antecedentesClinico={formData.antecedentesClinico}
              updateAntecedentesClinico={updateAntecedentesClinico}
            />
          </div>

          <div>
            <Observaciones
              observaciones={formData.observaciones}
              updateObservaciones={updateObservaciones}
            />
          </div>

          <FirmaAutorizacion
            firmas={formData.firmas}
            updateFirmas={updateFirmas}
          />

          {/* La evidencia fotográfica va al final, después de las firmas */}
          <div>
            <EvidenciaFotografica
              fotos={formData.fotos}
              updateFotos={updateFotos}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap justify-end gap-4 mt-6 print:hidden">
            <button
              type="button"
              className="bg-indigo-600 text-white rounded-md px-6 py-2 font-medium hover:bg-indigo-700"
              onClick={handleImprimir}
            >
              Imprimir / Guardar PDF
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
