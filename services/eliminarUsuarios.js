import { supabase } from './supabase';

/**
 * Lógica extraída de eliminar-usuario.php
 * Elimina un registro de forma permanente en 'usersmovil' o 'usersweb'.
 */
export const eliminarUsuarios = async (id, origen) => {
  try {
    // 1. Validar que tengamos los datos necesarios
    if (!id || !origen) {
      return { success: false, message: "ID y origen son requeridos para eliminar." };
    }

    // 2. Determinar tabla y columna de ID (Mapeo idéntico al PHP)
    // En Supabase usamos minúsculas: mov_id o web_id
    const tabla = (origen === 'MOVIL') ? 'usersmovil' : 'usersweb';
    const columnaId = (origen === 'MOVIL') ? 'mov_id' : 'web_id';

    // 3. Ejecutar la eliminación
    const { error } = await supabase
      .from(tabla)
      .delete()
      .eq(columnaId, id);

    if (error) throw error;

    return { 
      success: true, 
      message: `Usuario eliminado de la tabla ${tabla} correctamente.` 
    };

  } catch (error) {
    console.error("Error en eliminarUsuario.js:", error.message);
    return { 
      success: false, 
      message: "No se pudo eliminar el usuario: " + error.message 
    };
  }
};