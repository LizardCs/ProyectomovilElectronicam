import { supabase } from './supabase';

/**
 * Lógica extraída de crear-usuario-movil.php
 * Registra un nuevo usuario en la tabla 'usersmovil'.
 */
export const crearUsuarioMovil = async (userData) => {
  try {
    // 1. Captura de datos (Mapeo idéntico al que tenías en el data['...'] del PHP)
    const { 
      cedula, 
      nombre, 
      apellido, 
      celular, 
      usuario, 
      clave, 
      rol 
    } = userData;

    // 2. Validación de campos obligatorios (Igual que en tu PHP)
    if (!cedula || !usuario || !clave) {
      return { 
        success: false, 
        message: "Faltan campos obligatorios (Cédula, Usuario o Clave)" 
      };
    }

    // 3. Inserción en Supabase
    // Mapeamos las variables a las columnas reales de la base de datos (en minúsculas)
    const { data, error } = await supabase
      .from('usersmovil')
      .insert([
        {
          mov_ced: cedula,
          nom_mov: nombre,
          mov_ape: apellido,
          mov_celu: celular,
          mov_usu: usuario,
          mov_clave: clave, // En producción se recomienda usar hash, igual que en tu nota del PHP
          mov_rol: rol || 0  // 0 por defecto si no se envía
        }
      ])
      .select()
      .single();

    if (error) {
      // Manejo de error específico (ej: cédula o usuario duplicado)
      if (error.code === '23505') {
        throw new Error("La cédula o el nombre de usuario ya existen.");
      }
      throw error;
    }

    return { 
      success: true, 
      message: "Usuario móvil creado con éxito", 
      data: data 
    };

  } catch (error) {
    console.error("Error en crearUsuarioMovil.js:", error.message);
    return { 
      success: false, 
      message: error.message 
    };
  }
};