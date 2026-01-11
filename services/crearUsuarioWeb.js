import { supabase } from './supabase';

/**
 * Lógica extraída de crear-usuario-web.php
 * Registra un nuevo usuario en la tabla 'usersweb' usando nombres en MAYÚSCULAS.
 */
export const crearUsuarioWeb = async (userData) => {
  try {
    // 1. Mapeo de datos (recibidos desde el formulario)
    const { 
      cedula, 
      nombre, 
      apellido, 
      usuario, 
      clave, 
      celular 
    } = userData;

    // 2. Validación de campos críticos
    if (!cedula || !usuario || !clave) {
      return { 
        success: false, 
        message: "Faltan campos críticos (Cédula, Usuario o Clave)" 
      };
    }

    // 3. Inserción en la tabla usersweb con nombres de columna en MAYÚSCULAS
    const { data, error } = await supabase
      .from('usersweb')
      .insert([
        {
          "WEB_CED": String(cedula).trim(),
          "WEB_NOMBRES": nombre,
          "WEB_APELLIDOS": apellido,
          "WEB_USU": usuario,
          "WEB_CLAVE": clave,
          "WEB_CELU": String(celular).trim(),
          "WEB_FEC_CREADO": new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      // Manejo de duplicados (Error 23505 en PostgreSQL)
      if (error.code === '23505') {
        throw new Error("Esta cédula o usuario ya está registrado en el sistema web.");
      }
      throw error;
    }

    return { 
      success: true, 
      message: "Usuario web creado exitosamente", 
      data: data 
    };

  } catch (error) {
    console.error("❌ Error en crearUsuarioWeb.js:", error.message);
    return { 
      success: false, 
      message: error.message 
    };
  }
};