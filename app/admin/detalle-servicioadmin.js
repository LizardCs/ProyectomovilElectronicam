import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function DetalleServicioAdmin() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Recuperamos el objeto servicio que pasamos como string desde el Home
    const servicio = params.servicio ? JSON.parse(params.servicio) : null;

    if (!servicio) {
        return (
            <View style={styles.container}>
                <Text style={{ marginTop: 50, textAlign: 'center' }}>No se encontró información.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={{ color: 'blue' }}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Lógica: 1 = Completado, 0 = Pendiente
    const esCompletado = parseInt(servicio.SERV_EST) === 1;

    // Construir la URI de la imagen Base64
    const imageUri = `data:image/jpeg;base64,${servicio.SERV_IMG_ENV}`;

    const handleSalir = () => {
        router.back(); // Regresa al Home
    };

    const handleEditar = () => {
        // Enviamos el servicio a la pantalla de crear
        router.push({
            pathname: "/admin/crear-servicio",
            params: { servicioEditar: JSON.stringify(servicio) } // Pasamos los datos
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#001C38" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleSalir} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalles del Servicio</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.contentContainer}>
                <View style={styles.card}>

                    {/* Título */}
                    <View style={styles.titleContainer}>
                        <Ionicons name="construct" size={24} color="#007AFF" />
                        <Text style={styles.titleText}>Servicio a Realizar</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Imagen */}
                    <Text style={styles.label}>Comprobante / Foto:</Text>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </View>

                    {/* Fila: Número y Estado */}
                    <View style={styles.infoRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>N° Asignación:</Text>
                            <Text style={styles.value}>{servicio.SERV_NUM}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Estado:</Text>
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

                    {/* Técnico */}
                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Técnico Asignado:</Text>
                        <View style={styles.tecnicoBox}>
                            <Ionicons name="person" size={20} color="#555" />
                            <Text style={styles.tecnicoText}>{servicio.SERV_NOM_REC}</Text>
                        </View>
                    </View>

                    {/* Fecha */}
                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Fecha y Hora de Asignación:</Text>
                        <Text style={styles.value}>{servicio.SERV_FECH_ASIG}</Text>
                    </View>

                    {/* Descripción */}
                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Descripción del Trabajo:</Text>
                        <View style={styles.descriptionBox}>
                            <Text style={styles.descriptionText}>
                                {servicio.SERV_DESCRIPCION || "Sin descripción detallada."}
                            </Text>
                        </View>
                    </View>

                </View>
                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Footer con Botones */}
            <View style={styles.footer}>

                {/* Botón Salir */}
                <TouchableOpacity
                    style={[styles.button, styles.btnSalir]}
                    onPress={handleSalir}
                >
                    <Ionicons name="arrow-back-circle-outline" size={24} color="#FFF" />
                    <Text style={styles.btnText}>Salir</Text>
                </TouchableOpacity>

                {/* Botón Editar (Solo visible si NO está completado) */}
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
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },
    header: {
        backgroundColor: "#001C38",
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFF",
    },
    contentContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        justifyContent: 'center'
    },
    titleText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#001C38",
        marginLeft: 10,
    },
    divider: {
        height: 1,
        backgroundColor: "#EEE",
        marginVertical: 15,
    },
    label: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
        fontWeight: "600",
    },
    value: {
        fontSize: 16,
        color: "#1C1C1E",
        fontWeight: "bold",
        marginBottom: 15,
    },
    imageContainer: {
        height: 200,
        width: "100%",
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: "#F0F0F0",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#EEE"
    },
    image: {
        width: "100%",
        height: "100%",
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    badgeText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 12,
    },
    infoGroup: {
        marginBottom: 15,
    },
    tecnicoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    tecnicoText: {
        fontSize: 16,
        marginLeft: 10,
        color: "#333",
        fontWeight: "500",
    },
    descriptionBox: {
        backgroundColor: "#FFF8E1",
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#FFECB3",
        minHeight: 80,
    },
    descriptionText: {
        fontSize: 15,
        color: "#444",
        lineHeight: 22,
        fontStyle: 'italic',
    },
    footer: {
        backgroundColor: "#FFF",
        padding: 20,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        flexDirection: "row",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 20,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 15,
        borderRadius: 15,
        flex: 1,
    },
    btnSalir: {
        backgroundColor: "#FF3B30",
        marginRight: 10,
    },
    btnEditar: {
        backgroundColor: "#007AFF",
        marginLeft: 10,
    },
    btnText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
        marginLeft: 8,
    },
});