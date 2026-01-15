import { supabase } from './supabase';

export const obtenerTecnicos = async () => {
  try {
    const { data, error } = await supabase
      .from('usersmovil')
      .select('MOV_CED, NOM_MOV, MOV_APE')
      .eq('MOV_ROL', 0)
      .order('NOM_MOV', { ascending: true });

    if (error) throw error;

    const tecnicosMapeados = data.map(t => ({
      MOV_CED: t.MOV_CED,
      NOM_MOV: t.NOM_MOV,
      MOV_APE: t.MOV_APE,
      nombre_completo: `${t.NOM_MOV} ${t.MOV_APE}`.trim()
    }));

    if (tecnicosMapeados.length > 0) {
      return {
        success: true,
        tecnicos: tecnicosMapeados
      };
    } else {
      return {
        success: false,
        message: "No se encontraron técnicos registrados",
        tecnicos: []
      };
    }

  } catch (error) {
    console.error("❌ Error en obtenerTecnicos.js:", error.message);
    return {
      success: false,
      message: "Error al obtener lista de técnicos: " + error.message,
      tecnicos: []
    };
  }
};