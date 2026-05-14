import { supabase } from './supabase';

export const crearReporte = async (data) => {
    try {
        const { cedula, nombre, tipo, pdf_base64, serv_id, serv_num } = data;

        if (!pdf_base64 || !serv_id) {
            return { success: false, message: "Faltan datos obligatorios para crear el reporte." };
        }

        // 1. Limpieza de la cadena Base64
        const cleanBase64 = pdf_base64.includes(',') ? pdf_base64.split(',')[1] : pdf_base64;
        
        // 2. Insertar el reporte en la tabla REPORTES (en MAYÚSCULAS)
        const { data: reportData, error: errorReport } = await supabase
            .from('REPORTES')
            .insert([
                {
                    "REP_CED_USU": String(cedula).trim(),
                    "REP_NOM_USU": nombre,
                    "REP_TIPO": tipo,
                    "REP_DOC": cleanBase64,
                    "REP_SEV_NUM": String(serv_num).trim(),
                    "REP_FECHA": new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (errorReport) throw errorReport;

        // 3. Actualizar el estado del servicio a "Completado" (1) en SERVICIOSTECNICOS
        const { error: errorUpdate } = await supabase
            .from('SERVICIOSTECNICOS')
            .update({
                "SERV_EST": 1,
                "SERV_FECH_FIN": new Date().toISOString()
            })
            .eq('SERV_ID', serv_id);

        if (errorUpdate) {
            // Si falla la actualización del estado, podríamos tener un problema de sincronía,
            // pero el reporte ya se guardó. Lanzamos el error para avisarle al técnico.
            throw errorUpdate;
        }

        return {
            success: true,
            report_id: reportData.REP_ID,
            message: "Reporte guardado y servicio finalizado correctamente."
        };

    } catch (error) {
        console.error("❌ Error en crearReporte.js:", error.message);
        return { 
            success: false, 
            message: "Error al sincronizar reporte: " + error.message 
        };
    }
};