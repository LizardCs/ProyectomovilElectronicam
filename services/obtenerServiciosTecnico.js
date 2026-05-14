import { supabase } from './supabase';

export const obtenerServiciosTecnico = async (cedula) => {
  try {
    if (!cedula) return { success: false, message: "Cédula requerida" };

    // 1. Buscamos el ID interno del técnico usando su cédula
    const { data: techData, error: techError } = await supabase
      .from('USERSMOVIL')
      .select('MOV_ID')
      .eq('MOV_CED', String(cedula).trim())
      .single();

    if (techError || !techData) {
      throw new Error("No se encontró el perfil del técnico.");
    }

    // 2. Buscamos los servicios asignados a ese MOV_ID y hacemos JOIN para traer los datos útiles
    const { data, error } = await supabase
      .from('SERVICIOSTECNICOS')
      .select(`
        SERV_ID, 
        SERV_NUM, 
        SERV_DESCRIPCION, 
        SERV_FECH_ASIG, 
        SERV_FECH_FIN, 
        SERV_EST,
        SERV_IMG_ENV,
        CLIENTES (
          CLI_NOMBRES,
          CLI_TELEFONO,
          CLI_DIRECCION
        ),
        USERSWEB (
          WEB_NOMBRES,
          WEB_APELLIDOS
        )
      `)
      .eq('SERV_MOV_ID', techData.MOV_ID)
      .order('SERV_FECH_ASIG', { ascending: false });

    if (error) throw error;

    // 3. Mapeamos la data para que tu interfaz la lea facilito
    const serviciosMapeados = data.map(s => ({
      SERV_ID: s.SERV_ID,
      SERV_NUM: s.SERV_NUM,
      SERV_DESCRIPCION: s.SERV_DESCRIPCION,
      SERV_FECH_ASIG: s.SERV_FECH_ASIG,
      SERV_FECH_FIN: s.SERV_FECH_FIN,
      SERV_EST: s.SERV_EST,
      SERV_IMG_ENV: s.SERV_IMG_ENV,
      
      // Datos del Cliente (Vital para que el técnico sepa a dónde ir)
      SERV_NOM_CLI: s.CLIENTES?.CLI_NOMBRES || 'Cliente sin nombre',
      SERV_TEL_CLI: s.CLIENTES?.CLI_TELEFONO || 'Sin teléfono',
      SERV_DIR_CLI: s.CLIENTES?.CLI_DIRECCION || 'Sin dirección',

      // Quien lo asignó (El Admin de la oficina)
      SERV_NOM_ENV: s.USERSWEB ? `${s.USERSWEB.WEB_NOMBRES} ${s.USERSWEB.WEB_APELLIDOS}` : 'Administración',
    }));

    return {
      success: true,
      servicios: serviciosMapeados
    };

  } catch (error) {
    console.error("❌ Error en obtenerServiciosTecnico.js:", error.message);
    return {
      success: false,
      message: "No se pudo cargar tu lista de trabajos: " + error.message,
      servicios: []
    };
  }
};