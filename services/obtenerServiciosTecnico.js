import { supabase } from './supabase';

/**
 * Recupera los servicios asignados a un técnico específico.
 * Optimizado para no descargar imágenes pesadas y ajustado a MAYÚSCULAS.
 */
export const obtenerServiciosTecnico = async (cedula) => {
  try {
    if (!cedula) return { success: false, message: "Cédula requerida" };

    const { data, error } = await supabase
      .from('serviciostecnicos')
      // 1. Seleccionamos columnas en MAYÚSCULAS (SIN SERV_IMG_ENV)
      .select('SERV_ID, SERV_NUM, SERV_DESCRIPCION, SERV_FECH_ASIG, SERV_FECH_FIN, SERV_CED_ENV, SERV_NOM_ENV, SERV_CED_REC, SERV_NOM_REC, SERV_EST')
      // 2. Filtramos por la columna en MAYÚSCULAS
      .eq('SERV_CED_REC', String(cedula).trim())
      .order('SERV_FECH_ASIG', { ascending: false });

    if (error) throw error;

    // 3. Mapeamos los resultados usando las llaves en MAYÚSCULAS que devuelve la DB
    const serviciosMapeados = data.map(s => ({
      SERV_ID: s.SERV_ID,
      SERV_NUM: s.SERV_NUM,
      SERV_DESCRIPCION: s.SERV_DESCRIPCION,
      SERV_FECH_ASIG: s.SERV_FECH_ASIG,
      SERV_FECH_FIN: s.SERV_FECH_FIN,
      SERV_CED_ENV: s.SERV_CED_ENV,
      SERV_NOM_ENV: s.SERV_NOM_ENV,
      SERV_CED_REC: s.SERV_CED_REC,
      SERV_NOM_REC: s.SERV_NOM_REC,
      SERV_EST: s.SERV_EST,
      SERV_IMG_ENV: null // Se cargará solo en el detalle
    }));

    return { 
        success: true, 
        servicios: serviciosMapeados 
    };

  } catch (error) {
    console.error("❌ Error en obtenerServiciosTecnico.js:", error.message);
    return { 
        success: false, 
        message: "No se pudo cargar tu lista de trabajos: " + error.message, 
        servicios: [] 
    };
  }
};