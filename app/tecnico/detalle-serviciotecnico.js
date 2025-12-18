import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import ImageZoom from 'react-native-image-pan-zoom';

const { width, height } = Dimensions.get("window");

export default function DetalleServicioTecnico() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const [isImageVisible, setIsImageVisible] = useState(false);

    const servicio = params.servicio ? JSON.parse(params.servicio) : null;

    if (!servicio) {
        return (
            <View style={styles.container}>
                <Text style={{ marginTop: 50, textAlign: 'center' }}>Error al cargar información.</Text>
            </View>
        );
    }

    const imageUri = `data:image/jpeg;base64,${servicio.SERV_IMG_ENV}`;
    const esCompletado = parseInt(servicio.SERV_EST) === 1;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#001C38" barStyle="light-content" />

            {/* Modal de Zoom */}
            <Modal visible={isImageVisible} transparent={true} animationType="fade">
                <View style={styles.modalBackground}>
                    <TouchableOpacity 
                        style={styles.closeModalBtn} 
                        onPress={() => setIsImageVisible(false)}
                    >
                        <Ionicons name="close-circle" size={45} color="#FFF" />
                    </TouchableOpacity>
                    
                    <ImageZoom 
                        cropWidth={width}
                        cropHeight={height}
                        imageWidth={width}
                        imageHeight={height * 0.7}
                        enableDoubleClickZoom={true}
                        panToMove={true}
                    >
                        <Image
                            source={{ uri: imageUri }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="contain"
                        />
                    </ImageZoom>
                    <Text style={styles.zoomText}>Pellizca para ampliar</Text>
                </View>
            </Modal>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalles del Trabajo</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                
                {/* Imagen Principal */}
                <View style={styles.imageSection}>
                    <Text style={styles.sectionLabel}>Comprobante (Toca para ampliar):</Text>
                    <TouchableOpacity 
                        activeOpacity={0.9} 
                        onPress={() => setIsImageVisible(true)}
                        style={styles.imageContainer}
                    >
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        <View style={styles.zoomHint}>
                            <Ionicons name="search" size={22} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Tarjeta de Información */}
                <View style={styles.card}>
                    <View style={styles.rowJustify}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>N° Comprobante</Text>
                            <Text style={styles.serviceNumber}>#{servicio.SERV_NUM}</Text>
                        </View>
                        {/* BADGE MEJORADO Y CENTRADO */}
                        <View style={[styles.badge, { backgroundColor: esCompletado ? "#34C759" : "#FF9500" }]}>
                            <Text style={styles.badgeText}>
                                {esCompletado ? "COMPLETADO" : "PENDIENTE"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={20} color="#007AFF" />
                        <View style={styles.infoText}>
                            <Text style={styles.label}>Asignado por:</Text>
                            <Text style={styles.value}>{servicio.SERV_NOM_ENV}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                        <View style={styles.infoText}>
                            <Text style={styles.label}>Fecha:</Text>
                            <Text style={styles.value}>{servicio.SERV_FECH_ASIG}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Descripción:</Text>
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionText}>
                            {servicio.SERV_DESCRIPCION || "Sin descripción."}
                        </Text>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={[styles.button, styles.btnSalir]} onPress={() => router.back()}>
                    <Text style={styles.btnTextSalir}>Salir</Text>
                </TouchableOpacity>

                {!esCompletado && (
                    <TouchableOpacity 
                        style={[styles.button, styles.btnComenzar]} 
                        onPress={() => router.push({ pathname: "/tecnico/crear-reporte", params: { servicio: JSON.stringify(servicio) } })}
                    >
                        <Ionicons name="play-circle" size={20} color="#FFF" />
                        <Text style={styles.btnTextComenzar}>Iniciar reporte</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    header: { 
        backgroundColor: "#001C38", 
        paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, 
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        borderBottomLeftRadius: 20, borderBottomRightRadius: 20
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
    contentContainer: { padding: 20 },
    imageSection: { marginBottom: 20 },
    sectionLabel: { fontSize: 13, fontWeight: 'bold', color: '#666', marginBottom: 10, textTransform: 'uppercase' },
    imageContainer: { width: '100%', height: 250, borderRadius: 20, overflow: 'hidden', backgroundColor: '#FFF', elevation: 5 },
    image: { width: '100%', height: '100%' },
    zoomHint: { position: 'absolute', bottom: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 30 },
    
    modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
    closeModalBtn: { position: 'absolute', top: 50, right: 20, zIndex: 100 },
    zoomText: { color: '#FFF', position: 'absolute', bottom: 40, fontSize: 14, opacity: 0.7 },

    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4 },
    rowJustify: { 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center', // Asegura que el Badge y el texto estén centrados verticalmente entre sí
    },
    serviceNumber: { fontSize: 24, fontWeight: 'bold', color: '#001C38' },
    label: { fontSize: 11, color: '#8E8E93', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
    value: { fontSize: 16, color: '#1C1C1E', fontWeight: 'bold' },

    // --- DISEÑO DE BADGE MEJORADO ---
    badge: { 
        paddingHorizontal: 14, 
        paddingVertical: 8, 
        borderRadius: 20, // Forma de píldora
        minWidth: 110,    // Evita que se vea muy pequeño
        alignItems: 'center', 
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    badgeText: { 
        color: '#FFF', 
        fontSize: 10, 
        fontWeight: '900', 
        textAlign: 'center',
        letterSpacing: 0.5 
    },
    // --------------------------------

    divider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 15 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    infoText: { marginLeft: 12 },
    descriptionContainer: { backgroundColor: '#F8F9FA', padding: 15, borderRadius: 15, marginTop: 5, borderWidth: 1, borderColor: '#EEE' },
    descriptionText: { fontSize: 15, color: '#444', lineHeight: 22 },
    footer: { backgroundColor: '#FFF', padding: 20, flexDirection: 'row', borderTopLeftRadius: 30, borderTopRightRadius: 30, gap: 15, elevation: 20 },
    button: { flex: 1, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 },
    btnSalir: { backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: '#DDD' },
    btnTextSalir: { color: '#444', fontWeight: 'bold', fontSize: 16 },
    btnComenzar: { backgroundColor: '#34C759' },
    btnTextComenzar: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});