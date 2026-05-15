import { supabase } from './supabase';

export const obtenerCategoriasRepuestos = async () => {
    try {
        const { data, error } = await supabase
            .from('CATEGORIAS_REP')
            .select('*')
            .order('CAT_NOMBRE', { ascending: true });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error("❌ Error en obtenerCategorias.js:", error.message);
        return { success: false, data: [], message: error.message };
    }
};