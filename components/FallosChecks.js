// components/FallosChecks.js
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const FallosChecks = ({ listaFallos = [], onFallosChange }) => {
    const [fallosSeleccionados, setFallosSeleccionados] = useState([]);
    const [falloExpandido, setFalloExpandido] = useState(null);

    useEffect(() => {
        setFallosSeleccionados([]);
        setFalloExpandido(null);
        if (onFallosChange) onFallosChange([]);
    }, [listaFallos]);

    const toggleFallo = (item) => {
        const existe = fallosSeleccionados.find(f => f.fallo === item.fallo);
        let nuevos;

        if (existe) {
            nuevos = fallosSeleccionados.filter(f => f.fallo !== item.fallo);
        } else {
            nuevos = [...fallosSeleccionados, item];
        }

        setFallosSeleccionados(nuevos);
        if (onFallosChange) {
            onFallosChange(nuevos);
        }
    };

    const toggleExpandir = (falloText) => {
        setFalloExpandido(falloExpandido === falloText ? null : falloText);
    };

    if (!listaFallos || listaFallos.length === 0) {
        return (
            <View style={[styles.container, { alignItems: 'center', padding: 15 }]}>
                <Text style={styles.subtitle}>Seleccione un equipo para cargar los fallos comunes.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.subtitle}>
                Marque los fallos que presenta el equipo:
            </Text>
            {listaFallos.map((item, index) => {
                const isSelected = fallosSeleccionados.some(f => f.fallo === item.fallo);
                const isExpanded = falloExpandido === item.fallo;

                return (
                    <View key={index} style={styles.falloItem}>
                        <TouchableOpacity 
                            style={styles.falloHeader} 
                            onPress={() => {
                                toggleFallo(item);
                                if (!isSelected) {
                                    toggleExpandir(item.fallo);
                                }
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={styles.falloLeft}>
                                <Ionicons 
                                    name={isSelected ? "checkbox" : "square-outline"} 
                                    size={22} 
                                    color={isSelected ? "#001C38" : "#666"} 
                                />
                                <Text style={[
                                    styles.falloText,
                                    isSelected && styles.falloTextSelected
                                ]}>
                                    {item.fallo}
                                </Text>
                            </View>
                            {isSelected && (
                                <TouchableOpacity onPress={() => toggleExpandir(item.fallo)}>
                                    <Ionicons 
                                        name={isExpanded ? "chevron-up-circle" : "chevron-down-circle"} 
                                        size={24} 
                                        color="#007AFF" 
                                    />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                        
                        {isSelected && isExpanded && (
                            <View style={styles.falloExpandido}>
                                <View style={styles.falloExpandidoHeader}>
                                    <Ionicons name="bulb-outline" size={18} color="#FF9500" />
                                    <Text style={styles.falloExpandidoTitle}>Posible Solución:</Text>
                                </View>
                                <Text style={styles.falloExpandidoText}>{item.solucion}</Text>
                            </View>
                        )}
                    </View>
                );
            })}
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