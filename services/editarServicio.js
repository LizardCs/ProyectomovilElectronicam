import { supabase } from './supabase';

export const editarServicio = async (formData) => {
  try {
    const {
      SERV_ID,
      SERV_NUM,
      SERV_DESCRIPCION,
      SERV_CED_REC,
      SERV_NOM_REC,
      SERV_IMG_ENV,
      SERV_NOM_CLI,
      SERV_TEL_CLI,
      SERV_CIUDAD,
      SERV_DIR,
      SERV_OBS,
      SERV_REQUIERE_FACT,
      SERV_CED_CLI,
      SERV_CORREO_CLI
    } = formData;

    if (!SERV_ID) {
      return { success: false, message: "Falta el ID del servicio para realizar la actualización." };
    }

    let cleanBase64 = null;
    if (SERV_IMG_ENV && SERV_IMG_ENV.startsWith('data:image')) {
      cleanBase64 = SERV_IMG_ENV.split(',')[1];
    } else if (SERV_IMG_ENV) {
      cleanBase64 = SERV_IMG_ENV;
    }

    const updateFields = {
      "SERV_NUM": String(SERV_NUM).trim(),
      "SERV_DESCRIPCION": SERV_DESCRIPCION || "",
      // 👇 Corrección para que si se quita el técnico quede vacío y no dé error 👇
      "SERV_CED_REC": SERV_CED_REC ? String(SERV_CED_REC).trim() : null,
      "SERV_NOM_REC": SERV_NOM_REC || null,
      "SERV_NOM_CLI": SERV_NOM_CLI ? String(SERV_NOM_CLI).trim() : "",
      "SERV_TEL_CLI": SERV_TEL_CLI ? String(SERV_TEL_CLI).trim() : "",
      "SERV_CIUDAD": SERV_CIUDAD ? String(SERV_CIUDAD).trim() : "",
      "SERV_DIR": SERV_DIR ? String(SERV_DIR).trim() : "",
      "SERV_OBS": SERV_OBS || "",
      "SERV_REQUIERE_FACT": SERV_REQUIERE_FACT,
      "SERV_CED_CLI": SERV_CED_CLI ? String(SERV_CED_CLI).trim() : "",
      "SERV_CORREO_CLI": SERV_CORREO_CLI ? String(SERV_CORREO_CLI).trim() : ""
    };

    if (cleanBase64) {
      updateFields["SERV_IMG_ENV"] = cleanBase64;
    }

    const { data, error } = await supabase
      .from('serviciostecnicos')
      .update(updateFields)
      .eq('SERV_ID', SERV_ID)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Servicio actualizado correctamente en la nube",
      data: data
    };

  } catch (error) {
    console.error("❌ Error en editarServicio.js:", error.message);
    return {
      success: false,
      message: "Error al actualizar el servicio: " + error.message
    };
  }
};