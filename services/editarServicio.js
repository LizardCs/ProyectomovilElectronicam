import { supabase } from './supabase';

/**
 * Lógica extraída de actualizar-servicio.php
 * Actualiza la información de un servicio técnico por su ID.
 */
export const editarServicio = async (formData) => {
  try {
    const {
      SERV_ID,
      SERV_NUM,
      SERV_DESCRIPCION,
      SERV_CED_REC,
      SERV_NOM_REC,
      SERV_IMG_ENV // La cadena Base64 (nueva o previa)
    } = formData;

    // Validación de seguridad (Igual que el PHP)
    if (!SERV_ID) {
      return { success: false, message: "Falta el ID del servicio para realizar la actualización." };
    }

    // 1. Procesamiento de la imagen
    let imagenBytes = null;

    if (SERV_IMG_ENV) {
      // Limpiamos el encabezado "data:image/jpeg;base64," si existe
      const pureBase64 = SERV_IMG_ENV.includes(',') 
        ? SERV_IMG_ENV.split(',')[1] 
        : SERV_IMG_ENV;

      try {
        // Convertimos el string Base64 a binario (Uint8Array) para la columna BYTEA
        const binaryString = atob(pureBase64);
        imagenBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          imagenBytes[i] = binaryString.charCodeAt(i);
        }
      } catch (e) {
        // Si el atob falla, probablemente la imagen no cambió y estamos recibiendo 
        // un formato no procesable, por lo tanto no actualizamos esa columna.
        console.log("No se detectó una imagen nueva para procesar.");
      }
    }

    // 2. Construcción del objeto de actualización (Mapeo a minúsculas de Supabase)
    const updateFields = {
      serv_num: SERV_NUM,
      serv_descripcion: SERV_DESCRIPCION,
      serv_ced_rec: SERV_CED_REC,
      serv_nom_rec: SERV_NOM_REC,
    };

    // Solo añadimos la imagen al objeto si realmente tenemos bytes nuevos
    if (imagenBytes) {
      updateFields.serv_img_env = imagenBytes;
    }

    // 3. Ejecución del UPDATE
    const { data, error } = await supabase
      .from('serviciostecnicos')
      .update(updateFields)
      .eq('serv_id', SERV_ID)
      .select()
      .single();

    if (error) throw error;

    return { 
      success: true, 
      message: "Servicio actualizado correctamente en la nube", 
      data: data 
    };

  } catch (error) {
    console.error("Error en editarServicio.js:", error.message);
    return { 
      success: false, 
      message: "Error al actualizar: " + error.message 
    };
  }
};