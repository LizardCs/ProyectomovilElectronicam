import { supabase } from './supabase';

/**
 * Lógica extraída de obtener-tecnicos.php
 * Recupera la lista de técnicos (MOV_ROL = 0) usando nombres en MAYÚSCULAS.
 */
export const obtenerTecnicos = async () => {
  try {
    // 1. Consulta a Supabase con nombres exactos de la DB
    // Filtramos por técnicos (0) y ordenamos alfabéticamente por nombre
    const { data, error } = await supabase
      .from('usersmovil')
      .select('MOV_CED, NOM_MOV, MOV_APE')
      .eq('MOV_ROL', 0)
      .order('NOM_MOV', { ascending: true });

    if (error) throw error;

    // 2. Mapeo y Concatenación
    // Postgres devuelve las llaves en MAYÚSCULAS, las mapeamos para la UI
    const tecnicosMapeados = data.map(t => ({
      MOV_CED: t.MOV_CED,
      NOM_MOV: t.NOM_MOV,
      MOV_APE: t.MOV_APE,
      // Creamos nombre_completo para que el Picker lo muestre fácilmente
      nombre_completo: `${t.NOM_MOV} ${t.MOV_APE}`.trim()
    }));

    // 3. Validación de resultados
    if (tecnicosMapeados.length > 0) {
      return {
        success: true,
        tecnicos: tecnicosMapeados
      };
    } else {
      return {
        success: false,
        message: "No se encontraron técnicos registrados",
        tecnicos: []
      };
    }

  } catch (error) {
    console.error("❌ Error en obtenerTecnicos.js:", error.message);
    return {
      success: false,
      message: "Error al obtener lista de técnicos: " + error.message,
      tecnicos: []
    };
  }
};