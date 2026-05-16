// services/obtenerFallos.js
import { supabase } from './supabase';

export const obtenerFallosPorCategoria = async (catId) => {
  try {
    if (!catId) {
      return { success: false, data: [] };
    }

    const { data, error } = await supabase
      .from('EQUIPOS_FALLOS')
      .select('FALLO, SOLUCION')
      .eq('CAT_ID', catId);

    if (error) {
      console.error("Error en consulta:", error);
      throw error;
    }

    if (data && data.length > 0) {
      return { success: true, data: data };
    } else {
      return { success: false, data: [] };
    }

  } catch (error) {
    return { success: false, message: error.message, data: [] };
  }
};