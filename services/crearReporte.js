import { supabase } from './supabase';

export const crearReporte = async (data) => {
    try {
        const { cedula, nombre, tipo, pdf_base64, serv_id, serv_num, mov_id, equipo_nombre, equipo_modelo, usa_repuestos } = data;

        if (!pdf_base64 || !serv_id) {
            return { success: false, message: "Faltan datos obligatorios para crear el reporte." };
        }

        const cleanBase64 = pdf_base64.includes(',') ? pdf_base64.split(',')[1] : pdf_base64;
        
        const { data: reportData, error: errorReport } = await supabase
            .from('REPORTES')
            .insert([
                {
                    "REP_SERV_ID": serv_id,       
                    "REP_SEV_NUM": String(serv_num),
                    "REP_MOV_ID": mov_id,            
                    "REP_CED_USU": String(cedula),  
                    "REP_NOM_USU": nombre,          
                    "REP_TIPO": tipo,
                    "REP_DOC": cleanBase64,
                    "REP_FECHA": new Date().toISOString(),
                    "REP_EQUIPO_NOMBRE": equipo_nombre || null,
                    "REP_EQUIPO_MODELO": equipo_modelo || null,
                    "REP_USA_REPUESTOS": usa_repuestos || false
                }
            ])
            .select()
            .single();

        if (errorReport) throw errorReport;

        const { error: errorUpdate } = await supabase
            .from('SERVICIOSTECNICOS')
            .update({
                "SERV_EST": 1,
                "SERV_FECH_FIN": new Date().toISOString()
            })
            .eq('SERV_ID', serv_id);

        if (errorUpdate) throw errorUpdate;

        return {
            success: true,
            report_id: reportData.REP_ID,
            message: "¡Reporte guardado y servicio finalizado!"
        };

    } catch (error) {
        console.error("❌ Error en crearReporte.js:", error.message);
        return { success: false, message: "Error: " + error.message };
    }
};