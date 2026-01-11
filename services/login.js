import { supabase } from './supabase';

/**
 * Lógica extraída de login.php
 * Verifica las credenciales del usuario y devuelve su información de perfil y rol.
 */
export const login = async (usuario, clave) => {
  try {
    // 1. Validación de entrada (Igual que en el PHP)
    if (!usuario || !clave) {
      return { 
        success: false, 
        message: "Usuario y contraseña requeridos" 
      };
    }

    const usuarioLimpio = usuario.trim();
    const claveLimpia = clave.trim();

    // 2. Consulta SQL en Supabase
    // Mapeamos los campos que solicitaba tu SELECT en PHP
    const { data, error } = await supabase
      .from('usersmovil')
      .select('mov_id, mov_ced, nom_mov, mov_ape, mov_rol, mov_celu, mov_usu')
      .eq('mov_usu', usuarioLimpio)
      .eq('mov_clave', claveLimpia)
      .single(); // Esperamos una sola coincidencia

    // 3. Manejo de errores o credenciales incorrectas
    if (error || !data) {
      return { 
        success: false, 
        message: "Usuario o contraseña incorrectos" 
      };
    }

    // 4. Determinar rol y ruta (Lógica de negocio del PHP)
    const esAdmin = parseInt(data.mov_rol) === 1;
    const rol_nombre = esAdmin ? "admin" : "tecnico";
    const redirect_to = esAdmin ? "/admin/home" : "/tecnico/home";

    // 5. Respuesta exitosa con el formato exacto de tu PHP
    return {
      success: true,
      message: "Login exitoso",
      user: {
        id: data.mov_id,
        cedula: data.mov_ced,
        nombre: data.nom_mov,
        apellido: data.mov_ape,
        nombre_completo: `${data.nom_mov} ${data.mov_ape}`,
        telefono: data.mov_celu || '',
        usuario: data.mov_usu,
        rol: data.mov_rol,
        rol_nombre: rol_nombre
      },
      redirect_to: redirect_to
    };

  } catch (error) {
    console.error("Error en login.js:", error.message);
    return { 
      success: false, 
      message: "Error de conexión con el servicio de autenticación" 
    };
  }
};