import { supabase } from './supabase';

export const obtenerServicios = async () => {
  try {
    const { data, error } = await supabase
      .from('serviciostecnicos')
      .select('*')
      .order('serv_id', { ascending: false });

    if (error) throw error;


    const serviciosMapeados = data.map(s => ({
      SERV_ID: s.serv_id,
      SERV_NUM: s.serv_num,
      SERV_DESCRIPCION: s.serv_descripcion,
      SERV_FECH_ASIG: s.serv_fech_asig,
      SERV_FECH_FIN: s.serv_fech_fin,
      SERV_CED_ENV: s.serv_ced_env,
      SERV_NOM_ENV: s.serv_nom_env,
      SERV_IMG_ENV: s.serv_img_env,
      SERV_CED_REC: s.serv_ced_rec,
      SERV_NOM_REC: s.serv_nom_rec,
      SERV_EST: s.serv_est
    }));

    return {
      success: true,
      servicios: serviciosMapeados
    };

  } catch (error) {
    console.error("Error en obtenerServicios.js:", error.message);
    return {
      success: false,
      message: "No se pudo cargar la lista de servicios: " + error.message,
      servicios: []
    };
  }
};