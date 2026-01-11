import { supabase } from './supabase';

/**
 * Recupera todos los servicios técnicos para la vista de Administrador.
 * Optimizado: No descarga la imagen pesada para mejorar la velocidad de la lista.
 */
export const obtenerServicios = async () => {
  try {
    const { data, error } = await supabase
      .from('serviciostecnicos')
      // Seleccionamos solo los campos necesarios (SIN SERV_IMG_ENV)
      .select('SERV_ID, SERV_NUM, SERV_DESCRIPCION, SERV_FECH_ASIG, SERV_FECH_FIN, SERV_CED_ENV, SERV_NOM_ENV, SERV_CED_REC, SERV_NOM_REC, SERV_EST')
      .order('SERV_ID', { ascending: false });

    if (error) throw error;

    // Mapeamos los datos asegurando que la App reciba las llaves en MAYÚSCULAS
    const serviciosMapeados = data.map(s => ({
      SERV_ID: s.SERV_ID,
      SERV_NUM: s.SERV_NUM,
      SERV_DESCRIPCION: s.SERV_DESCRIPCION,
      SERV_FECH_ASIG: s.SERV_FECH_ASIG,
      SERV_FECH_FIN: s.SERV_FECH_FIN,
      SERV_CED_ENV: s.SERV_CED_ENV,
      SERV_NOM_ENV: s.SERV_NOM_ENV,
      SERV_IMG_ENV: null, // Se cargará por separado en el detalle si es necesario
      SERV_CED_REC: s.SERV_CED_REC,
      SERV_NOM_REC: s.SERV_NOM_REC,
      SERV_EST: s.SERV_EST
    }));

    return {
      success: true,
      servicios: serviciosMapeados
    };

  } catch (error) {
    console.error("❌ Error en obtenerServicios.js:", error.message);
    return {
      success: false,
      message: "No se pudo cargar la lista: " + error.message,
      servicios: []
    };
  }
};