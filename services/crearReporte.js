import { supabase } from './supabase';

/**
 * Inserta un reporte técnico y marca el servicio como finalizado.
 * Ajustado para columnas en MAYÚSCULAS y almacenamiento de PDF como TEXT (Base64).
 */
export const crearReporte = async (data) => {
    try {
        const { cedula, nombre, tipo, pdf_base64, serv_id, serv_num } = data;

        // Limpiamos el base64 por si viene con el encabezado de data:application/pdf
        const cleanBase64 = pdf_base64.includes(',') ? pdf_base64.split(',')[1] : pdf_base64;

        // ACCIÓN 1: Insertar en la tabla 'reportes' usando nombres en MAYÚSCULAS
        const { data: reportData, error: errorReport } = await supabase
            .from('reportes')
            .insert([
                {
                    "REP_CED_USU": String(cedula),
                    "REP_NOM_USU": nombre,
                    "REP_TIPO": tipo,
                    "REP_DOC": cleanBase64, // Guardamos el Base64 puro como texto
                    "REP_SEV_NUM": String(serv_num),
                    "REP_FECHA": new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (errorReport) throw errorReport;

        // ACCIÓN 2: Actualizar la tabla 'serviciostecnicos'
        // IMPORTANTE: Los nombres deben coincidir con tu SQL (MAYÚSCULAS)
        const { error: errorUpdate } = await supabase
            .from('serviciostecnicos')
            .update({
                "SERV_EST": 1,
                "SERV_FECH_FIN": new Date().toISOString()
            })
            .eq('SERV_ID', serv_id); // Filtramos por la llave primaria en mayúsculas

        if (errorUpdate) throw errorUpdate;

        return { 
            success: true, 
            report_id: reportData.REP_ID // Retornamos el ID en mayúsculas como viene de la DB
        };

    } catch (error) {
        console.error("❌ Error en crearReporte.js:", error.message);
        return { success: false, message: "Error al sincronizar reporte: " + error.message };
    }
};