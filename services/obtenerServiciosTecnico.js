import { supabase } from './supabase';

/**
 * Lógica extraída de obtener-servicios-tecnico.php
 * Recupera todos los servicios asignados a un técnico específico mediante su cédula.
 */
export const obtenerServiciosTecnico = async (cedula) => {
  try {
    // 1. Validación de entrada (Igual que el PHP)
    if (!cedula) {
      return { success: false, message: "Cédula del técnico requerida" };
    }

    // 2. Consulta a Supabase
    // Filtramos por 'serv_ced_rec' y ordenamos por fecha de asignación descendente
    const { data, error } = await supabase
      .from('serviciostecnicos')
      .select('*')
      .eq('serv_ced_rec', cedula)
      .order('serv_fech_asig', { ascending: false });

    if (error) throw error;

    // 3. Mapeo de datos (Opcional, pero recomendado para mantener consistencia con tu UI)
    // Convertimos de minúsculas (DB) a MAYÚSCULAS (lo que espera tu diseño actual)
    const serviciosMapeados = data.map(s => ({
      SERV_ID: s.serv_id,
      SERV_NUM: s.serv_num,
      SERV_DESCRIPCION: s.serv_descripcion,
      SERV_FECH_ASIG: s.serv_fech_asig,
      SERV_FECH_FIN: s.serv_fech_fin,
      SERV_CED_ENV: s.serv_ced_env,
      SERV_NOM_ENV: s.serv_nom_env,
      SERV_IMG_ENV: s.serv_img_env, // Los bytes de la imagen
      SERV_CED_REC: s.serv_ced_rec,
      SERV_NOM_REC: s.serv_nom_rec,
      SERV_EST: s.serv_est
    }));

    return {
      success: true,
      servicios: serviciosMapeados
    };

  } catch (error) {
    console.error("Error en obtenerServiciosTecnico.js:", error.message);
    return {
      success: false,
      message: "No se pudieron obtener los servicios: " + error.message,
      servicios: []
    };
  }
};