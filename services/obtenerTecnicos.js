import { supabase } from './supabase';

/**
 * Lógica extraída de obtener-tecnicos.php
 * Recupera la lista de usuarios con rol de técnico (mov_rol = 0) para asignación.
 */
export const obtenerTecnicos = async () => {
  try {
    // 1. Consulta a Supabase
    // Filtramos por mov_rol = 0 (Técnicos) y ordenamos por nombre
    const { data, error } = await supabase
      .from('usersmovil')
      .select('mov_ced, nom_mov, mov_ape')
      .eq('mov_rol', 0)
      .order('nom_mov', { ascending: true });

    if (error) throw error;

    // 2. Mapeo y Concatenación (Equivalente al CONCAT de SQL)
    // Creamos el campo 'nombre_completo' manualmente para la UI
    const tecnicosMapeados = data.map(t => ({
      MOV_CED: t.mov_ced,
      NOM_MOV: t.nom_mov,
      MOV_APE: t.mov_ape,
      nombre_completo: `${t.nom_mov} ${t.mov_ape}`.trim()
    }));

    // 3. Respuesta idéntica al formato PHP
    if (tecnicosMapeados.length > 0) {
      return {
        success: true,
        tecnicos: tecnicosMapeados
      };
    } else {
      return {
        success: false,
        message: "No se encontraron técnicos",
        tecnicos: []
      };
    }

  } catch (error) {
    console.error("Error en obtenerTecnicos.js:", error.message);
    return {
      success: false,
      message: "Error al obtener lista de técnicos: " + error.message,
      tecnicos: []
    };
  }
};