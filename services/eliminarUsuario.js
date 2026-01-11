import { supabase } from './supabase';

/**
 * Lógica extraída de eliminar-usuario.php
 * Elimina un registro de forma permanente en 'usersmovil' o 'usersweb'.
 * Ajustado para nombres de columna en MAYÚSCULAS (MOV_ID / WEB_ID).
 */
export const eliminarUsuario = async (id, origen) => {
  try {
    // 1. Validar datos de entrada
    if (!id || !origen) {
      return { success: false, message: "ID y origen son requeridos para eliminar." };
    }

    // 2. Determinar tabla y columna de ID según el origen
    // Usamos los nombres exactos definidos en el SQL de Supabase
    const tabla = (origen === 'MOVIL') ? 'usersmovil' : 'usersweb';
    const columnaId = (origen === 'MOVIL') ? 'MOV_ID' : 'WEB_ID';

    // 3. Ejecutar la eliminación física en la base de datos
    const { error } = await supabase
      .from(tabla)
      .delete()
      .eq(columnaId, id);

    if (error) throw error;

    return { 
      success: true, 
      message: `El usuario con ID ${id} ha sido eliminado de ${tabla} con éxito.` 
    };

  } catch (error) {
    console.error("❌ Error en eliminarUsuario.js:", error.message);
    return { 
      success: false, 
      message: "No se pudo eliminar el usuario: " + error.message 
    };
  }
};