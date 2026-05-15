import { supabase } from './supabase';

export const crearServicio = async (formData) => {
  try {
    const {
      SERV_NUM,
      SERV_DESCRIPCION,
      SERV_CED_ENV, 
      SERV_CED_REC, 
      SERV_EST,
      SERV_IMG_ENV,
      SERV_OBS,
      SERV_REQUIERE_FACT,

      SERV_CED_CLI,
      SERV_NOM_CLI,
      SERV_TEL_CLI,
      SERV_CIUDAD,
      SERV_DIR,
      SERV_CORREO_CLI
    } = formData;

    if (!SERV_NUM || !SERV_TEL_CLI) {
      return { 
        success: false, 
        message: "El número de servicio y el teléfono del cliente son obligatorios." 
      };
    }

    let cliId = null;
    const cedulaCliente = SERV_CED_CLI ? String(SERV_CED_CLI).trim() : "";
    const telefonoCliente = String(SERV_TEL_CLI).trim();

    let query = supabase.from('CLIENTES').select('CLI_ID');
    if (cedulaCliente !== "") {
      query = query.eq('CLI_CEDULA', cedulaCliente);
    } else {
      query = query.eq('CLI_TELEFONO', telefonoCliente);
    }
    
    const { data: clienteExistente } = await query.maybeSingle();

    if (clienteExistente) {
      cliId = clienteExistente.CLI_ID;
    } else {
      const { data: nuevoCliente, error: errCliente } = await supabase
        .from('CLIENTES')
        .insert([{
          "CLI_CEDULA": cedulaCliente !== "" ? cedulaCliente : null,
          "CLI_NOMBRES": SERV_NOM_CLI || "Consumidor Final",
          "CLI_CORREO": SERV_CORREO_CLI || "",
          "CLI_TELEFONO": telefonoCliente,
          "CLI_DIRECCION": SERV_DIR || "",
          "CLI_CIUDAD": SERV_CIUDAD || ""
        }])
        .select('CLI_ID')
        .single();

      if (errCliente) throw new Error("Error al registrar cliente: " + errCliente.message);
      cliId = nuevoCliente.CLI_ID;
    }

    let webId = null;
    if (SERV_CED_ENV) {
      const { data: admin } = await supabase
        .from('USERSWEB')
        .select('WEB_ID')
        .eq('WEB_CED', String(SERV_CED_ENV).trim())
        .maybeSingle();
      if (admin) webId = admin.WEB_ID;
    }

    let movId = null;
    if (SERV_CED_REC) {
      const { data: tech } = await supabase
        .from('USERSMOVIL')
        .select('MOV_ID')
        .eq('MOV_CED', String(SERV_CED_REC).trim())
        .maybeSingle();
      if (tech) movId = tech.MOV_ID;
    }

    const { data, error } = await supabase
      .from('SERVICIOSTECNICOS')
      .insert([{
        "SERV_NUM": String(SERV_NUM).trim(),
        "SERV_DESCRIPCION": SERV_DESCRIPCION || "",
        "SERV_WEB_ID": webId,
        "SERV_MOV_ID": movId,
        "SERV_CLI_ID": cliId,
        "SERV_EST": SERV_EST || 0,
        "SERV_IMG_ENV": SERV_IMG_ENV || null,
        "SERV_OBS": SERV_OBS || "",
        "SERV_REQUIERE_FACT": SERV_REQUIERE_FACT || false
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error("Este número de servicio ya se encuentra registrado.");
      throw error;
    }

    return {
      success: true,
      message: "Servicio técnico y asignaciones creadas exitosamente",
      data: data
    };

  } catch (error) {
    console.error("❌ Error en crearServicio.js:", error.message);
    return {
      success: false,
      message: error.message
    };
  }
};