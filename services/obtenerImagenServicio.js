import { supabase } from './supabase';

export const obtenerImagenServicio = async (servId) => {
  try {
    if (!servId) return { success: false, imagen: null };

    const { data, error } = await supabase
      .from('serviciostecnicos')
      .select('SERV_IMG_ENV')
      .eq('SERV_ID', servId)   
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