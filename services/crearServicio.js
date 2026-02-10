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
      SERV_EST,
      SERV_NOM_CLI,
      SERV_TEL_CLI,
      SERV_CIUDAD,
      SERV_DIR,
      SERV_OBS,
      SERV_REQUIERE_FACT
    } = formData;

    const { data, error } = await supabase
      .from('serviciostecnicos')
      .insert([
        {
          "SERV_NUM": String(SERV_NUM).trim(),
          "SERV_DESCRIPCION": SERV_DESCRIPCION || "",
          "SERV_FECH_ASIG": new Date().toISOString(),
          "SERV_CED_ENV": String(SERV_CED_ENV).trim(),
          "SERV_NOM_ENV": SERV_NOM_ENV,
          "SERV_IMG_ENV": SERV_IMG_ENV || null,
          // 👇 Aquí está la corrección principal 👇
          "SERV_CED_REC": SERV_CED_REC ? String(SERV_CED_REC).trim() : null,
          "SERV_NOM_REC": SERV_NOM_REC || null,
          "SERV_EST": SERV_EST || 0,
          "SERV_NOM_CLI": SERV_NOM_CLI ? String(SERV_NOM_CLI).trim() : "",
          "SERV_TEL_CLI": SERV_TEL_CLI ? String(SERV_TEL_CLI).trim() : "",
          "SERV_CIUDAD": SERV_CIUDAD ? String(SERV_CIUDAD).trim() : "",
          "SERV_DIR": SERV_DIR ? String(SERV_DIR).trim() : "",
          "SERV_OBS": SERV_OBS || "",
          "SERV_REQUIERE_FACT": SERV_REQUIERE_FACT
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