import { supabase } from './supabase';

/**
 * Lógica extraída de editar-usuarios.php
 * Actualiza la información de un usuario en 'usersmovil' o 'usersweb' según su origen.
 * Solo actualiza la clave si se proporciona una nueva.
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

    // 1. Configuración dinámica según el origen (Equivalente al IF del PHP)
    if (origen === 'MOVIL') {
      tabla = 'usersmovil';
      columnaId = 'mov_id';
      camposAActualizar = {
        nom_mov: nombre,
        mov_ape: apellido,
        mov_celu: celular,
        mov_usu: usuario
      };
      
      // Si enviaron clave, la sumamos al objeto (Equivalente al bind_param dinámico)
      if (clave && clave.trim() !== '') {
        camposAActualizar.mov_clave = clave;
      }

    } else {
      tabla = 'usersweb';
      columnaId = 'web_id';
      camposAActualizar = {
        web_nombres: nombre,
        web_apellidos: apellido,
        web_celu: celular,
        web_usu: usuario
      };

      if (clave && clave.trim() !== '') {
        camposAActualizar.web_clave = clave;
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
    console.error("Error en editarUsuarios.js:", error.message);
    return { 
      success: false, 
      message: "Error al actualizar usuario: " + error.message 
    };
  }
};