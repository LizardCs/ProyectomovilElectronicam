import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { obtenerImagenServicio } from "../../services/obtenerImagenServicio";
import { supabase } from "../../services/supabase";

export default function DetalleServicioAdmin() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [servicioDetalle, setServicioDetalle] = useState(null);
    const [cargandoDatos, setCargandoDatos] = useState(true);
    
    const [fotoUri, setFotoUri] = useState(null);
    const [cargandoFoto, setCargandoFoto] = useState(true);

    useEffect(() => {
        const consultarDatosReales = async () => {
            setCargandoDatos(true);
            try {
                const servicioParam = params.servicio ? JSON.parse(params.servicio) : null;
                
                if (!servicioParam || !servicioParam.SERV_NUM) {
                    setCargandoDatos(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('serviciostecnicos')
                    .select('*')
                    .eq('SERV_NUM', servicioParam.SERV_NUM)
                    .single();

                if (data && !error) {
                    setServicioDetalle(data);
                    cargarFoto(data.SERV_ID);
                } else {
                    console.error("Error al traer datos de Supabase:", error);
                }
            } catch (error) {
                console.error("Error en la consulta:", error);
            } finally {
                setCargandoDatos(false);
            }
        };

        consultarDatosReales();
    }, [params.servicio]);

    const cargarFoto = async (idServicio) => {
        setCargandoFoto(true);
        const res = await obtenerImagenServicio(idServicio);
        if (res.success && res.imagen) {
            const uri = res.imagen.startsWith('data:')
                ? res.imagen
                : `data:image/jpeg;base64,${res.imagen}`;
            setFotoUri(uri);
        }
        setCargandoFoto(false);
    };

    if (cargandoDatos) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#001C38" />
                <Text style={{ marginTop: 15, color: '#001C38', fontWeight: 'bold' }}>Cargando información real...</Text>
            </SafeAreaView>
        );
    }

    if (!servicioDetalle) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ marginTop: 50, textAlign: 'center' }}>No se encontró información del servicio.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Volver al Panel</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const esCompletado = parseInt(servicioDetalle.SERV_EST) === 1;

    const handleSalir = () => {
        router.back();
    };

    const handleEditar = () => {
        router.push({
            pathname: "/admin/crear-servicio",
            params: { servicioEditar: JSON.stringify(servicioDetalle) } 
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar style="light" backgroundColor="#001C38" />

            <View style={styles.header}>
                <TouchableOpacity onPress={handleSalir}>
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

                    {/* NÚMERO Y ESTADO */}
                    <View style={styles.infoRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>N° Asignación:</Text>
                            <Text style={styles.value}>#{servicioDetalle.SERV_NUM}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Estado Actual:</Text>
                            <View style={[styles.badge, { backgroundColor: esCompletado ? "#34C759" : "#007AFF" }]}>
                                <Text style={styles.badgeText}>{esCompletado ? "COMPLETADO" : "EN PROCESO"}</Text>
                            </View>
                        </View>
                    </View>

                    {/* DATOS DEL CLIENTE */}
                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Datos del Cliente:</Text>
                        <View style={styles.dataBox}>
                            <Text style={styles.clienteNombre}>{servicioDetalle.SERV_NOM_CLI || "No registrado"}</Text>
                            {!!servicioDetalle.SERV_TEL_CLI && (
                                <Text style={styles.clienteDato}>
                                    <Ionicons name="call" size={14} color="#666"/>  {servicioDetalle.SERV_TEL_CLI}
                                </Text>
                            )}
                            {(!!servicioDetalle.SERV_CIUDAD || !!servicioDetalle.SERV_DIR) && (
                                <Text style={styles.clienteDato}>
                                    <Ionicons name="location" size={14} color="#666"/>  {servicioDetalle.SERV_CIUDAD ? servicioDetalle.SERV_CIUDAD + ' - ' : ''}{servicioDetalle.SERV_DIR}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* FACTURA */}
                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>¿Requiere Factura?</Text>
                        <View style={[styles.facturaBox, { backgroundColor: servicioDetalle.SERV_REQUIERE_FACT ? '#E8E2F8' : '#F2F2F7', borderColor: servicioDetalle.SERV_REQUIERE_FACT ? '#673AB7' : '#E5E5EA' }]}>
                            <Ionicons name="receipt" size={18} color={servicioDetalle.SERV_REQUIERE_FACT ? '#673AB7' : '#8E8E93'} />
                            <Text style={[styles.facturaText, { color: servicioDetalle.SERV_REQUIERE_FACT ? '#673AB7' : '#8E8E93' }]}>
                                {servicioDetalle.SERV_REQUIERE_FACT ? "SÍ, EMITIR FACTURA" : "NO REQUIERE FACTURA"}
                            </Text>
                        </View>
                    </View>

                    {/* DESCRIPCIÓN DEL PROBLEMA */}
                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Descripción del Problema:</Text>
                        <View style={styles.descriptionBox}>
                            <Text style={styles.descriptionText}>
                                {servicioDetalle.SERV_DESCRIPCION || "Sin descripción detallada."}
                            </Text>
                        </View>
                    </View>

                    {/* OBSERVACIONES */}
                    {!!servicioDetalle.SERV_OBS && (
                        <View style={styles.infoGroup}>
                            <Text style={styles.label}>Observaciones Adicionales:</Text>
                            <View style={styles.obsBox}>
                                <Text style={styles.obsText}>{servicioDetalle.SERV_OBS}</Text>
                            </View>
                        </View>
                    )}

                    {/* TÉCNICO Y FECHA */}
                    <View style={styles.infoRow}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={styles.label}>Técnico Asignado:</Text>
                            <View style={styles.tecnicoBox}>
                                <Ionicons name="person" size={16} color="#555" />
                                <Text style={styles.tecnicoText} numberOfLines={1}>{servicioDetalle.SERV_NOM_REC || "Pendiente"}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Fecha Ingreso:</Text>
                            <Text style={[styles.value, { fontSize: 14, marginTop: 10 }]}>
                                {new Date(servicioDetalle.SERV_FECH_ASIG).toLocaleDateString('es-EC')}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* FOTO / EVIDENCIA */}
                    <Text style={styles.label}>Evidencia / Foto de Recepción:</Text>
                    <View style={styles.imageContainer}>
                        {cargandoFoto ? (
                            <View style={styles.loaderContainer}>
                                <ActivityIndicator size="large" color="#007AFF" />
                                <Text style={styles.loaderText}>Cargando imagen...</Text>
                            </View>
                        ) : fotoUri ? (
                            <Image source={{ uri: fotoUri }} style={styles.image} resizeMode="cover" />
                        ) : (
                            <View style={styles.noImage}>
                                <Ionicons name="image-outline" size={50} color="#CCC" />
                                <Text style={{ color: '#999', marginTop: 10 }}>Sin imagen adjunta</Text>
                            </View>
                        )}
                    </View>

                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.button, styles.btnSalir]} onPress={handleSalir}>
                    <Ionicons name="arrow-back-circle-outline" size={24} color="#FFF" />
                    <Text style={styles.btnText}>Regresar</Text>
                </TouchableOpacity>

                {!esCompletado && (
                    <TouchableOpacity style={[styles.button, styles.btnEditar]} onPress={handleEditar}>
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
    label: { fontSize: 13, color: "#888", marginBottom: 5, fontWeight: "bold", textTransform: "uppercase" },
    value: { fontSize: 18, color: "#1C1C1E", fontWeight: "900", marginBottom: 15 },
    dataBox: { backgroundColor: "#F8F9FA", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#E5E5EA" },
    clienteNombre: { fontSize: 16, color: "#001C38", fontWeight: "bold", marginBottom: 6 },
    clienteDato: { fontSize: 14, color: "#555", marginTop: 4 },
    facturaBox: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start' },
    facturaText: { fontSize: 13, fontWeight: "bold", marginLeft: 8 },
    obsBox: { backgroundColor: "#F2F2F7", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#E5E5EA" },
    obsText: { fontSize: 14, color: "#555", fontStyle: 'italic' },
    imageContainer: { height: 220, width: "100%", borderRadius: 15, overflow: 'hidden', backgroundColor: "#F0F0F0", borderWidth: 1, borderColor: "#E5E5EA" },
    image: { width: "100%", height: "100%" },
    noImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 10, color: '#007AFF', fontSize: 12 },
    infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    badgeText: { color: "#FFF", fontWeight: "bold", fontSize: 12 },
    infoGroup: { marginBottom: 20 },
    tecnicoBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F9FA", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#E5E5EA" },
    tecnicoText: { fontSize: 14, marginLeft: 8, color: "#333", fontWeight: "bold" },
    descriptionBox: { backgroundColor: "#FFF8E1", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#FFECB3", minHeight: 80 },
    descriptionText: { fontSize: 15, color: "#444", lineHeight: 22, fontStyle: 'italic' },
    footer: { backgroundColor: "#FFF", paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10, borderTopLeftRadius: 25, borderTopRightRadius: 25, flexDirection: "row", justifyContent: "space-between", elevation: 20 },
    button: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15, borderRadius: 15, flex: 1 },
    btnSalir: { backgroundColor: "#8E8E93", marginRight: 10 },
    btnEditar: { backgroundColor: "#007AFF", marginLeft: 10 },
    btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
});