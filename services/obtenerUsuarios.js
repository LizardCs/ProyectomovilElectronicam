import { supabase } from './supabase';

/**
 * Lógica extraída de obtener-usuarios.php
 * Recupera y unifica los usuarios de las tablas 'usersmovil' y 'usersweb'.
 */
export const obtenerUsuarios = async () => {
  try {
    // 1. Obtener datos de la tabla Móvil (Personal)
    const { data: dataMovil, error: errorMovil } = await supabase
      .from('usersmovil')
      .select('mov_id, mov_ced, nom_mov, mov_ape, mov_usu, mov_rol');

    if (errorMovil) throw errorMovil;

    // 2. Obtener datos de la tabla Web (Clientes/Reportes)
    const { data: dataWeb, error: errorWeb } = await supabase
      .from('usersweb')
      .select('web_id, web_ced, web_nombres, web_apellidos, web_usu');

    if (errorWeb) throw errorWeb;

    // 3. Mapeo y Unificación (Simulando el alias 'as' del PHP)
    const usuariosMovil = dataMovil.map(u => ({
      id: u.mov_id,
      cedula: u.mov_ced,
      nombre: u.nom_mov,
      apellido: u.mov_ape,
      usuario: u.mov_usu,
      rol: u.mov_rol,
      origen: 'MOVIL'
    }));

    const usuariosWeb = dataWeb.map(u => ({
      id: u.web_id,
      cedula: u.web_ced,
      nombre: u.web_nombres,
      apellido: u.web_apellidos,
      usuario: u.web_usu,
      rol: 'WEB', // Rol fijo como en tu PHP
      origen: 'WEB'
    }));

    // 4. Combinar ambas listas en un solo array
    const listaUnificada = [...usuariosMovil, ...usuariosWeb];

    return {
      success: true,
      usuarios: listaUnificada
    };

  } catch (error) {
    console.error("Error en obtenerUsuarios.js:", error.message);
    return {
      success: false,
      message: "No se pudo unificar la lista de usuarios: " + error.message,
      usuarios: []
    };
  }
};