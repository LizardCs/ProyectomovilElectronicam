import { supabase } from './supabase';

export const buscarCliente = async (query) => {
  try {
    if (!query || query.trim() === '') {
      return { success: false, data: null };
    }

    const textoBusqueda = String(query).trim();
    const { data, error } = await supabase
      .from('CLIENTES')
      .select('CLI_CEDULA, CLI_NOMBRES, CLI_TELEFONO, CLI_CORREO, CLI_DIRECCION, CLI_CIUDAD')
      .or(`CLI_CEDULA.eq.${textoBusqueda},CLI_TELEFONO.eq.${textoBusqueda}`)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return { success: true, cliente: data };
    } else {
      return { success: false, data: null };
    }

  } catch (error) {
    console.error("Error en buscarCliente.js:", error.message);
    return { success: false, message: error.message };
  }
};