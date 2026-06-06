import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react';

// Captura de evidencia fotográfica de la visita. Las fotos se guardan en
// base64 para garantizar que estén disponibles al generar el PDF (mismo
// enfoque que ya funciona en centros-vida-app).
const EvidenciaFotografica = ({ fotos, updateFotos }) => {
  const camaraRef = useRef(null);
  const galeriaRef = useRef(null);

  const archivoABase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const agregarArchivos = async (fileList, source) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    try {
      const nuevas = await Promise.all(
        files.map(async (file) => ({
          id: Date.now() + Math.random(),
          preview: await archivoABase64(file),
          description: '',
          timestamp: new Date().toISOString(),
          source
        }))
      );
      updateFotos([...(fotos || []), ...nuevas]);
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      alert('No se pudo procesar alguna imagen. Intenta de nuevo.');
    }
  };

  const handleCamara = (e) => {
    agregarArchivos(e.target.files, 'camara');
    e.target.value = null;
  };

  const handleGaleria = (e) => {
    agregarArchivos(e.target.files, 'galeria');
    e.target.value = null;
  };

  const actualizarDescripcion = (id, description) => {
    updateFotos(fotos.map((f) => (f.id === id ? { ...f, description } : f)));
  };

  const eliminarFoto = (id) => {
    updateFotos(fotos.filter((f) => f.id !== id));
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold text-lg mb-4 text-center bg-gray-200 py-1">EVIDENCIA FOTOGRÁFICA</h3>

      <div className="flex flex-wrap gap-3 mb-3 print:hidden">
        <button
          type="button"
          onClick={() => camaraRef.current?.click()}
          className="flex items-center text-sm bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
        >
          <Camera size={16} className="mr-1" /> Tomar Foto
        </button>
        <button
          type="button"
          onClick={() => galeriaRef.current?.click()}
          className="flex items-center text-sm bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
        >
          <ImageIcon size={16} className="mr-1" /> Seleccionar de Galería
        </button>

        <input
          ref={camaraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCamara}
          className="hidden"
        />
        <input
          ref={galeriaRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleGaleria}
          className="hidden"
        />
      </div>

      <p className="text-sm text-gray-600 mb-3 print:hidden">
        Puedes tomar fotos con la cámara o seleccionar varias de la galería (fachada, condiciones del hogar, etc.). Quedarán en el PDF.
      </p>

      {(!fotos || fotos.length === 0) ? (
        <p className="text-sm text-gray-500 italic">Sin fotos agregadas.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-1 print:gap-6">
          {fotos.map((foto, index) => (
            <div key={foto.id} className="bg-white rounded-md shadow-sm p-2 print:break-inside-avoid print:shadow-none print:border print:border-gray-300 print:p-3">
              <img
                src={foto.preview}
                alt={`Foto ${index + 1}`}
                className="w-full h-40 object-cover rounded print:h-auto print:max-h-[13cm] print:object-contain print:mx-auto"
              />
              <div className="flex items-center justify-between mt-1 print:justify-center">
                <span className="text-xs text-gray-500 print:text-sm print:font-medium print:text-gray-700">Foto #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => eliminarFoto(foto.id)}
                  className="text-red-500 hover:text-red-700 print:hidden"
                  title="Eliminar foto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <textarea
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm p-2 border text-sm print:hidden"
                rows={2}
                placeholder="Descripción de la foto..."
                value={foto.description}
                onChange={(e) => actualizarDescripcion(foto.id, e.target.value)}
              />
              {foto.description && (
                <p className="hidden print:block text-sm whitespace-pre-wrap break-words mt-1 text-center text-gray-700">{foto.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvidenciaFotografica;
