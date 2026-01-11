import { supabase } from './supabase';

/**
 * Lógica extraída de obtener-usuarios.php
 * Recupera y unifica los usuarios de 'usersmovil' y 'usersweb' usando MAYÚSCULAS.
 */
export const obtenerUsuarios = async () => {
  try {
    // 1. Obtener datos de la tabla Móvil (Personal Técnico/Admin)
    const { data: dataMovil, error: errorMovil } = await supabase
      .from('usersmovil')
      .select('MOV_ID, MOV_CED, NOM_MOV, MOV_APE, MOV_USU, MOV_ROL');

    if (errorMovil) throw errorMovil;

    // 2. Obtener datos de la tabla Web (Clientes)
    const { data: dataWeb, error: errorWeb } = await supabase
      .from('usersweb')
      .select('WEB_ID, WEB_CED, WEB_NOMBRES, WEB_APELLIDOS, WEB_USU');

    if (errorWeb) throw errorWeb;

    // 3. Mapeo y Unificación (Convertimos de la DB a lo que espera la UI)
    const usuariosMovil = dataMovil.map(u => ({
      id: u.MOV_ID,
      cedula: u.MOV_CED,
      nombre: u.NOM_MOV,
      apellido: u.MOV_APE,
      usuario: u.MOV_USU,
      rol: u.MOV_ROL,
      origen: 'MOVIL'
    }));

    const usuariosWeb = dataWeb.map(u => ({
      id: u.WEB_ID,
      cedula: u.WEB_CED,
      nombre: u.WEB_NOMBRES,
      apellido: u.WEB_APELLIDOS,
      usuario: u.WEB_USU,
      rol: 'WEB', // Etiqueta fija para clientes
      origen: 'WEB'
    }));

    // 4. Combinar ambas listas en un solo array (Simulando un UNION de SQL)
    const listaUnificada = [...usuariosMovil, ...usuariosWeb];

    

    return {
      success: true,
      usuarios: listaUnificada
    };

  } catch (error) {
    console.error("❌ Error en obtenerUsuarios.js:", error.message);
    return {
      success: false,
      message: "No se pudo unificar la lista de usuarios: " + error.message,
      usuarios: []
    };
  }
};