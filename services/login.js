import { supabase } from './supabase';

export const login = async (usuario, clave) => {
  try {
    if (!usuario || !clave) {
      return { success: false, message: "Usuario y contraseña requeridos" };
    }

    // Limpiamos espacios y forzamos minúsculas para el usuario (opcional pero recomendado)
    const usuarioLimpio = usuario.trim().toLowerCase();
    const claveLimpia = clave.trim();

    console.log("--- INTENTO DE ACCESO ---");
    console.log("Usuario:", usuarioLimpio);

    // 1. Intentamos buscar en la tabla de personal móvil (Técnicos/Admins de campo)
    let { data: movilData, error: movilError } = await supabase
      .from('USERSMOVIL')
      .select('MOV_ID, MOV_CED, NOM_MOV, MOV_APE, MOV_ROL, MOV_CELU, MOV_USU, MOV_CLAVE')
      .eq('MOV_USU', usuarioLimpio)
      .eq('MOV_CLAVE', claveLimpia)
      .maybeSingle();

    if (movilError) console.error("Error USERSMOVIL:", movilError.message);

    let esAdmin = false;
    let userData = movilData;

    if (movilData) {
      console.log("✅ Usuario encontrado en USERSMOVIL");
      esAdmin = parseInt(movilData.MOV_ROL) === 1;
    } else {
      // 2. Si no está en movil, buscamos en la tabla de usuarios WEB (Administradores)
      console.log("Buscando en USERSWEB...");
      const { data: webData, error: webError } = await supabase
        .from('USERSWEB')
        .select('WEB_ID, WEB_CED, WEB_NOMBRES, WEB_APELLIDOS, WEB_USU, WEB_CLAVE, WEB_CELU')
        .eq('WEB_USU', usuarioLimpio)
        .eq('WEB_CLAVE', claveLimpia)
        .maybeSingle();

      if (webError) console.error("Error USERSWEB:", webError.message);

      if (webData) {
        console.log("✅ Usuario encontrado en USERSWEB");
        // Mapeamos los datos web a la estructura móvil para no romper la App
        userData = {
          MOV_ID: webData.WEB_ID,
          MOV_CED: webData.WEB_CED,
          NOM_MOV: webData.WEB_NOMBRES,
          MOV_APE: webData.WEB_APELLIDOS,
          MOV_ROL: 1, // Los de la web siempre son admins
          MOV_CELU: webData.WEB_CELU,
          MOV_USU: webData.WEB_USU
        };
        esAdmin = true;
      }
    }

    // 3. Validación final de existencia
    if (!userData) {
      return { success: false, message: "Usuario o contraseña incorrectos" };
    }

    const rol_nombre = esAdmin ? "admin" : "tecnico";
    const redirect_to = esAdmin ? "/admin/home" : "/tecnico/home";

    return {
      success: true,
      message: "Login exitoso",
      user: {
        id: userData.MOV_ID,
        cedula: userData.MOV_CED,
        nombre: userData.NOM_MOV,
        apellido: userData.MOV_APE,
        nombre_completo: `${userData.NOM_MOV} ${userData.MOV_APE}`,
        telefono: userData.MOV_CELU || '',
        usuario: userData.MOV_USU,
        rol: userData.MOV_ROL,
        rol_nombre: rol_nombre
      },
      redirect_to: redirect_to
    };

  } catch (error) {
    console.error("❌ Error Crítico en login.js:", error.message);
    return {
      success: false,
      message: "Error de conexión con el servidor de seguridad"
    };
  }
};