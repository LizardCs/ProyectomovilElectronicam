import { supabase } from './supabase';

/**
 * Lógica extraída de crear-reporte.php
 * Inserta un reporte y actualiza el estado del servicio a 1 (Finalizado).
 */
export const crearReporte = async (data) => {
  try {
    const { cedula, nombre, tipo, pdf_base64, serv_id, serv_num } = data;

    // Conversión de Base64 a Binario (para la columna BYTEA/BLOB)
    const binaryString = atob(pdf_base64.includes(',') ? pdf_base64.split(',')[1] : pdf_base64);
    const pdfBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      pdfBytes[i] = binaryString.charCodeAt(i);
    }

    // Acción 1: Insertar reporte
    const { data: reportData, error: errorReport } = await supabase
      .from('reportes')
      .insert([
        {
          rep_ced_usu: cedula,
          rep_nom_usu: nombre,
          rep_tipo: tipo,
          rep_doc: pdfBytes,
          rep_sev_num: serv_num 
        }
      ])
      .select()
      .single();

    if (errorReport) throw errorReport;

    // Acción 2: Actualizar el estado del servicio técnico (Equivalente al UPDATE del PHP)
    const { error: errorUpdate } = await supabase
      .from('serviciostecnicos')
      .update({
        serv_est: 1,
        serv_fech_fin: new Date().toISOString()
      })
      .eq('serv_id', serv_id);

    if (errorUpdate) throw errorUpdate;

    return { success: true, report_id: reportData.rep_id };

  } catch (error) {
    console.error("Error en crearReporte.js:", error.message);
    return { success: false, message: error.message };
  }
};