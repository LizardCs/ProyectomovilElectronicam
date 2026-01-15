import { supabase } from './supabase';

export const crearReporte = async (data) => {
    try {
        const { cedula, nombre, tipo, pdf_base64, serv_id, serv_num } = data;

        const cleanBase64 = pdf_base64.includes(',') ? pdf_base64.split(',')[1] : pdf_base64;
        const { data: reportData, error: errorReport } = await supabase
            .from('reportes')
            .insert([
                {
                    "REP_CED_USU": String(cedula),
                    "REP_NOM_USU": nombre,
                    "REP_TIPO": tipo,
                    "REP_DOC": cleanBase64,
                    "REP_SEV_NUM": String(serv_num),
                    "REP_FECHA": new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (errorReport) throw errorReport;

        const { error: errorUpdate } = await supabase
            .from('serviciostecnicos')
            .update({
                "SERV_EST": 1,
                "SERV_FECH_FIN": new Date().toISOString()
            })
            .eq('SERV_ID', serv_id);

        if (errorUpdate) throw errorUpdate;

        return { 
            success: true, 
            report_id: reportData.REP_ID
        };

    } catch (error) {
        console.error("❌ Error en crearReporte.js:", error.message);
        return { success: false, message: "Error al sincronizar reporte: " + error.message };
    }
};