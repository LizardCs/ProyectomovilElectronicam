import { supabase } from './supabase';

export const crearUsuarioMovil = async (userData) => {
  try {
    const {
      cedula,
      nombre,
      apellido,
      celular,
      usuario,
      clave,
      rol
    } = userData;

    if (!cedula || !usuario || !clave) {
      return {
        success: false,
        message: "Faltan campos obligatorios (Cédula, Usuario o Clave)"
      };
    }

    const rolNumerico = parseInt(rol);
    const rolFinal = isNaN(rolNumerico) ? 0 : rolNumerico;

    const { data, error } = await supabase
      .from('USERSMOVIL')
      .insert([
        {
          "MOV_CED": String(cedula).trim(),
          "NOM_MOV": nombre,
          "MOV_APE": apellido,
          "MOV_CELU": String(celular).trim(),
          "MOV_USU": usuario.trim().toLowerCase(),
          "MOV_CLAVE": clave,
          "MOV_ROL": rolFinal 
        }
      ])
      .select()
      .single();

    if (error) {
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