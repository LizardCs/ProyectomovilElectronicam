import { supabase } from './supabase';

export const editarServicio = async (formData) => {
  try {
    const {
      SERV_ID,
      SERV_NUM,
      SERV_DESCRIPCION,
      SERV_CED_REC,
      SERV_NOM_REC,
      SERV_IMG_ENV
    } = formData;

    if (!SERV_ID) {
      return { success: false, message: "Falta el ID del servicio para realizar la actualización." };
    }

    let cleanBase64 = null;
    if (SERV_IMG_ENV) {
        cleanBase64 = SERV_IMG_ENV.includes(',') 
            ? SERV_IMG_ENV.split(',')[1] 
            : SERV_IMG_ENV;
    }

    const updateFields = {
      "SERV_NUM": String(SERV_NUM),
      "SERV_DESCRIPCION": SERV_DESCRIPCION,
      "SERV_CED_REC": String(SERV_CED_REC).trim(),
      "SERV_NOM_REC": SERV_NOM_REC,
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