import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Webcam from 'react-webcam';
import { Plus, Trash2, Camera, RefreshCw, Save, Edit, Check } from 'lucide-react';

const FirmaAutorizacion = ({ firmas, updateFirmas }) => {
  // Estado para controlar las firmas
  const [firmasAdultosMayores, setFirmasAdultosMayores] = useState(
    firmas.adultosMayores || [{ nombre: '', metodoAutorizacion: 'firma', firma: null, foto: null }]
  );
  
  const [firmasAtendientes, setFirmasAtendientes] = useState(
    firmas.atendientes || [{ nombre: '', relacion: 'familiar', firma: null }]
  );
  
  const [firmasFuncionarios, setFirmasFuncionarios] = useState(
    firmas.funcionarios || [{ nombre: '', cargo: '', disciplina: '', firma: null }]
  );

  // Mantener referencias a los canvas de firma
  const sigPadRefs = {
    adultosMayores: useRef([]),
    atendientes: useRef([]),
    funcionarios: useRef([])
  };

  // Referencia para la webcam
  const webcamRefs = useRef([]);

  // Para guardar las referencias dinámicamente
  const setSignatureRef = (tipo, index, ref) => {
    if (!sigPadRefs[tipo].current[index]) {
      sigPadRefs[tipo].current[index] = ref;
    }
  };

  const setWebcamRef = (index, ref) => {
    if (!webcamRefs.current[index]) {
      webcamRefs.current[index] = ref;
    }
  };

  // Función para actualizar todas las firmas en el estado principal
  const actualizarTodasLasFirmas = () => {
    updateFirmas({
      adultosMayores: firmasAdultosMayores,
      atendientes: firmasAtendientes,
      funcionarios: firmasFuncionarios,
      autorizaDatos: firmas.autorizaDatos || false
    });
  };

  // Manipulación de adultos mayores
  const agregarAdultoMayor = () => {
    const nuevosAdultos = [...firmasAdultosMayores, { 
      nombre: '', 
      metodoAutorizacion: 'firma', 
      firma: null,
      foto: null 
    }];
    setFirmasAdultosMayores(nuevosAdultos);
    // Actualizar referencias
    sigPadRefs.adultosMayores.current = sigPadRefs.adultosMayores.current.concat([null]);
    webcamRefs.current = webcamRefs.current.concat([null]);
  };

  const eliminarAdultoMayor = (index) => {
    if (firmasAdultosMayores.length > 1) {
      const nuevosAdultos = firmasAdultosMayores.filter((_, i) => i !== index);
      setFirmasAdultosMayores(nuevosAdultos);
      sigPadRefs.adultosMayores.current = sigPadRefs.adultosMayores.current.filter((_, i) => i !== index);
      webcamRefs.current = webcamRefs.current.filter((_, i) => i !== index);
      setTimeout(actualizarTodasLasFirmas, 0);
    }
  };

  const actualizarAdultoMayor = (index, campo, valor) => {
    const nuevosAdultos = [...firmasAdultosMayores];
    nuevosAdultos[index] = { ...nuevosAdultos[index], [campo]: valor };
    setFirmasAdultosMayores(nuevosAdultos);
    setTimeout(actualizarTodasLasFirmas, 0);
  };

  // Manipulación de atendientes
  const agregarAtendiente = () => {
    const nuevosAtendientes = [...firmasAtendientes, { 
      nombre: '', 
      relacion: 'familiar', 
      firma: null 
    }];
    setFirmasAtendientes(nuevosAtendientes);
    sigPadRefs.atendientes.current = sigPadRefs.atendientes.current.concat([null]);
  };

  const eliminarAtendiente = (index) => {
    if (firmasAtendientes.length > 1) {
      const nuevosAtendientes = firmasAtendientes.filter((_, i) => i !== index);
      setFirmasAtendientes(nuevosAtendientes);
      sigPadRefs.atendientes.current = sigPadRefs.atendientes.current.filter((_, i) => i !== index);
      setTimeout(actualizarTodasLasFirmas, 0);
    }
  };

  const actualizarAtendiente = (index, campo, valor) => {
    const nuevosAtendientes = [...firmasAtendientes];
    nuevosAtendientes[index] = { ...nuevosAtendientes[index], [campo]: valor };
    setFirmasAtendientes(nuevosAtendientes);
    setTimeout(actualizarTodasLasFirmas, 0);
  };

  // Manipulación de funcionarios
  const agregarFuncionario = () => {
    const nuevosFuncionarios = [...firmasFuncionarios, { 
      nombre: '', 
      cargo: '', 
      disciplina: '', 
      firma: null 
    }];
    setFirmasFuncionarios(nuevosFuncionarios);
    sigPadRefs.funcionarios.current = sigPadRefs.funcionarios.current.concat([null]);
  };

  const eliminarFuncionario = (index) => {
    if (firmasFuncionarios.length > 1) {
      const nuevosFuncionarios = firmasFuncionarios.filter((_, i) => i !== index);
      setFirmasFuncionarios(nuevosFuncionarios);
      sigPadRefs.funcionarios.current = sigPadRefs.funcionarios.current.filter((_, i) => i !== index);
      setTimeout(actualizarTodasLasFirmas, 0);
    }
  };

  const actualizarFuncionario = (index, campo, valor) => {
    const nuevosFuncionarios = [...firmasFuncionarios];
    nuevosFuncionarios[index] = { ...nuevosFuncionarios[index], [campo]: valor };
    setFirmasFuncionarios(nuevosFuncionarios);
    setTimeout(actualizarTodasLasFirmas, 0);
  };

  // Funciones para manipular firmas
  const limpiarFirma = (tipo, index) => {
    if (sigPadRefs[tipo].current[index] && !sigPadRefs[tipo].current[index].isEmpty()) {
      sigPadRefs[tipo].current[index].clear();
      
      if (tipo === 'adultosMayores') {
        const nuevosAdultos = [...firmasAdultosMayores];
        nuevosAdultos[index].firma = null;
        setFirmasAdultosMayores(nuevosAdultos);
      } else if (tipo === 'atendientes') {
        const nuevosAtendientes = [...firmasAtendientes];
        nuevosAtendientes[index].firma = null;
        setFirmasAtendientes(nuevosAtendientes);
      } else if (tipo === 'funcionarios') {
        const nuevosFuncionarios = [...firmasFuncionarios];
        nuevosFuncionarios[index].firma = null;
        setFirmasFuncionarios(nuevosFuncionarios);
      }
      
      setTimeout(actualizarTodasLasFirmas, 0);
    }
  };

  const guardarFirma = (tipo, index) => {
    if (sigPadRefs[tipo].current[index] && !sigPadRefs[tipo].current[index].isEmpty()) {
      const firmaTrimmed = sigPadRefs[tipo].current[index].getTrimmedCanvas().toDataURL('image/png');
      
      if (tipo === 'adultosMayores') {
        const nuevosAdultos = [...firmasAdultosMayores];
        nuevosAdultos[index].firma = firmaTrimmed;
        setFirmasAdultosMayores(nuevosAdultos);
      } else if (tipo === 'atendientes') {
        const nuevosAtendientes = [...firmasAtendientes];
        nuevosAtendientes[index].firma = firmaTrimmed;
        setFirmasAtendientes(nuevosAtendientes);
      } else if (tipo === 'funcionarios') {
        const nuevosFuncionarios = [...firmasFuncionarios];
        nuevosFuncionarios[index].firma = firmaTrimmed;
        setFirmasFuncionarios(nuevosFuncionarios);
      }
      
      setTimeout(actualizarTodasLasFirmas, 0);
    }
  };

  // Funciones para fotos
  const capturarFoto = (index) => {
    if (webcamRefs.current[index]) {
      const imageSrc = webcamRefs.current[index].getScreenshot();
      const nuevosAdultos = [...firmasAdultosMayores];
      nuevosAdultos[index].foto = imageSrc;
      setFirmasAdultosMayores(nuevosAdultos);
      setTimeout(actualizarTodasLasFirmas, 0);
    }
  };

  const limpiarFoto = (index) => {
    const nuevosAdultos = [...firmasAdultosMayores];
    nuevosAdultos[index].foto = null;
    setFirmasAdultosMayores(nuevosAdultos);
    setTimeout(actualizarTodasLasFirmas, 0);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold text-lg mb-4 text-center bg-gray-200 py-1">6. FIRMAS</h3>
      
      {/* Autorización de tratamiento de datos */}
      <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <h4 className="font-medium text-md mb-2">Autorización de Tratamiento de Datos</h4>
        <p className="text-sm text-gray-700 mb-3">
          Por medio de la firma o fotografía proporcionada, autorizo expresamente a la Alcaldía de Barranquilla a recolectar, 
          almacenar, usar y tratar mis datos personales conforme a la Ley 1581 de 2012 y demás normas concordantes, 
          con el fin de dar trámite a mi solicitud de cupo en Centros de Bienestar.
        </p>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autorizaDatos"
            checked={firmas.autorizaDatos}
            onChange={(e) => {
              updateFirmas({ autorizaDatos: e.target.checked });
            }}
            className="mr-2"
            required
          />
          <label htmlFor="autorizaDatos" className="text-sm">
            Confirmo que he informado al adulto mayor sobre esta autorización
          </label>
        </div>
      </div>
      
      {/* Sección 1: Adultos Mayores */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-lg">Firma del Adulto Mayor o Huella</h4>
          <button 
            type="button" 
            onClick={agregarAdultoMayor}
            className="flex items-center text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            <Plus size={16} className="mr-1" /> Añadir Adulto Mayor
          </button>
        </div>
        
        {firmasAdultosMayores.map((adulto, index) => (
          <div key={`adulto-${index}`} className="mb-4 p-3 bg-white rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium">Adulto Mayor #{index + 1}</h5>
              {firmasAdultosMayores.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => eliminarAdultoMayor(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar este adulto mayor"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Nombre del Adulto Mayor:</label>
              <input
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                placeholder="Nombre completo"
                value={adulto.nombre}
                onChange={(e) => actualizarAdultoMayor(index, 'nombre', e.target.value)}
              />
            </div>
            
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Método de autorización:</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`metodoAutorizacion-${index}`}
                    value="firma"
                    checked={adulto.metodoAutorizacion === 'firma'}
                    onChange={() => actualizarAdultoMayor(index, 'metodoAutorizacion', 'firma')}
                  />
                  <span className="ml-2">Firma digital</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`metodoAutorizacion-${index}`}
                    value="foto"
                    checked={adulto.metodoAutorizacion === 'foto'}
                    onChange={() => actualizarAdultoMayor(index, 'metodoAutorizacion', 'foto')}
                  />
                  <span className="ml-2">Fotografía</span>
                </label>
              </div>
            </div>

            {adulto.metodoAutorizacion === 'firma' ? (
              <div>
                <div className="border border-gray-300 rounded-md bg-white mt-1">
                  <SignatureCanvas
                    ref={(ref) => setSignatureRef('adultosMayores', index, ref)}
                    penColor='black'
                    canvasProps={{
                      className: "w-full h-24"
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <button 
                    type="button" 
                    onClick={() => limpiarFirma('adultosMayores', index)}
                    className="flex items-center text-sm text-red-500"
                  >
                    <RefreshCw size={14} className="mr-1" /> Limpiar
                  </button>
                  <button 
                    type="button" 
                    onClick={() => guardarFirma('adultosMayores', index)}
                    className="flex items-center text-sm text-blue-500"
                  >
                    <Save size={14} className="mr-1" /> Guardar Firma
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="border border-gray-300 rounded-md bg-white mt-1 p-1">
                  {adulto.foto ? (
                    <img 
                      src={adulto.foto} 
                      alt="Foto de autorización" 
                      className="w-full h-40 object-contain"
                    />
                  ) : (
                    <Webcam
                      audio={false}
                      ref={(ref) => setWebcamRef(index, ref)}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        facingMode: "user",
                        width: 300,
                        height: 200
                      }}
                      className="w-full h-40"
                    />
                  )}
                </div>
                <div className="flex justify-between mt-2">
                  <button 
                    type="button" 
                    onClick={() => limpiarFoto(index)}
                    className="flex items-center text-sm text-red-500"
                  >
                    <RefreshCw size={14} className="mr-1" /> {adulto.foto ? "Tomar otra" : "Cancelar"}
                  </button>
                  {!adulto.foto && (
                    <button 
                      type="button" 
                      onClick={() => capturarFoto(index)}
                      className="flex items-center text-sm text-blue-500"
                    >
                      <Camera size={14} className="mr-1" /> Capturar Foto
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  *Al capturar la foto, la persona autoriza el tratamiento de sus datos.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Sección 2: Atendientes */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-lg">Firma de quien atiende visita</h4>
          <button 
            type="button" 
            onClick={agregarAtendiente}
            className="flex items-center text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            <Plus size={16} className="mr-1" /> Añadir Persona
          </button>
        </div>
        
        {firmasAtendientes.map((atendiente, index) => (
          <div key={`atendiente-${index}`} className="mb-4 p-3 bg-white rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium">Persona que atiende #{index + 1}</h5>
              {firmasAtendientes.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => eliminarAtendiente(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar esta persona"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Nombre de quien atiende:</label>
              <input
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                placeholder="Nombre completo"
                value={atendiente.nombre}
                onChange={(e) => actualizarAtendiente(index, 'nombre', e.target.value)}
              />
            </div>
            
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Tipo de relación:</label>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name={`relacion-${index}`}
                    value="familiar"
                    checked={atendiente.relacion === 'familiar'} 
                    onChange={() => actualizarAtendiente(index, 'relacion', 'familiar')}
                  />
                  <span className="ml-2 text-sm">Familiar</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name={`relacion-${index}`}
                    value="cuidador"
                    checked={atendiente.relacion === 'cuidador'} 
                    onChange={() => actualizarAtendiente(index, 'relacion', 'cuidador')}
                  />
                  <span className="ml-2 text-sm">Cuidador</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name={`relacion-${index}`}
                    value="testigo"
                    checked={atendiente.relacion === 'testigo'} 
                    onChange={() => actualizarAtendiente(index, 'relacion', 'testigo')}
                  />
                  <span className="ml-2 text-sm">Testigo</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name={`relacion-${index}`}
                    value="otro"
                    checked={atendiente.relacion === 'otro'} 
                    onChange={() => actualizarAtendiente(index, 'relacion', 'otro')}
                  />
                  <span className="ml-2 text-sm">Otro</span>
                </label>
              </div>
            </div>
            
            <div className="border border-gray-300 rounded-md bg-white mt-1">
              <SignatureCanvas
                ref={(ref) => setSignatureRef('atendientes', index, ref)}
                penColor='black'
                canvasProps={{
                  className: "w-full h-24"
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <button 
                type="button" 
                onClick={() => limpiarFirma('atendientes', index)}
                className="flex items-center text-sm text-red-500"
              >
                <RefreshCw size={14} className="mr-1" /> Limpiar
              </button>
              <button 
                type="button" 
                onClick={() => guardarFirma('atendientes', index)}
                className="flex items-center text-sm text-blue-500"
              >
                <Save size={14} className="mr-1" /> Guardar Firma
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Sección 3: Funcionarios */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-lg">Funcionarios que realizan la visita</h4>
          <button 
            type="button" 
            onClick={agregarFuncionario}
            className="flex items-center text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            <Plus size={16} className="mr-1" /> Añadir Funcionario
          </button>
        </div>
        
        {firmasFuncionarios.map((funcionario, index) => (
          <div key={`funcionario-${index}`} className="mb-4 p-3 bg-white rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium">Funcionario #{index + 1}</h5>
              {firmasFuncionarios.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => eliminarFuncionario(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar este funcionario"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Nombre y cargo:</label>
              <input
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                placeholder="Nombre completo y cargo"
                value={funcionario.nombre}
                onChange={(e) => actualizarFuncionario(index, 'nombre', e.target.value)}
              />
            </div>
            
            <div className="border border-gray-300 rounded-md bg-white mt-1">
              <SignatureCanvas
                ref={(ref) => setSignatureRef('funcionarios', index, ref)}
                penColor='black'
                canvasProps={{
                  className: "w-full h-24"
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <button 
                type="button" 
                onClick={() => limpiarFirma('funcionarios', index)}
                className="flex items-center text-sm text-red-500"
              >
                <RefreshCw size={14} className="mr-1" /> Limpiar
              </button>
              <button 
                type="button" 
                onClick={() => guardarFirma('funcionarios', index)}
                className="flex items-center text-sm text-blue-500"
              >
                <Save size={14} className="mr-1" /> Guardar Firma
              </button>
            </div>
            
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Disciplina:</label>
              <input
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                placeholder="Ej: Psicología, Trabajo Social"
                value={funcionario.disciplina}
                onChange={(e) => actualizarFuncionario(index, 'disciplina', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Botones finales */}
      <div className="mt-8 flex justify-end space-x-4">
        <button 
          type="button" 
          onClick={() => {
            // Actualizar todas las firmas antes de imprimir o generar PDF
            actualizarTodasLasFirmas();
          }}
          className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          <Check size={16} className="mr-2" /> Guardar Todas las Firmas
        </button>
      </div>
    </div>
  );
};

export default FirmaAutorizacion;