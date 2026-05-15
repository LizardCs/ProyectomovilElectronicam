import { supabase } from './supabase';

export const editarServicio = async (formData) => {
  try {
    const {
      SERV_ID,
      SERV_NUM,
      SERV_DESCRIPCION,
      SERV_CED_REC,
      SERV_IMG_ENV,
      SERV_NOM_CLI,
      SERV_TEL_CLI,
      SERV_CIUDAD,
      SERV_DIR,
      SERV_OBS,
      SERV_REQUIERE_FACT,
      SERV_CED_CLI,
      SERV_CORREO_CLI
    } = formData;

    if (!SERV_ID) {
      return { success: false, message: "Falta el ID del servicio para realizar la actualización." };
    }

    let cleanBase64 = null;
    if (SERV_IMG_ENV && SERV_IMG_ENV.startsWith('data:image')) {
      cleanBase64 = SERV_IMG_ENV.split(',')[1];
    } else if (SERV_IMG_ENV) {
      cleanBase64 = SERV_IMG_ENV;
    }

    let cliId = null;
    if (SERV_CED_CLI) {
      const cedulaCliente = String(SERV_CED_CLI).trim();
      
      const { data: clienteExistente } = await supabase
        .from('CLIENTES')
        .select('CLI_ID')
        .eq('CLI_CEDULA', cedulaCliente)
        .maybeSingle();

      if (clienteExistente) {
        cliId = clienteExistente.CLI_ID;
        await supabase
          .from('CLIENTES')
          .update({
            "CLI_NOMBRES": SERV_NOM_CLI ? String(SERV_NOM_CLI).trim() : "Consumidor Final",
            "CLI_CORREO": SERV_CORREO_CLI ? String(SERV_CORREO_CLI).trim() : "",
            "CLI_TELEFONO": SERV_TEL_CLI ? String(SERV_TEL_CLI).trim() : "",
            "CLI_DIRECCION": SERV_DIR ? String(SERV_DIR).trim() : "",
            "CLI_CIUDAD": SERV_CIUDAD ? String(SERV_CIUDAD).trim() : ""
          })
          .eq('CLI_ID', cliId);
      } else {
        const { data: nuevoCliente, error: errCliente } = await supabase
          .from('CLIENTES')
          .insert([{
            "CLI_CEDULA": cedulaCliente,
            "CLI_NOMBRES": SERV_NOM_CLI ? String(SERV_NOM_CLI).trim() : "Consumidor Final",
            "CLI_CORREO": SERV_CORREO_CLI ? String(SERV_CORREO_CLI).trim() : "",
            "CLI_TELEFONO": SERV_TEL_CLI ? String(SERV_TEL_CLI).trim() : "",
            "CLI_DIRECCION": SERV_DIR ? String(SERV_DIR).trim() : "",
            "CLI_CIUDAD": SERV_CIUDAD ? String(SERV_CIUDAD).trim() : ""
          }])
          .select('CLI_ID')
          .single();

        if (errCliente) throw new Error("Error al registrar el nuevo cliente: " + errCliente.message);
        cliId = nuevoCliente.CLI_ID;
      }
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

    const updateFields = {
      "SERV_NUM": String(SERV_NUM).trim(),
      "SERV_DESCRIPCION": SERV_DESCRIPCION || "",
      "SERV_MOV_ID": movId,
      "SERV_OBS": SERV_OBS || "",
      "SERV_REQUIERE_FACT": SERV_REQUIERE_FACT
    };

    if (cliId) {
      updateFields.serv_ced_cli = cliId; 
    }

    if (cleanBase64) {
      updateFields["SERV_IMG_ENV"] = cleanBase64;
    }

    const { data, error } = await supabase
      .from('SERVICIOSTECNICOS')
      .update(updateFields)
      .eq('SERV_ID', SERV_ID)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Servicio y datos vinculados actualizados correctamente.",
      data: data
    };

  } catch (error) {
    console.error("❌ Error en editarServicio.js:", error.message);
    return {
      success: false,
      message: "Error al actualizar el servicio: " + error.message
    };
  }
};