import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Webcam from 'react-webcam';
import { Plus, Trash2, Camera, RefreshCw, Save, Edit } from 'lucide-react';

// Componente totalmente controlado: la fuente de verdad de las firmas vive en
// useFormData (prop `firmas`). Aquí solo leemos y escribimos vía updateFirmas.
const FirmaAutorizacion = ({ firmas, updateFirmas }) => {
  const adultosMayores = firmas.adultosMayores || [];
  const atendientes = firmas.atendientes || [];
  const funcionarios = firmas.funcionarios || [];

  // Refs de los canvas anclados por una clave estable `${tipo}-${id}`,
  // no por índice. Así, al eliminar un firmante intermedio, las firmas no se
  // desalinean. Se asignan siempre (sin guardas) para respetar el ciclo de
  // vida de los refs de React (node al montar, null al desmontar).
  const sigPadRefs = useRef({});
  const webcamRefs = useRef({});

  // Ajusta la resolución interna del canvas a su tamaño en pantalla. Sin esto,
  // al estirar el canvas con CSS el trazo del lápiz queda desfasado del cursor.
  const fitCanvas = (pad) => {
    if (!pad) return;
    const canvas = pad.getCanvas();
    const parent = canvas.parentElement;
    if (!parent) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = parent.clientWidth;
    const height = 150;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.getContext('2d').scale(ratio, ratio);
    pad.clear();
  };

  const setSigRef = (key) => (node) => {
    if (node) {
      sigPadRefs.current[key] = node;
      // Esperar al layout para medir el ancho real del contenedor.
      requestAnimationFrame(() => fitCanvas(node));
    } else {
      delete sigPadRefs.current[key];
    }
  };

  const setWebcamRef = (key) => (node) => {
    if (node) webcamRefs.current[key] = node;
    else delete webcamRefs.current[key];
  };

  const nextId = (lista) => lista.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;

  // ---- Adultos mayores (quien recibe la visita) ----
  const agregarAdultoMayor = () => {
    updateFirmas({
      adultosMayores: [
        ...adultosMayores,
        { id: nextId(adultosMayores), nombre: '', metodoAutorizacion: 'firma', firma: null, foto: null }
      ]
    });
  };

  const eliminarAdultoMayor = (id) => {
    if (adultosMayores.length > 1) {
      updateFirmas({ adultosMayores: adultosMayores.filter((a) => a.id !== id) });
    }
  };

  const actualizarAdultoMayor = (id, campo, valor) => {
    updateFirmas({
      adultosMayores: adultosMayores.map((a) => (a.id === id ? { ...a, [campo]: valor } : a))
    });
  };

  // ---- Atendientes (quien atiende la visita) ----
  const agregarAtendiente = () => {
    updateFirmas({
      atendientes: [
        ...atendientes,
        { id: nextId(atendientes), nombre: '', relacion: 'familiar', firma: null }
      ]
    });
  };

  const eliminarAtendiente = (id) => {
    if (atendientes.length > 1) {
      updateFirmas({ atendientes: atendientes.filter((a) => a.id !== id) });
    }
  };

  const actualizarAtendiente = (id, campo, valor) => {
    updateFirmas({
      atendientes: atendientes.map((a) => (a.id === id ? { ...a, [campo]: valor } : a))
    });
  };

  // ---- Funcionarios (quien realiza la visita) ----
  const agregarFuncionario = () => {
    updateFirmas({
      funcionarios: [
        ...funcionarios,
        { id: nextId(funcionarios), nombre: '', disciplina: '', firma: null }
      ]
    });
  };

  const eliminarFuncionario = (id) => {
    if (funcionarios.length > 1) {
      updateFirmas({ funcionarios: funcionarios.filter((f) => f.id !== id) });
    }
  };

  const actualizarFuncionario = (id, campo, valor) => {
    updateFirmas({
      funcionarios: funcionarios.map((f) => (f.id === id ? { ...f, [campo]: valor } : f))
    });
  };

  // ---- Manejo genérico de firmas ----
  const actualizarPorTipo = {
    adultosMayores: actualizarAdultoMayor,
    atendientes: actualizarAtendiente,
    funcionarios: actualizarFuncionario
  };

  const limpiarCanvas = (tipo, id) => {
    const pad = sigPadRefs.current[`${tipo}-${id}`];
    if (pad) pad.clear();
  };

  const guardarFirma = (tipo, id) => {
    const pad = sigPadRefs.current[`${tipo}-${id}`];
    if (pad && !pad.isEmpty()) {
      let dataUrl;
      try {
        dataUrl = pad.getTrimmedCanvas().toDataURL('image/png');
      } catch {
        // Fallback si getTrimmedCanvas no está disponible en esta versión.
        dataUrl = pad.toDataURL('image/png');
      }
      actualizarPorTipo[tipo](id, 'firma', dataUrl);
    }
  };

  const editarFirma = (tipo, id) => {
    // Volver al canvas para re-firmar.
    actualizarPorTipo[tipo](id, 'firma', null);
  };

  // ---- Fotos (solo adultos mayores) ----
  const capturarFoto = (id) => {
    const cam = webcamRefs.current[`adultosMayores-${id}`];
    if (cam) {
      const imageSrc = cam.getScreenshot();
      if (imageSrc) actualizarAdultoMayor(id, 'foto', imageSrc);
    }
  };

  const limpiarFoto = (id) => {
    actualizarAdultoMayor(id, 'foto', null);
  };

  // Bloque reutilizable de firma (canvas si no hay firma; imagen si ya se guardó).
  const BloqueFirma = ({ tipo, id, firma }) => (
    firma ? (
      <div>
        <div className="border border-gray-300 rounded-md bg-white mt-1 p-1">
          <img src={firma} alt="Firma" className="h-24 object-contain mx-auto" />
        </div>
        <div className="flex justify-end mt-2 print:hidden">
          <button
            type="button"
            onClick={() => editarFirma(tipo, id)}
            className="flex items-center text-sm text-blue-500"
          >
            <Edit size={14} className="mr-1" /> Editar firma
          </button>
        </div>
      </div>
    ) : (
      <div>
        <div className="border border-gray-300 rounded-md bg-white mt-1 w-full">
          <SignatureCanvas
            ref={setSigRef(`${tipo}-${id}`)}
            penColor="black"
            canvasProps={{ className: 'block' }}
          />
        </div>
        <div className="flex justify-between mt-2 print:hidden">
          <button
            type="button"
            onClick={() => limpiarCanvas(tipo, id)}
            className="flex items-center text-sm text-red-500"
          >
            <RefreshCw size={14} className="mr-1" /> Limpiar
          </button>
          <button
            type="button"
            onClick={() => guardarFirma(tipo, id)}
            className="flex items-center text-sm text-blue-500"
          >
            <Save size={14} className="mr-1" /> Guardar Firma
          </button>
        </div>
      </div>
    )
  );

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
            checked={firmas.autorizaDatos || false}
            onChange={(e) => updateFirmas({ autorizaDatos: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="autorizaDatos" className="text-sm">
            Confirmo que he informado al adulto mayor sobre esta autorización
          </label>
        </div>
      </div>

      {/* Sección 1: Adultos Mayores (quien recibe la visita) */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-lg">Firma del Adulto Mayor o Huella</h4>
          <button
            type="button"
            onClick={agregarAdultoMayor}
            className="flex items-center text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 print:hidden"
          >
            <Plus size={16} className="mr-1" /> Añadir Adulto Mayor
          </button>
        </div>

        {adultosMayores.map((adulto, index) => (
          <div key={`adulto-${adulto.id}`} className="mb-4 p-3 bg-white rounded-md shadow-sm print:break-inside-avoid">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium">Adulto Mayor #{index + 1}</h5>
              {adultosMayores.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarAdultoMayor(adulto.id)}
                  className="text-red-500 hover:text-red-700 print:hidden"
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
                onChange={(e) => actualizarAdultoMayor(adulto.id, 'nombre', e.target.value)}
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Método de autorización:</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`metodoAutorizacion-${adulto.id}`}
                    value="firma"
                    checked={adulto.metodoAutorizacion === 'firma'}
                    onChange={() => actualizarAdultoMayor(adulto.id, 'metodoAutorizacion', 'firma')}
                  />
                  <span className="ml-2">Firma digital</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`metodoAutorizacion-${adulto.id}`}
                    value="foto"
                    checked={adulto.metodoAutorizacion === 'foto'}
                    onChange={() => actualizarAdultoMayor(adulto.id, 'metodoAutorizacion', 'foto')}
                  />
                  <span className="ml-2">Fotografía</span>
                </label>
              </div>
            </div>

            {adulto.metodoAutorizacion === 'firma' ? (
              <BloqueFirma tipo="adultosMayores" id={adulto.id} firma={adulto.firma} />
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
                      ref={setWebcamRef(`adultosMayores-${adulto.id}`)}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: 'user', width: 300, height: 200 }}
                      className="w-full h-40 print:hidden"
                    />
                  )}
                </div>
                <div className="flex justify-between mt-2 print:hidden">
                  <button
                    type="button"
                    onClick={() => limpiarFoto(adulto.id)}
                    className="flex items-center text-sm text-red-500"
                  >
                    <RefreshCw size={14} className="mr-1" /> {adulto.foto ? 'Tomar otra' : 'Cancelar'}
                  </button>
                  {!adulto.foto && (
                    <button
                      type="button"
                      onClick={() => capturarFoto(adulto.id)}
                      className="flex items-center text-sm text-blue-500"
                    >
                      <Camera size={14} className="mr-1" /> Capturar Foto
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 print:hidden">
                  *Al capturar la foto, la persona autoriza el tratamiento de sus datos.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sección 2: Atendientes (quien atiende la visita) */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-lg">Firma de quien atiende visita</h4>
          <button
            type="button"
            onClick={agregarAtendiente}
            className="flex items-center text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 print:hidden"
          >
            <Plus size={16} className="mr-1" /> Añadir Persona
          </button>
        </div>

        {atendientes.map((atendiente, index) => (
          <div key={`atendiente-${atendiente.id}`} className="mb-4 p-3 bg-white rounded-md shadow-sm print:break-inside-avoid">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium">Persona que atiende #{index + 1}</h5>
              {atendientes.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarAtendiente(atendiente.id)}
                  className="text-red-500 hover:text-red-700 print:hidden"
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
                onChange={(e) => actualizarAtendiente(atendiente.id, 'nombre', e.target.value)}
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Tipo de relación:</label>
              <div className="flex flex-wrap gap-4">
                {['familiar', 'cuidador', 'testigo', 'otro'].map((rel) => (
                  <label key={rel} className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`relacion-${atendiente.id}`}
                      value={rel}
                      checked={atendiente.relacion === rel}
                      onChange={() => actualizarAtendiente(atendiente.id, 'relacion', rel)}
                    />
                    <span className="ml-2 text-sm capitalize">{rel}</span>
                  </label>
                ))}
              </div>
            </div>

            <BloqueFirma tipo="atendientes" id={atendiente.id} firma={atendiente.firma} />
          </div>
        ))}
      </div>

      {/* Sección 3: Funcionarios (quien realiza la visita) */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-lg">Funcionarios que realizan la visita</h4>
          <button
            type="button"
            onClick={agregarFuncionario}
            className="flex items-center text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 print:hidden"
          >
            <Plus size={16} className="mr-1" /> Añadir Funcionario
          </button>
        </div>

        {funcionarios.map((funcionario, index) => (
          <div key={`funcionario-${funcionario.id}`} className="mb-4 p-3 bg-white rounded-md shadow-sm print:break-inside-avoid">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium">Funcionario #{index + 1}</h5>
              {funcionarios.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarFuncionario(funcionario.id)}
                  className="text-red-500 hover:text-red-700 print:hidden"
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
                onChange={(e) => actualizarFuncionario(funcionario.id, 'nombre', e.target.value)}
              />
            </div>

            <BloqueFirma tipo="funcionarios" id={funcionario.id} firma={funcionario.firma} />

            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Disciplina:</label>
              <input
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                placeholder="Ej: Psicología, Trabajo Social"
                value={funcionario.disciplina}
                onChange={(e) => actualizarFuncionario(funcionario.id, 'disciplina', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FirmaAutorizacion;
