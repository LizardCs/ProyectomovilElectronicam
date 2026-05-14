import { supabase } from './supabase';

export const editarUsuarios = async (userData) => {
  try {
    const {
      id,
      origen,
      nombre,
      apellido,
      celular,
      usuario,
      clave
    } = userData;

    if (!id || !origen) {
      return { success: false, message: "ID y Origen son requeridos para la edición." };
    }

    let tabla = '';
    let camposAActualizar = {};
    let columnaId = '';

    if (origen === 'MOVIL') {
      tabla = 'USERSMOVIL';
      columnaId = 'MOV_ID';
      camposAActualizar = {
        "NOM_MOV": nombre,
        "MOV_APE": apellido,
        "MOV_CELU": String(celular).trim(),
        "MOV_USU": usuario.trim().toLowerCase()
      };

      if (clave && clave.trim() !== '') {
        camposAActualizar["MOV_CLAVE"] = clave;
      }

    } else {
      tabla = 'USERSWEB';
      columnaId = 'WEB_ID';
      camposAActualizar = {
        "WEB_NOMBRES": nombre,
        "WEB_APELLIDOS": apellido,
        "WEB_CELU": String(celular).trim(),
        "WEB_USU": usuario.trim().toLowerCase()
      };

      if (clave && clave.trim() !== '') {
        camposAActualizar["WEB_CLAVE"] = clave;
      }
    }

    const { data, error } = await supabase
      .from(tabla)
      .update(camposAActualizar)
      .eq(columnaId, id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `Usuario ${origen} actualizado correctamente.`,
      data: data
    };

  } catch (error) {
    console.error("❌ Error en editarUsuarios.js:", error.message);
    return {
      success: false,
      message: "Error al actualizar usuario: " + error.message
    };
  }
};