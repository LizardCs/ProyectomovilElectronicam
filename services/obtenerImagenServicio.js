import { supabase } from './supabase';

/**
 * Recupera únicamente la cadena Base64 de la imagen de un servicio específico.
 * Ajustado para columnas en MAYÚSCULAS según la base de datos definitiva.
 */
export const obtenerImagenServicio = async (servId) => {
  try {
    // 1. Validación de ID
    if (!servId) return { success: false, imagen: null };

    // 2. Consulta a Supabase usando nombres en MAYÚSCULAS
    const { data, error } = await supabase
      .from('serviciostecnicos')
      .select('SERV_IMG_ENV') // <-- Antes era serv_img_env
      .eq('SERV_ID', servId)    // <-- Antes era serv_id
      .single();

    if (error) throw error;

    return { 
        success: true, 
        imagen: data.SERV_IMG_ENV 
    };

  } catch (error) {
    console.error("❌ Error en obtenerImagenServicio.js:", error.message);
    return { 
        success: false, 
        message: "No se pudo descargar la imagen: " + error.message,
        imagen: null 
    };
  }
};