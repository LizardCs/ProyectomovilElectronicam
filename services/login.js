import { supabase } from './supabase';

/**
 * Lógica extraída de login.php
 * Verifica credenciales en 'usersmovil' usando nombres en MAYÚSCULAS.
 */
export const login = async (usuario, clave) => {
  try {
    if (!usuario || !clave) {
      return { 
        success: false, 
        message: "Usuario y contraseña requeridos" 
      };
    }

    const usuarioLimpio = usuario.trim();
    const claveLimpia = clave.trim();

    // 1. Consulta a Supabase con nombres de columna en MAYÚSCULAS
    const { data, error } = await supabase
      .from('usersmovil')
      .select('MOV_ID, MOV_CED, NOM_MOV, MOV_APE, MOV_ROL, MOV_CELU, MOV_USU')
      .eq('MOV_USU', usuarioLimpio)
      .eq('MOV_CLAVE', claveLimpia)
      .single(); 

    // 2. Manejo de errores o credenciales incorrectas
    if (error || !data) {
      return { 
        success: false, 
        message: "Usuario o contraseña incorrectos" 
      };
    }

    // 3. Determinar rol y ruta (Admin = 1, Técnico = 0)
    // Usamos las propiedades en MAYÚSCULAS que devuelve la DB
    const esAdmin = parseInt(data.MOV_ROL) === 1;
    const rol_nombre = esAdmin ? "admin" : "tecnico";
    const redirect_to = esAdmin ? "/admin/home" : "/tecnico/home";

    // 4. Respuesta con el formato que espera tu App (mapeado para no romper la UI)
    return {
      success: true,
      message: "Login exitoso",
      user: {
        id: data.MOV_ID,
        cedula: data.MOV_CED,
        nombre: data.NOM_MOV,
        apellido: data.MOV_APE,
        nombre_completo: `${data.NOM_MOV} ${data.MOV_APE}`,
        telefono: data.MOV_CELU || '',
        usuario: data.MOV_USU,
        rol: data.MOV_ROL,
        rol_nombre: rol_nombre
      },
      redirect_to: redirect_to
    };

  } catch (error) {
    console.error("❌ Error en login.js:", error.message);
    return { 
      success: false, 
      message: "Error de conexión con el servidor de seguridad" 
    };
  }
};