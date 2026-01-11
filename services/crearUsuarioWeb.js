import { supabase } from './supabase';

/**
 * Lógica extraída de crear-usuario-web.php
 * Registra un nuevo usuario en la tabla 'usersweb'.
 */
export const crearUsuarioWeb = async (userData) => {
  try {
    // 1. Mapeo de datos (idéntico a lo que recibía tu PHP)
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

    // 3. Inserción en la tabla usersweb
    // Nota: Usamos nombres en minúsculas para las columnas de Postgres
    const { data, error } = await supabase
      .from('usersweb')
      .insert([
        {
          web_ced: cedula,
          web_nombres: nombre,
          web_apellidos: apellido,
          web_usu: usuario,
          web_clave: clave,
          web_celu: celular,
          web_fec_creado: new Date().toISOString() // Equivalente al NOW() de PHP
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
    console.error("Error en crearUsuarioWeb.js:", error.message);
    return { 
      success: false, 
      message: error.message 
    };
  }
};