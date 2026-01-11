import { supabase } from './supabase';

/**
 * Lógica extraída de crear-servicio.php
 * Crea un nuevo registro de servicio técnico con imagen binaria.
 */
export const crearServicio = async (formData) => {
  try {
    const {
      SERV_NUM,
      SERV_DESCRIPCION,
      SERV_CED_ENV,
      SERV_NOM_ENV,
      SERV_IMG_ENV, // Base64 de la imagen
      SERV_CED_REC,
      SERV_NOM_REC,
      SERV_EST
    } = formData;

    // Procesar imagen Base64 a Binario
    const pureBase64 = SERV_IMG_ENV.includes(',') ? SERV_IMG_ENV.split(',')[1] : SERV_IMG_ENV;
    const binaryString = atob(pureBase64);
    const imagenBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imagenBytes[i] = binaryString.charCodeAt(i);
    }

    // Insertar en la tabla serviciostecnicos
    const { data, error } = await supabase
      .from('serviciostecnicos')
      .insert([
        {
          serv_num: SERV_NUM,
          serv_descripcion: SERV_DESCRIPCION,
          serv_fech_asig: new Date().toISOString(),
          serv_ced_env: SERV_CED_ENV,
          serv_nom_env: SERV_NOM_ENV,
          serv_img_env: imagenBytes,
          serv_ced_rec: SERV_CED_REC,
          serv_nom_rec: SERV_NOM_REC,
          serv_est: SERV_EST || 0
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data };

  } catch (error) {
    console.error("Error en crearServicio.js:", error.message);
    return { success: false, message: error.message };
  }
};