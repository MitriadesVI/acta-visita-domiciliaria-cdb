import { useState, useEffect, useCallback } from 'react';

const useFormData = () => {
  // Estado para cada sección del formulario
  const [formData, setFormData] = useState({
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
      eps: '',
      condicionDiscapacidad: '',
      tipoDiscapacidad: ''
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
    firmas: {
      adultoMayor: null,
      atiende: null,
      funcionario: null,
      metodoAutorizacion: 'firma', // 'firma' o 'foto'
      foto: null,
      autorizaDatos: false,
      nombreFuncionario: '',
      disciplinaFuncionario: '',
      tipoPersonaAtiende: 'familiar' // 'familiar', 'cuidador', 'testigo'
    }
  });

  // Función para calcular la edad
  const calcularEdad = useCallback((fechaNacimiento) => {
    if (!fechaNacimiento) return '';
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad.toString();
  }, []);

  // Actualizar la edad cuando cambie la fecha de nacimiento
  useEffect(() => {
    const { fechaNacimiento } = formData.datosAdultoMayor;
    if (fechaNacimiento) {
      setFormData(prevData => ({
        ...prevData,
        datosAdultoMayor: {
          ...prevData.datosAdultoMayor,
          edad: calcularEdad(fechaNacimiento)
        }
      }));
    }
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
    updateFirmas
  };
};

export default useFormData;