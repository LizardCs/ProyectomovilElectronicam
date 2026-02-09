import { supabase } from './supabase';

export const eliminarUsuario = async (id, origen) => {
  try {
    if (!id || !origen) {
      return { success: false, message: "ID y origen son requeridos para eliminar." };
    }

    const tabla = (origen === 'MOVIL') ? 'usersmovil' : 'usersweb';
    const columnaId = (origen === 'MOVIL') ? 'MOV_ID' : 'WEB_ID';

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