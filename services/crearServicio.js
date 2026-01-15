import { supabase } from './supabase';

export const crearServicio = async (formData) => {
  try {
    const {
      SERV_NUM,
      SERV_DESCRIPCION,
      SERV_CED_ENV,
      SERV_NOM_ENV,
      SERV_IMG_ENV,
      SERV_CED_REC,
      SERV_NOM_REC,
      SERV_EST
    } = formData;

    const { data, error } = await supabase
      .from('serviciostecnicos')
      .insert([
        {
          "SERV_NUM": String(SERV_NUM),
          "SERV_DESCRIPCION": SERV_DESCRIPCION || "",
          "SERV_FECH_ASIG": new Date().toISOString(),
          "SERV_CED_ENV": String(SERV_CED_ENV).trim(),
          "SERV_NOM_ENV": SERV_NOM_ENV,
          "SERV_IMG_ENV": SERV_IMG_ENV,
          "SERV_CED_REC": String(SERV_CED_REC).trim(),
          "SERV_NOM_REC": SERV_NOM_REC,
          "SERV_EST": SERV_EST || 0
        }
      ])
      .select();

    if (error) throw error;

    return { 
      success: true, 
      data: data[0] 
    };

  } catch (error) {
    console.error("❌ Error en crearServicio.js:", error.message);
    return { 
      success: false, 
      message: "No se pudo guardar el servicio: " + error.message 
    };
  }
};