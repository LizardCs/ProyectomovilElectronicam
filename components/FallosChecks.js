// components/FallosChecks.js
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MOCK_FALLOS } from "../utils/mocks/mockFallos";

const FallosChecks = ({ onFallosChange }) => {
    const [fallosSeleccionados, setFallosSeleccionados] = useState([]);
    const [falloExpandido, setFalloExpandido] = useState(null);

    const toggleFallo = (id) => {
        setFallosSeleccionados(prev => {
            const nuevos = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
            if (onFallosChange) {
                const fallosData = nuevos.map(falloId => 
                    MOCK_FALLOS.find(f => f.id === falloId)
                );
                onFallosChange(fallosData);
            }
            return nuevos;
        });
    };

    const toggleExpandir = (id) => {
        setFalloExpandido(falloExpandido === id ? null : id);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.subtitle}>
                Marque los fallos que presenta el equipo:
            </Text>
            {MOCK_FALLOS.map((item) => (
                <View key={item.id} style={styles.falloItem}>
                    <TouchableOpacity 
                        style={styles.falloHeader} 
                        onPress={() => {
                            toggleFallo(item.id);
                            if (!fallosSeleccionados.includes(item.id)) {
                                toggleExpandir(item.id);
                            }
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={styles.falloLeft}>
                            <Ionicons 
                                name={fallosSeleccionados.includes(item.id) ? "checkbox" : "square-outline"} 
                                size={22} 
                                color={fallosSeleccionados.includes(item.id) ? "#001C38" : "#666"} 
                            />
                            <Text style={[
                                styles.falloText,
                                fallosSeleccionados.includes(item.id) && styles.falloTextSelected
                            ]}>
                                {item.fallo}
                            </Text>
                        </View>
                        {fallosSeleccionados.includes(item.id) && (
                            <TouchableOpacity onPress={() => toggleExpandir(item.id)}>
                                <Ionicons 
                                    name={falloExpandido === item.id ? "chevron-up-circle" : "chevron-down-circle"} 
                                    size={24} 
                                    color="#007AFF" 
                                />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                    
                    {fallosSeleccionados.includes(item.id) && falloExpandido === item.id && (
                        <View style={styles.falloExpandido}>
                            <View style={styles.falloExpandidoHeader}>
                                <Ionicons name="bulb-outline" size={18} color="#FF9500" />
                                <Text style={styles.falloExpandidoTitle}>Posible Solución:</Text>
                            </View>
                            <Text style={styles.falloExpandidoText}>{item.solucion}</Text>
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E5E5EA'
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
        fontStyle: 'italic'
    },
    falloItem: {
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        paddingBottom: 5
    },
    falloHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 5
    },
    falloLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10
    },
    falloText: {
        fontSize: 13,
        color: '#333',
        flex: 1
    },
    falloTextSelected: {
        fontWeight: '600',
        color: '#001C38'
    },
    falloExpandido: {
        backgroundColor: '#FFF9E6',
        padding: 12,
        borderRadius: 8,
        marginTop: 5,
        marginBottom: 10,
        marginLeft: 30,
        borderLeftWidth: 3,
        borderLeftColor: '#FF9500'
    },
    falloExpandidoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 5
    },
    falloExpandidoTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FF9500'
    },
    falloExpandidoText: {
        fontSize: 12,
        color: '#555',
        lineHeight: 18
    }
});

export default FallosChecks;