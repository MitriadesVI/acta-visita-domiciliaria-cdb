import { useState, useEffect, useCallback } from 'react';

// Estado inicial como factory para poder reiniciar el formulario.
const getInitialFormData = () => ({
  datosVisita: {
    fecha: '',
    hora: '',
    ciudad: 'Barranquilla',
    numeroVisita: '',
    objetivoVisita: 'Atender solicitud de cupo para Centros de Bienestar'
  },
  datosFuncionario: {
    nombreApellido: ''
  },
  datosAdultoMayor: {
    nombreApellido: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    fechaExpedicion: '',
    direccion: '',
    barrio: '',
    telefono: '',
    fechaNacimiento: '',
    edad: '',
    sexo: '',
    tipoSangre: '',
    estadoCivil: 'Soltero',
    sisben: false,
    grupoSisben: '',
    eps: '',
    condicionDiscapacidad: ''
  },
  datosFamiliares: [
    { nombreApellido: '', parentesco: '', direccion: '', telefono: '' }
  ],
  situacionEncontrada: '',
  antecedentesClinico: {
    saludFisica: '',
    saludMental: ''
  },
  observaciones: '',
  // Evidencia fotográfica de la visita (cada foto: { id, preview(base64),
  // description, timestamp, source }).
  fotos: [],
  // Firmas: una sola fuente de verdad, con la forma real que consume
  // FirmaAutorizacion. Cada firmante tiene un id estable para anclar el ref.
  firmas: {
    adultosMayores: [
      { id: 1, nombre: '', metodoAutorizacion: 'firma', firma: null, foto: null }
    ],
    atendientes: [
      { id: 1, nombre: '', relacion: 'familiar', firma: null }
    ],
    funcionarios: [
      { id: 1, nombre: '', disciplina: '', firma: null }
    ],
    autorizaDatos: false
  }
});

const useFormData = () => {
  const [formData, setFormData] = useState(getInitialFormData);

  // Calcula la edad parseando la fecha como local (evita el corrimiento
  // de un día/año que produce new Date('YYYY-MM-DD') al interpretarla en UTC).
  const calcularEdad = useCallback((fechaNacimiento) => {
    if (!fechaNacimiento) return '';
    const [anio, mes, dia] = fechaNacimiento.split('-').map(Number);
    if (!anio || !mes || !dia) return '';
    const hoy = new Date();
    let edad = hoy.getFullYear() - anio;
    const difMes = (hoy.getMonth() + 1) - mes;
    if (difMes < 0 || (difMes === 0 && hoy.getDate() < dia)) {
      edad--;
    }
    return edad >= 0 ? edad.toString() : '';
  }, []);

  // Actualizar la edad cuando cambie la fecha de nacimiento
  useEffect(() => {
    const { fechaNacimiento } = formData.datosAdultoMayor;
    const edadCalculada = calcularEdad(fechaNacimiento);
    setFormData(prevData => {
      if (prevData.datosAdultoMayor.edad === edadCalculada) return prevData;
      return {
        ...prevData,
        datosAdultoMayor: {
          ...prevData.datosAdultoMayor,
          edad: edadCalculada
        }
      };
    });
    // Solo recalcular cuando cambie la fecha de nacimiento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.datosAdultoMayor.fechaNacimiento, calcularEdad]);

  // Funciones para actualizar cada sección
  const updateDatosVisita = (newData) => {
    setFormData(prevData => ({
      ...prevData,
      datosVisita: { ...prevData.datosVisita, ...newData }
    }));
  };

  const updateDatosFuncionario = (newData) => {
    setFormData(prevData => ({
      ...prevData,
      datosFuncionario: { ...prevData.datosFuncionario, ...newData }
    }));
  };

  const updateDatosAdultoMayor = (newData) => {
    setFormData(prevData => ({
      ...prevData,
      datosAdultoMayor: { ...prevData.datosAdultoMayor, ...newData }
    }));
  };

  const updateDatosFamiliares = (index, newData) => {
    setFormData(prevData => {
      const newFamiliares = [...prevData.datosFamiliares];
      newFamiliares[index] = { ...newFamiliares[index], ...newData };
      return {
        ...prevData,
        datosFamiliares: newFamiliares
      };
    });
  };

  const addFamiliar = () => {
    setFormData(prevData => ({
      ...prevData,
      datosFamiliares: [...prevData.datosFamiliares, { nombreApellido: '', parentesco: '', direccion: '', telefono: '' }]
    }));
  };

  const removeFamiliar = (index) => {
    setFormData(prevData => {
      const newFamiliares = [...prevData.datosFamiliares];
      newFamiliares.splice(index, 1);
      return {
        ...prevData,
        datosFamiliares: newFamiliares
      };
    });
  };

  const updateSituacionEncontrada = (newData) => {
    setFormData(prevData => ({
      ...prevData,
      situacionEncontrada: newData
    }));
  };

  const updateAntecedentesClinico = (newData) => {
    setFormData(prevData => ({
      ...prevData,
      antecedentesClinico: { ...prevData.antecedentesClinico, ...newData }
    }));
  };

  const updateObservaciones = (newData) => {
    setFormData(prevData => ({
      ...prevData,
      observaciones: newData
    }));
  };

  const updateFirmas = (newData) => {
    setFormData(prevData => ({
      ...prevData,
      firmas: { ...prevData.firmas, ...newData }
    }));
  };

  const updateFotos = (nuevasFotos) => {
    setFormData(prevData => ({
      ...prevData,
      fotos: nuevasFotos
    }));
  };

  const resetFormData = () => {
    setFormData(getInitialFormData());
  };

  // Carga un acta guardada, completando con los valores por defecto cualquier
  // campo que falte (compatibilidad hacia atrás con actas antiguas).
  const loadFormData = (data) => {
    setFormData({ ...getInitialFormData(), ...(data || {}) });
  };

  return {
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
  };
};

export default useFormData;
