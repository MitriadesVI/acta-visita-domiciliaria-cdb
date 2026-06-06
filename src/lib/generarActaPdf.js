// Genera el PDF del acta con jsPDF (contenido que fluye y agrega páginas solo
// cuando se llena -> sin espacios en blanco). Firmas y fotos van embebidas.
// jsPDF se importa de forma dinámica para no cargarlo en el render inicial ni en SSR.
import { HEADER_LOGO, FOOTER_BANNER } from '@/components/ActaVisitaDomiciliaria/logoimages';

const na = (valor) => {
  const v = valor === null || valor === undefined ? '' : String(valor).trim();
  return v ? v : 'N/A';
};

const formatearFechaHora = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
};

export async function generarActaPdf(formData) {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const topAfterHeader = 38; // debajo del membrete
  const bottomLimit = pageHeight - 25; // encima del pie

  const addHeaderFooter = () => {
    try {
      doc.addImage(HEADER_LOGO, 'JPEG', 0, 0, pageWidth, 30);
      doc.addImage(FOOTER_BANNER, 'JPEG', 0, pageHeight - 20, pageWidth, 20);
    } catch (e) {
      // Fallback textual si las imágenes fallan
      doc.setFillColor(12, 35, 64);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255).setFontSize(14).setFont('helvetica', 'bold');
      doc.text('ALCALDÍA DE BARRANQUILLA', pageWidth / 2, 15, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }
  };

  let currentY = topAfterHeader;

  const asegurarEspacio = (alto) => {
    if (currentY + alto > bottomLimit) {
      doc.addPage();
      currentY = topAfterHeader;
    }
  };

  // Tabla de pares clave/valor usando autotable.
  const tablaDatos = (titulo, filas) => {
    doc.autoTable({
      head: [[{ content: titulo, colSpan: 2, styles: { halign: 'center', fillColor: [30, 136, 229], textColor: 255, fontStyle: 'bold', fontSize: 11 } }]],
      body: filas.map(([k, v]) => [k, na(v)]),
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2.5, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
      margin: { left: margin, right: margin, top: topAfterHeader, bottom: pageHeight - bottomLimit },
      didDrawPage: addHeaderFooter
    });
    currentY = doc.lastAutoTable.finalY + 6;
  };

  // Título de sección con texto largo (contexto, salud, observaciones).
  const seccionTexto = (titulo, texto) => {
    doc.autoTable({
      head: [[{ content: titulo, styles: { halign: 'center', fillColor: [30, 136, 229], textColor: 255, fontStyle: 'bold', fontSize: 11 } }]],
      body: [[na(texto)]],
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak', minCellHeight: 14 },
      margin: { left: margin, right: margin, top: topAfterHeader, bottom: pageHeight - bottomLimit },
      didDrawPage: addHeaderFooter
    });
    currentY = doc.lastAutoTable.finalY + 6;
  };

  // ---- Encabezado / título ----
  addHeaderFooter();
  doc.setTextColor(0, 0, 0).setFontSize(14).setFont('helvetica', 'bold');
  doc.text('ACTA DE VISITA DOMICILIARIA', pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;

  const dv = formData.datosVisita || {};
  const fn = formData.datosFuncionario || {};
  tablaDatos('DATOS DE LA VISITA', [
    ['Fecha', dv.fecha],
    ['Hora', dv.hora],
    ['Ciudad', dv.ciudad],
    ['N° de Visita', dv.numeroVisita],
    ['Objetivo de la visita', dv.objetivoVisita],
    ['Quien atiende la visita', fn.nombreApellido]
  ]);

  // ---- 1. Identificación del adulto mayor ----
  const am = formData.datosAdultoMayor || {};
  tablaDatos('1. IDENTIFICACIÓN DEL ADULTO MAYOR', [
    ['Nombres y Apellidos', am.nombreApellido],
    ['Tipo de Documento', am.tipoDocumento],
    ['N° Documento', am.numeroDocumento],
    ['Fecha de Expedición', am.fechaExpedicion],
    ['Dirección', am.direccion],
    ['Barrio', am.barrio],
    ['Teléfono', am.telefono],
    ['Fecha de Nacimiento', am.fechaNacimiento],
    ['Edad', am.edad],
    ['Sexo', am.sexo],
    ['Tipo de Sangre', am.tipoSangre],
    ['Estado Civil', am.estadoCivil],
    ['SISBEN', am.sisben ? `Sí${am.grupoSisben ? ` (Grupo ${am.grupoSisben})` : ''}` : 'No'],
    ['EPS', am.eps],
    ['Condición de Discapacidad', am.condicionDiscapacidad]
  ]);

  // ---- 2. Datos de familiares - red de apoyo ----
  const familiares = (formData.datosFamiliares || []).filter(
    (f) => f.nombreApellido || f.parentesco || f.direccion || f.telefono
  );
  doc.autoTable({
    head: [
      [{ content: '2. DATOS DE FAMILIARES - RED DE APOYO ENCONTRADOS', colSpan: 4, styles: { halign: 'center', fillColor: [30, 136, 229], textColor: 255, fontStyle: 'bold', fontSize: 11 } }],
      ['Nombres y Apellidos', 'Parentesco', 'Dirección', 'Teléfono']
    ],
    body: familiares.length
      ? familiares.map((f) => [na(f.nombreApellido), na(f.parentesco), na(f.direccion), na(f.telefono)])
      : [[{ content: 'No se registraron familiares / red de apoyo', colSpan: 4, styles: { halign: 'center', fontStyle: 'italic' } }]],
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5, overflow: 'linebreak' },
    headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: 'bold' },
    margin: { left: margin, right: margin, top: topAfterHeader, bottom: pageHeight - bottomLimit },
    didDrawPage: addHeaderFooter
  });
  currentY = doc.lastAutoTable.finalY + 6;

  // ---- 3, 4, 5 secciones de texto ----
  seccionTexto('3. CONTEXTO FAMILIAR, REDES DE APOYO Y CONDICIONES SOCIOECONÓMICAS', formData.situacionEncontrada);

  const ac = formData.antecedentesClinico || {};
  seccionTexto('4. CONDICIONES DE SALUD - SALUD FÍSICA', ac.saludFisica);
  seccionTexto('CONDICIONES DE SALUD - SALUD MENTAL', ac.saludMental);

  seccionTexto('5. OBSERVACIONES', formData.observaciones);

  // ---- Evidencia fotográfica ----
  const fotos = formData.fotos || [];
  if (fotos.length > 0) {
    asegurarEspacio(12);
    doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(0, 0, 0);
    doc.text('EVIDENCIA FOTOGRÁFICA', margin, currentY);
    currentY += 6;

    const imgW = 80;
    const imgH = 60;
    for (let i = 0; i < fotos.length; i++) {
      const foto = fotos[i];
      asegurarEspacio(imgH + 12);
      try {
        doc.addImage(foto.preview, 'JPEG', margin, currentY, imgW, imgH, undefined, 'MEDIUM');
      } catch (e) {
        doc.setFontSize(9).setFont('helvetica', 'italic');
        doc.text(`[No se pudo incluir la foto ${i + 1}]`, margin, currentY + 10);
      }
      const textX = margin + imgW + 6;
      const textW = pageWidth - margin - textX;
      doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor(0, 0, 0);
      doc.text(`Foto ${i + 1}`, textX, currentY + 6);
      doc.setFontSize(9).setFont('helvetica', 'normal');
      const desc = doc.splitTextToSize(foto.description || 'Sin descripción', textW);
      doc.text(desc, textX, currentY + 13);
      const fecha = formatearFechaHora(foto.timestamp);
      if (fecha) doc.text(`Fecha: ${fecha}`, textX, currentY + 13 + desc.length * 5 + 4);
      currentY += imgH + 8;
    }
    currentY += 4;
  }

  // ---- 6. Firmas ----
  asegurarEspacio(14);
  doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(0, 0, 0);
  doc.text('6. FIRMAS', margin, currentY);
  currentY += 4;

  const firmas = formData.firmas || {};
  const autorizo = firmas.autorizaDatos ? 'Sí' : 'No';
  doc.setFontSize(8).setFont('helvetica', 'italic').setTextColor(80, 80, 80);
  currentY += 4;
  doc.text(`Autorización de tratamiento de datos (Ley 1581 de 2012): ${autorizo}`, margin, currentY);
  currentY += 6;
  doc.setTextColor(0, 0, 0);

  const firmaW = 55;
  const firmaH = 22;

  const bloqueFirma = (titulo, nombre, extra, imagen, formato = 'PNG') => {
    asegurarEspacio(firmaH + 16);
    doc.setFontSize(9).setFont('helvetica', 'bold');
    doc.text(titulo, margin, currentY);
    currentY += 4;
    if (imagen) {
      try {
        doc.addImage(imagen, formato, margin, currentY, firmaW, firmaH, undefined, 'MEDIUM');
      } catch (e) {
        doc.setFont('helvetica', 'italic').text('[Firma no disponible]', margin, currentY + 10);
      }
    } else {
      doc.setDrawColor(150).line(margin, currentY + firmaH, margin + firmaW, currentY + firmaH);
    }
    doc.setFontSize(9).setFont('helvetica', 'normal');
    let infoY = currentY + firmaH + 5;
    doc.text(`Nombre: ${na(nombre)}`, margin, infoY);
    if (extra) {
      infoY += 5;
      doc.text(extra, margin, infoY);
    }
    currentY = infoY + 8;
  };

  (firmas.adultosMayores || []).forEach((a, i) => {
    const usaFoto = a.metodoAutorizacion === 'foto';
    bloqueFirma(
      `Adulto Mayor #${i + 1} (${usaFoto ? 'Fotografía/Huella' : 'Firma'})`,
      a.nombre,
      null,
      usaFoto ? a.foto : a.firma,
      usaFoto ? 'JPEG' : 'PNG'
    );
  });

  (firmas.atendientes || []).forEach((a, i) => {
    bloqueFirma(`Quien atiende la visita #${i + 1}`, a.nombre, `Relación: ${na(a.relacion)}`, a.firma, 'PNG');
  });

  (firmas.funcionarios || []).forEach((f, i) => {
    bloqueFirma(`Funcionario que realiza la visita #${i + 1}`, f.nombre, `Disciplina: ${na(f.disciplina)}`, f.firma, 'PNG');
  });

  // Reaplicar membrete en todas las páginas (por si autotable agregó alguna).
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addHeaderFooter();
  }

  const nombreArchivo = `acta_${na(am.nombreApellido).replace(/\s+/g, '_')}_${na(dv.fecha)}.pdf`;
  doc.save(nombreArchivo);
}

export default generarActaPdf;
