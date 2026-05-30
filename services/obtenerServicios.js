import { supabase } from './supabase';

export const obtenerServicios = async (userId, rol) => {
  try {
    let query = supabase
      .from('SERVICIOSTECNICOS')
      .select(`
        SERV_ID, 
        SERV_NUM, 
        SERV_DESCRIPCION, 
        SERV_FECH_ASIG, 
        SERV_FECH_FIN, 
        SERV_EST,
        SERV_TEC_ASIG_ID,
        CLIENTES (
          CLI_CEDULA,
          CLI_NOMBRES
        ),
        USERSMOVIL (
          NOM_MOV,
          MOV_APE
        )
      `);
      
    if (parseInt(rol) === 2) {
      query = query.eq('SERV_TEC_ASIG_ID', userId);
    }
    
    const { data, error } = await query.order('SERV_ID', { ascending: false });
    
    if (error) throw error;

    const serviciosMapeados = data.map(s => {
      const nombreTecnico = s.USERSMOVIL 
        ? `${s.USERSMOVIL.NOM_MOV} ${s.USERSMOVIL.MOV_APE}`.trim() 
        : null;

      return {
        SERV_ID: s.SERV_ID,
        SERV_NUM: s.SERV_NUM,
        SERV_DESCRIPCION: s.SERV_DESCRIPCION,
        SERV_FECH_ASIG: s.SERV_FECH_ASIG,
        SERV_FECH_FIN: s.SERV_FECH_FIN,
        SERV_EST: s.SERV_EST,
        SERV_CED_CLI: s.CLIENTES?.CLI_CEDULA || 'S/N',
        SERV_NOM_CLI: s.CLIENTES?.CLI_NOMBRES || 'Sin Cliente',
        SERV_NOM_REC: nombreTecnico,
        SERV_TEC_ASIG_ID: s.SERV_TEC_ASIG_ID 
      };
    });

    return {
      success: true,
      servicios: serviciosMapeados
    };

  } catch (error) {
    console.error("❌ Error en obtenerServicios.js:", error.message);
    return {
      success: false,
      message: "Error al cargar servicios: " + error.message,
      servicios: []
    };
  }
};