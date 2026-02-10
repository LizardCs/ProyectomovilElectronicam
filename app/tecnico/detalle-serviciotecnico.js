import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert, // <-- NUEVO
    Dimensions,
    Image,
    Linking, // <-- NUEVO: Para abrir WhatsApp
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import ImageZoom from 'react-native-image-pan-zoom';
import { SafeAreaView } from "react-native-safe-area-context";
import { obtenerImagenServicio } from "../../services/obtenerImagenServicio";
import { supabase } from "../../services/supabase";

const { width, height } = Dimensions.get("window");

export default function DetalleServicioTecnico() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const [servicioDetalle, setServicioDetalle] = useState(null);
    const [cargandoDatos, setCargandoDatos] = useState(true);

    const [isImageVisible, setIsImageVisible] = useState(false);
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
                    cargarFotoReal(data.SERV_ID);
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

    const cargarFotoReal = async (idServicio) => {
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

    // 👇 NUEVA FUNCIÓN PARA ABRIR WHATSAPP 👇
    const abrirWhatsApp = (telefono) => {
        if (!telefono) return;
        
        // Limpiamos el número de espacios o guiones
        let numeroLimpio = telefono.replace(/\D/g, '');
        
        // Si empieza con 0 (Ej: 098...), lo cambiamos por el código de Ecuador 593
        if (numeroLimpio.startsWith('0')) {
            numeroLimpio = '593' + numeroLimpio.substring(1);
        }

        const url = `whatsapp://send?phone=${numeroLimpio}`;
        
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                return Linking.openURL(url);
            } else {
                Alert.alert("Error", "No tienes WhatsApp instalado en este dispositivo.");
            }
        }).catch(err => console.error('Error al abrir WhatsApp', err));
    };

    if (cargandoDatos) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#001C38" />
                <Text style={{ marginTop: 15, color: '#001C38', fontWeight: 'bold' }}>Descargando detalles del trabajo...</Text>
            </SafeAreaView>
        );
    }

    if (!servicioDetalle) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="alert-circle-outline" size={50} color="#CCC" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Error al cargar información.</Text>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                        <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Volver al inicio</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const esCompletado = parseInt(servicioDetalle.SERV_EST) === 1;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar style="light" backgroundColor="#001C38" />

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
                            source={{ uri: fotoUri }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="contain"
                        />
                    </ImageZoom>
                    <Text style={styles.zoomText}>Pellizca para ampliar la imagen</Text>
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

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Tarjeta Principal */}
                <View style={styles.card}>
                    <View style={styles.rowJustify}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>N° Asignación</Text>
                            <Text style={styles.serviceNumber}>#{servicioDetalle.SERV_NUM}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: esCompletado ? "#34C759" : "#FF9500" }]}>
                            <Text style={styles.badgeText}>
                                {esCompletado ? "LISTO" : "PENDIENTE"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* 1. PROBLEMA REPORTADO (PRIORIDAD ALTA PARA EL TÉCNICO) */}
                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Instrucciones / Daño Reportado:</Text>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionText}>
                                {servicioDetalle.SERV_DESCRIPCION || "El administrador no proporcionó una descripción adicional."}
                            </Text>
                        </View>
                    </View>

                    {/* 2. OBSERVACIONES */}
                    {!!servicioDetalle.SERV_OBS && (
                        <View style={styles.infoGroup}>
                            <Text style={styles.label}>Observaciones Adicionales:</Text>
                            <View style={styles.obsBox}>
                                <Text style={styles.obsText}>{servicioDetalle.SERV_OBS}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.divider} />

                    {/* 3. DATOS DEL CLIENTE CON BOTÓN DE WHATSAPP */}
                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Datos del Cliente:</Text>
                        <View style={styles.dataBox}>
                            <Text style={styles.clienteNombre}>{servicioDetalle.SERV_NOM_CLI || "No registrado"}</Text>
                            
                            {(!!servicioDetalle.SERV_CIUDAD || !!servicioDetalle.SERV_DIR) && (
                                <Text style={[styles.clienteDato, { marginBottom: 8 }]}>
                                    <Ionicons name="location" size={14} color="#666"/>  {servicioDetalle.SERV_CIUDAD ? servicioDetalle.SERV_CIUDAD + ' - ' : ''}{servicioDetalle.SERV_DIR}
                                </Text>
                            )}

                            {!!servicioDetalle.SERV_TEL_CLI && (
                                <TouchableOpacity 
                                    onPress={() => abrirWhatsApp(servicioDetalle.SERV_TEL_CLI)} 
                                    style={styles.whatsappButton}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                                    <Text style={styles.whatsappText}>Escribir al cliente:  {servicioDetalle.SERV_TEL_CLI}</Text>
                                    <Ionicons name="chevron-forward" size={14} color="#2E7D32" style={{marginLeft: 'auto'}} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* 4. ASIGNADO POR */}
                    <View style={styles.infoRow}>
                        <Ionicons name="person-circle-outline" size={22} color="#007AFF" />
                        <View style={styles.infoText}>
                            <Text style={styles.label}>Asignado por:</Text>
                            <Text style={styles.value}>{servicioDetalle.SERV_NOM_ENV}</Text>
                        </View>
                    </View>

                    {/* 5. FECHA DE RECEPCIÓN */}
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={22} color="#007AFF" />
                        <View style={styles.infoText}>
                            <Text style={styles.label}>Fecha de Recepción:</Text>
                            <Text style={styles.value}>
                                {new Date(servicioDetalle.SERV_FECH_ASIG).toLocaleString('es-EC')}
                            </Text>
                        </View>
                    </View>

                    {/* 6. FACTURACIÓN */}
                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Facturación:</Text>
                        <View style={[
                            styles.facturaBox, 
                            { 
                                backgroundColor: servicioDetalle.SERV_REQUIERE_FACT ? '#E8E2F8' : '#F2F2F7', 
                                borderColor: servicioDetalle.SERV_REQUIERE_FACT ? '#673AB7' : '#E5E5EA' 
                            }
                        ]}>
                            <Ionicons name="receipt" size={18} color={servicioDetalle.SERV_REQUIERE_FACT ? '#673AB7' : '#8E8E93'} />
                            <Text style={[
                                styles.facturaText, 
                                { color: servicioDetalle.SERV_REQUIERE_FACT ? '#673AB7' : '#8E8E93' }
                            ]}>
                                {servicioDetalle.SERV_REQUIERE_FACT ? "SÍ, EL CLIENTE REQUIERE FACTURA" : "NO REQUIERE FACTURA"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* 7. FOTO / EVIDENCIA */}
                    <View style={styles.imageSection}>
                        <Text style={styles.label}>Referencia visual:</Text>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => !cargandoFoto && fotoUri && setIsImageVisible(true)}
                            style={styles.imageContainer}
                        >
                            {cargandoFoto ? (
                                <View style={styles.loaderContainer}>
                                    <ActivityIndicator size="large" color="#007AFF" />
                                    <Text style={styles.loaderText}>Cargando imagen...</Text>
                                </View>
                            ) : fotoUri ? (
                                <>
                                    <Image
                                        source={{ uri: fotoUri }}
                                        style={styles.image}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.zoomHint}>
                                        <Ionicons name="expand" size={22} color="#FFF" />
                                    </View>
                                </>
                            ) : (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Ionicons name="image-outline" size={40} color="#CCC" />
                                    <Text style={{ color: '#999' }}>Sin imagen disponible</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Acciones del Técnico */}
            <View style={styles.footer}>
                <TouchableOpacity style={[styles.button, styles.btnSalir]} onPress={() => router.back()}>
                    <Text style={styles.btnTextSalir}>Regresar</Text>
                </TouchableOpacity>

                {!esCompletado && (
                    <TouchableOpacity
                        style={[styles.button, styles.btnComenzar]}
                        onPress={() => router.push({
                            pathname: "/tecnico/crear-reporte",
                            params: { servicio: JSON.stringify(servicioDetalle) }
                        })}
                    >
                        <Ionicons name="document-text" size={20} color="#FFF" />
                        <Text style={styles.btnTextComenzar}>Iniciar reporte</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    header: { backgroundColor: "#001C38", paddingTop: 10, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 10 },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 60 },
    imageSection: { marginTop: 10 },
    imageContainer: { width: '100%', height: 200, borderRadius: 15, overflow: 'hidden', backgroundColor: '#F0F0F0', elevation: 2, borderWidth: 1, borderColor: '#DDD', marginTop: 10 },
    image: { width: '100%', height: '100%' },
    zoomHint: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
    loaderText: { marginTop: 10, color: '#007AFF', fontSize: 12 },
    modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
    closeModalBtn: { position: 'absolute', top: 50, right: 20, zIndex: 100 },
    zoomText: { color: '#FFF', position: 'absolute', bottom: 40, fontSize: 14, opacity: 0.7 },
    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4 },
    rowJustify: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    serviceNumber: { fontSize: 24, fontWeight: 'bold', color: '#001C38' },
    label: { fontSize: 11, color: '#8E8E93', fontWeight: '700', textTransform: 'uppercase', marginBottom: 5 },
    value: { fontSize: 16, color: '#1C1C1E', fontWeight: 'bold' },
    badge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, minWidth: 100, alignItems: 'center', justifyContent: 'center' },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
    divider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 18 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    infoText: { marginLeft: 12 },
    
    infoGroup: { marginBottom: 15 },
    dataBox: { backgroundColor: "#F8F9FA", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#E5E5EA" },
    clienteNombre: { fontSize: 18, color: "#001C38", fontWeight: "bold", marginBottom: 6 },
    clienteDato: { fontSize: 14, color: "#555", marginTop: 4 },
    
    // 👇 ESTILO DEL BOTÓN DE WHATSAPP 👇
    whatsappButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, marginTop: 10, borderWidth: 1, borderColor: '#C8E6C9' },
    whatsappText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },

    facturaBox: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start' },
    facturaText: { fontSize: 13, fontWeight: "bold", marginLeft: 8 },
    obsBox: { backgroundColor: "#F2F2F7", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#E5E5EA" },
    obsText: { fontSize: 15, color: "#D97706", fontStyle: 'italic', fontWeight: 'bold' },
    descriptionContainer: { backgroundColor: '#F0F8FF', padding: 15, borderRadius: 12, marginTop: 5, borderWidth: 1, borderColor: '#B3E5FC' },
    descriptionText: { fontSize: 16, color: '#004BA0', lineHeight: 24, fontWeight: '600' },
    
    footer: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10, flexDirection: 'row', borderTopLeftRadius: 30, borderTopRightRadius: 30, gap: 15, elevation: 20 },
    button: { flex: 1, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 },
    btnSalir: { backgroundColor: '#E5E5EA' },
    btnTextSalir: { color: '#444', fontWeight: 'bold', fontSize: 16 },
    btnComenzar: { backgroundColor: '#007AFF' },
    btnTextComenzar: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});