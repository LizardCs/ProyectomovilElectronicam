import { supabase } from './supabase';

/**
 * Lógica extraída de actualizar-servicio.php
 * Actualiza la información de un servicio técnico por su ID.
 * Cuadrado con nombres en MAYÚSCULAS y almacenamiento TEXT para imágenes.
 */
export const editarServicio = async (formData) => {
  try {
    const {
      SERV_ID,
      SERV_NUM,
      SERV_DESCRIPCION,
      SERV_CED_REC,
      SERV_NOM_REC,
      SERV_IMG_ENV // La cadena Base64 (puede ser nueva o la misma)
    } = formData;

    // Validación de seguridad
    if (!SERV_ID) {
      return { success: false, message: "Falta el ID del servicio para realizar la actualización." };
    }

    // 1. Procesamiento de la imagen (Limpieza de prefijo)
    // Si la imagen viene con el encabezado "data:image...", lo limpiamos para guardar solo el Base64 puro
    let cleanBase64 = null;
    if (SERV_IMG_ENV) {
        cleanBase64 = SERV_IMG_ENV.includes(',') 
            ? SERV_IMG_ENV.split(',')[1] 
            : SERV_IMG_ENV;
    }

    // 2. Construcción del objeto de actualización (Usando MAYÚSCULAS de la DB)
    const updateFields = {
      "SERV_NUM": String(SERV_NUM),
      "SERV_DESCRIPCION": SERV_DESCRIPCION,
      "SERV_CED_REC": String(SERV_CED_REC).trim(),
      "SERV_NOM_REC": SERV_NOM_REC,
    };

    // Solo actualizamos la columna de la imagen si se envió una imagen válida
    if (cleanBase64) {
      updateFields["SERV_IMG_ENV"] = cleanBase64;
    }

    // 3. Ejecución del UPDATE en Supabase
    const { data, error } = await supabase
      .from('serviciostecnicos')
      .update(updateFields)
      .eq('SERV_ID', SERV_ID) // Filtro por ID en MAYÚSCULAS
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