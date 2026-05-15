// components/RepuestoSelector.js
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../services/supabase";

const CATEGORIAS_MAP = {
    "TV LED": 1,
    "LAVADORA": 2,
    "SECADORA": 3,
    "REFRIGERADORA": 4,
    "WASHTOWER": 5,
    "COCINA": 6,
    "EQUIPO AUDIO": 7,
    "OTROS": 8,
};

const RepuestoSelector = ({ index, seleccionados, onSelect, categoriaEquipo }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [repuestos, setRepuestos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [repuestoSeleccionado, setRepuestoSeleccionado] = useState(null);

    useEffect(() => {
        cargarRepuestos();
    }, [categoriaEquipo]);

    useEffect(() => {
        if (seleccionados[index] && repuestos.length > 0) {
            const encontrado = repuestos.find(r => r.REPUESTO_ID === seleccionados[index]);
            setRepuestoSeleccionado(encontrado || null);
        }
    }, [seleccionados, index, repuestos]);

    const cargarRepuestos = async () => {
        setLoading(true);
        try {
            const catId = CATEGORIAS_MAP[categoriaEquipo] || null;

            let query = supabase
                .from('REPUESTOS')
                .select('*, CATEGORIAS_REP(CAT_NOMBRE)')
                .order('REP_NOMBRE', { ascending: true });

            if (catId) {
                query = query.in('CAT_ID', [catId, 9]);
            } else {
                query = query.eq('CAT_ID', 9);
            }

            const { data, error } = await query;

            if (error) throw error;
            setRepuestos(data || []);
        } catch (error) {
            console.error('Error cargando repuestos:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            <TouchableOpacity 
                style={styles.selector} 
                onPress={() => setModalVisible(true)}
            >
                <Text style={repuestoSeleccionado ? styles.selectedText : styles.placeholderText}>
                    {repuestoSeleccionado ? repuestoSeleccionado.REP_NOMBRE : "Seleccionar repuesto..."}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Repuesto {index + 1}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#FF3B30" />
                            </TouchableOpacity>
                        </View>
                        
                        {/* Badge de categoría */}
                        <View style={styles.categoriaBadge}>
                            <Ionicons name="pricetag-outline" size={14} color="#007AFF" />
                            <Text style={styles.categoriaText}>
                                {categoriaEquipo ? `${categoriaEquipo} + General` : 'General'}
                            </Text>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color="#001C38" style={{ marginTop: 30 }} />
                        ) : repuestos.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="cube-outline" size={40} color="#CCC" />
                                <Text style={styles.emptyText}>No hay repuestos disponibles</Text>
                            </View>
                        ) : (
                            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                                {repuestos.map((repuesto) => (
                                    <TouchableOpacity
                                        key={repuesto.REPUESTO_ID}
                                        style={[
                                            styles.repuestoOption,
                                            seleccionados[index] === repuesto.REPUESTO_ID && styles.repuestoOptionSelected
                                        ]}
                                        onPress={() => {
                                            onSelect(repuesto.REPUESTO_ID);
                                            setRepuestoSeleccionado(repuesto);
                                            setModalVisible(false);
                                        }}
                                    >
                                        <View style={styles.repuestoInfo}>
                                            <Text style={[
                                                styles.repuestoOptionText,
                                                seleccionados[index] === repuesto.REPUESTO_ID && styles.repuestoOptionTextSelected
                                            ]}>
                                                {repuesto.REP_NOMBRE}
                                            </Text>
                                            <Text style={styles.repuestoCategoria}>
                                                {repuesto.CATEGORIAS_REP?.CAT_NOMBRE || 'General'}
                                            </Text>
                                        </View>
                                        {seleccionados[index] === repuesto.REPUESTO_ID && (
                                            <Ionicons name="checkmark-circle" size={20} color="#001C38" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
    },
    selectedText: { fontSize: 14, color: '#001C38', fontWeight: '600' },
    placeholderText: { fontSize: 14, color: '#A0AAB5' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', maxHeight: '65%', backgroundColor: '#FFF', borderRadius: 20, padding: 15, elevation: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#001C38' },
    categoriaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#F0F7FF',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    categoriaText: { fontSize: 11, color: '#007AFF', fontWeight: '600' },
    modalScroll: { marginTop: 10 },
    repuestoOption: { 
        paddingVertical: 12, 
        paddingHorizontal: 10, 
        borderBottomWidth: 1, 
        borderBottomColor: '#EEE',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    repuestoOptionSelected: { backgroundColor: '#F0F7FF' },
    repuestoInfo: { flex: 1 },
    repuestoOptionText: { fontSize: 14, color: '#333' },
    repuestoOptionTextSelected: { fontWeight: '600', color: '#001C38' },
    repuestoCategoria: { fontSize: 10, color: '#999', marginTop: 2 },
    emptyContainer: { alignItems: 'center', paddingVertical: 30 },
    emptyText: { color: '#999', marginTop: 10, fontSize: 14 },
});

export default RepuestoSelector;