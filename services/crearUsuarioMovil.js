import { supabase } from './supabase';

/**
 * Lógica extraída de crear-usuario-movil.php
 * Registra un nuevo usuario en la tabla 'usersmovil' usando nombres en MAYÚSCULAS.
 */
export const crearUsuarioMovil = async (userData) => {
  try {
    // 1. Captura de datos
    const { 
      cedula, 
      nombre, 
      apellido, 
      celular, 
      usuario, 
      clave, 
      rol 
    } = userData;

    // 2. Validación básica
    if (!cedula || !usuario || !clave) {
      return { 
        success: false, 
        message: "Faltan campos obligatorios (Cédula, Usuario o Clave)" 
      };
    }

    // 3. Inserción en Supabase con nombres de columna en MAYÚSCULAS
    const { data, error } = await supabase
      .from('usersmovil')
      .insert([
        {
          "MOV_CED": String(cedula).trim(),
          "NOM_MOV": nombre,
          "MOV_APE": apellido,
          "MOV_CELU": String(celular).trim(),
          "MOV_USU": usuario,
          "MOV_CLAVE": clave, 
          "MOV_ROL": rol || 0 
        }
      ])
      .select()
      .single();

    if (error) {
      // Error 23505: Violación de unicidad (Cédula o Usuario duplicado)
      if (error.code === '23505') {
        throw new Error("La cédula o el nombre de usuario ya existen en el sistema.");
      }
      throw error;
    }

    return { 
      success: true, 
      message: "Usuario móvil creado con éxito", 
      data: data 
    };

  } catch (error) {
    console.error("❌ Error en crearUsuarioMovil.js:", error.message);
    return { 
      success: false, 
      message: error.message 
    };
  }
};