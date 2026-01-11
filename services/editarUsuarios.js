import { supabase } from './supabase';

/**
 * Lógica extraída de editar-usuarios.php
 * Actualiza la información de un usuario en 'usersmovil' o 'usersweb' según su origen.
 * Ajustado para nombres de columna en MAYÚSCULAS.
 */
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

    // 1. Configuración dinámica según el origen
    if (origen === 'MOVIL') {
      tabla = 'usersmovil';
      columnaId = 'MOV_ID'; // Mayúsculas
      camposAActualizar = {
        "NOM_MOV": nombre,
        "MOV_APE": apellido,
        "MOV_CELU": String(celular).trim(),
        "MOV_USU": usuario
      };
      
      // Solo actualizamos la clave si se proporcionó una nueva
      if (clave && clave.trim() !== '') {
        camposAActualizar["MOV_CLAVE"] = clave;
      }

    } else {
      tabla = 'usersweb';
      columnaId = 'WEB_ID'; // Mayúsculas
      camposAActualizar = {
        "WEB_NOMBRES": nombre,
        "WEB_APELLIDOS": apellido,
        "WEB_CELU": String(celular).trim(),
        "WEB_USU": usuario
      };

      if (clave && clave.trim() !== '') {
        camposAActualizar["WEB_CLAVE"] = clave;
      }
    }

    // 2. Ejecución de la actualización en Supabase
    const { data, error } = await supabase
      .from(tabla)
      .update(camposAActualizar)
      .eq(columnaId, id)
      .select()
      .single();

    if (error) throw error;

    return { 
      success: true, 
      message: `Usuario de tipo ${origen} actualizado correctamente.`, 
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