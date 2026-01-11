import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetalleServicioAdmin() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Recuperamos el objeto servicio pasado por parámetros
    const servicio = useMemo(() => {
        return params.servicio ? JSON.parse(params.servicio) : null;
    }, [params.servicio]);

    if (!servicio) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ marginTop: 50, textAlign: 'center' }}>No se encontró información del servicio.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Volver al Panel</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const esCompletado = parseInt(servicio.SERV_EST) === 1;

    // Procesamos la imagen: Supabase nos devuelve los bytes. 
    // Si ya viene como base64 desde el mapeo, lo usamos directamente.
    const imageUri = useMemo(() => {
        if (!servicio.SERV_IMG_ENV) return null;
        // Si ya tiene el prefijo, lo dejamos; si no, se lo ponemos.
        return servicio.SERV_IMG_ENV.startsWith('data:') 
            ? servicio.SERV_IMG_ENV 
            : `data:image/jpeg;base64,${servicio.SERV_IMG_ENV}`;
    }, [servicio.SERV_IMG_ENV]);

    const handleSalir = () => {
        router.back();
    };

    const handleEditar = () => {
        // Navegamos a crear-servicio pasando el objeto para editar
        router.push({
            pathname: "/admin/crear-servicio",
            params: { servicioEditar: JSON.stringify(servicio) }
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar style="light" backgroundColor="#001C38" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleSalir} accessibilityLabel="Volver">
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalles del Servicio</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer} 
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <View style={styles.titleContainer}>
                        <Ionicons name="construct" size={24} color="#007AFF" />
                        <Text style={styles.titleText}>Servicio a Realizar</Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Evidencia / Foto de Recepción:</Text>
                    <View style={styles.imageContainer}>
                        {imageUri ? (
                            <Image
                                source={{ uri: imageUri }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.noImage}>
                                <Ionicons name="image-outline" size={50} color="#CCC" />
                                <Text style={{ color: '#999' }}>Sin imagen adjunta</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.infoRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>N° Asignación:</Text>
                            <Text style={styles.value}>{servicio.SERV_NUM}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Estado Actual:</Text>
                            <View style={[
                                styles.badge,
                                { backgroundColor: esCompletado ? "#34C759" : "#FF9500" }
                            ]}>
                                <Text style={styles.badgeText}>
                                    {esCompletado ? "COMPLETADO" : "PENDIENTE"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Técnico Responsable:</Text>
                        <View style={styles.tecnicoBox}>
                            <Ionicons name="person" size={20} color="#555" />
                            <Text style={styles.tecnicoText}>{servicio.SERV_NOM_REC || "No asignado"}</Text>
                        </View>
                    </View>

                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Fecha de Ingreso:</Text>
                        {/* Formateamos la fecha si es necesario o mostramos la del sistema */}
                        <Text style={styles.value}>
                            {new Date(servicio.SERV_FECH_ASIG).toLocaleString('es-EC')}
                        </Text>
                    </View>

                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Descripción del Problema:</Text>
                        <View style={styles.descriptionBox}>
                            <Text style={styles.descriptionText}>
                                {servicio.SERV_DESCRIPCION || "Sin descripción detallada."}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Footer de acciones */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, styles.btnSalir]}
                    onPress={handleSalir}
                >
                    <Ionicons name="arrow-back-circle-outline" size={24} color="#FFF" />
                    <Text style={styles.btnText}>Regresar</Text>
                </TouchableOpacity>

                {!esCompletado && (
                    <TouchableOpacity
                        style={[styles.button, styles.btnEditar]}
                        onPress={handleEditar}
                    >
                        <Ionicons name="create-outline" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Editar</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    header: { backgroundColor: "#001C38", paddingTop: 10, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 10 },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
    scrollView: { flex: 1 },
    contentContainer: { padding: 20, paddingBottom: 40 },
    card: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, elevation: 3 },
    titleContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10, justifyContent: 'center' },
    titleText: { fontSize: 22, fontWeight: "bold", color: "#001C38", marginLeft: 10 },
    divider: { height: 1, backgroundColor: "#EEE", marginVertical: 15 },
    label: { fontSize: 14, color: "#666", marginBottom: 5, fontWeight: "600" },
    value: { fontSize: 16, color: "#1C1C1E", fontWeight: "bold", marginBottom: 15 },
    imageContainer: { height: 220, width: "100%", borderRadius: 15, overflow: 'hidden', backgroundColor: "#F0F0F0", marginBottom: 20, borderWidth: 1, borderColor: "#E5E5EA" },
    image: { width: "100%", height: "100%" },
    noImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    badgeText: { color: "#FFF", fontWeight: "bold", fontSize: 12 },
    infoGroup: { marginBottom: 15 },
    tecnicoBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F9FA", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E5E5EA" },
    tecnicoText: { fontSize: 16, marginLeft: 10, color: "#333", fontWeight: "500" },
    descriptionBox: { backgroundColor: "#FFF8E1", padding: 15, borderRadius: 10, borderWidth: 1, borderColor: "#FFECB3", minHeight: 80 },
    descriptionText: { fontSize: 15, color: "#444", lineHeight: 22, fontStyle: 'italic' },
    footer: { backgroundColor: "#FFF", paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10, borderTopLeftRadius: 25, borderTopRightRadius: 25, flexDirection: "row", justifyContent: "space-between", elevation: 20 },
    button: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15, borderRadius: 15, flex: 1 },
    btnSalir: { backgroundColor: "#8E8E93", marginRight: 10 },
    btnEditar: { backgroundColor: "#007AFF", marginLeft: 10 },
    btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
});