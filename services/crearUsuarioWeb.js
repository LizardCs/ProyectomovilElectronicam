import { supabase } from './supabase';

export const crearUsuarioWeb = async (userData) => {
  try {
    const {
      cedula,
      nombre,
      apellido,
      usuario,
      clave,
      celular
    } = userData;

    if (!cedula || !usuario || !clave) {
      return {
        success: false,
        message: "Faltan campos críticos (Cédula, Usuario o Clave)"
      };
    }

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