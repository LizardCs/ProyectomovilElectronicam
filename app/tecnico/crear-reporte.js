import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from "react";
import {
    ActivityIndicator, Alert,
    KeyboardAvoidingView,
    Platform, ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from "react-native";
import SignatureScreen from "react-native-signature-canvas";

export default function CrearReporte() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const servicio = JSON.parse(params.servicio);

    const [loading, setLoading] = useState(false);
    
    // --- DATOS DEL CLIENTE ---
    const [nombreCliente, setNombreCliente] = useState("");
    const [cedulaCliente, setCedulaCliente] = useState("");
    const [telefonoCliente, setTelefonoCliente] = useState("");
    const [direccionCliente, setDireccionCliente] = useState("");

    // --- IDENTIFICACION DEL EQUIPO ---
    const [unidad, setUnidad] = useState("");
    const [marca, setMarca] = useState("");
    const [modeloEq, setModeloEq] = useState("");
    const [serieEq, setSerieEq] = useState("");
    const [colorEq, setColorEq] = useState("");

    // --- ESTADOS Y CHECKS ---
    const [checks, setChecks] = useState({
        garantia: false, 
        papeles: false, 
        pendiente: false, 
        completo: false,
        nuevo: false, 
        usado: true, 
        excepcion: false,
        nivelacion: false, 
        presionAgua: false,
        modeloSerieCheck: false, 
        conexionesElectricas: false,
        conexionesAgua: false, 
        equipoInstalado: false,
        accesorios: false, // false = NO, true = SI
        aceptaCondiciones: false
    });

    const [danioReportado, setDanioReportado] = useState("");
    const [inspeccionEstadoDesc, setInspeccionEstadoDesc] = useState("");
    const [accesoriosDesc, setAccesoriosDesc] = useState("");
    const [recomendaciones, setRecomendaciones] = useState("");

    // --- FOTOS ---
    const [fotoModelo, setFotoModelo] = useState(null);
    const [descModelo, setDescModelo] = useState("");
    const [fotoFactura, setFotoFactura] = useState(null);
    const [descFactura, setDescFactura] = useState("");
    const [fotoElectrico, setFotoElectrico] = useState(null);
    const [descElectrico, setDescElectrico] = useState("");

    const [firma, setFirma] = useState(null);
    const [showSig, setShowSig] = useState(false);

    // Bloqueo de navegación
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            const hayDatos = nombreCliente || danioReportado || unidad || fotoModelo || firma;
            if (!hayDatos || loading) return;
            e.preventDefault();
            Alert.alert("¿Descartar cambios?", "Se perderán los datos ingresados en este reporte.", [
                { text: "Continuar editando", style: "cancel" },
                { text: "Salir y descartar", style: "destructive", onPress: () => navigation.dispatch(e.data.action) }
            ]);
        });
        return unsubscribe;
    }, [navigation, nombreCliente, danioReportado, unidad, fotoModelo, firma, loading]);

    const toggleCheck = (key) => setChecks(prev => ({ ...prev, [key]: !prev[key] }));

    const seleccionarImagen = (key) => {
        Alert.alert("Origen de la imagen", "¿Cámara o Galería?", [
            { text: "Cámara", onPress: () => abrirMedia(key, 'camera') },
            { text: "Galería", onPress: () => abrirMedia(key, 'library') },
            { text: "Cancelar", style: "cancel" }
        ]);
    };

    const abrirMedia = async (key, origen) => {
        const opciones = { allowsEditing: true, aspect: [4, 3], quality: 0.5, base64: true };
        let result = origen === 'camera' ? await ImagePicker.launchCameraAsync(opciones) : await ImagePicker.launchImageLibraryAsync(opciones);
        if (!result.canceled) {
            const asset = result.assets[0];
            if (key === 'modelo') setFotoModelo(asset);
            else if (key === 'factura') setFotoFactura(asset);
            else setFotoElectrico(asset);
        }
    };

    const generarReporteGod = async () => {
        if (!nombreCliente || !unidad || !danioReportado || !firma || !checks.aceptaCondiciones) {
            Alert.alert("Atención", "Nombre, equipo, diagnóstico, firma y aceptación son obligatorios.");
            return;
        }

        setLoading(true);

        const htmlContent = `
            <html>
                <style>
                    body { font-family: 'Helvetica'; padding: 20px; color: #1a1a1a; line-height: 1.2; }
                    .header { text-align: center; border-bottom: 2px solid #001C38; padding-bottom: 10px; margin-bottom: 15px; }
                    .header h1 { margin: 0; color: #001C38; font-size: 22px; }
                    .ods-box { position: absolute; top: 20px; right: 20px; color: red; font-weight: bold; font-size: 18px; border: 1px solid red; padding: 5px; }
                    .section-title { background: #001C38; color: white; padding: 5px; text-align: center; font-size: 12px; font-weight: bold; border-radius: 3px; }
                    .table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                    .table td { border: 1px solid #ddd; padding: 7px; font-size: 11px; }
                    .check-box { display: inline-block; width: 11px; height: 11px; border: 1px solid #333; text-align: center; line-height: 11px; font-size: 9px; margin-right: 5px; vertical-align: middle; }
                    .active { background: #001C38 !important; color: white !important; font-weight: bold; }
                </style>
                <body>
                    <div class="ods-box">N° ${servicio.SERV_NUM}</div>
                    <div class="header">
                        <h1>ELECTRÓNICA MANTILLA</h1>
                        <p>Reporte Técnico Digital - Ambato, Ecuador</p>
                    </div>

                    <div class="section-title">DATOS DEL CLIENTE</div>
                    <table class="table">
                        <tr><td colspan="2"><strong>Sr(a):</strong> ${nombreCliente}</td><td><strong>C.I:</strong> ${cedulaCliente}</td></tr>
                        <tr><td><strong>Teléfono:</strong> ${telefonoCliente}</td><td colspan="2"><strong>Dirección:</strong> ${direccionCliente}</td></tr>
                    </table>

                    <div class="section-title">RECEPCIÓN Y DIAGNÓSTICO</div>
                    <table class="table">
                        <tr>
                            <td>Garantía: ${checks.garantia ? '[X]' : '[ ]'}</td>
                            <td>Papeles: ${checks.papeles ? '[X]' : '[ ]'}</td>
                            <td>Pendiente: ${checks.pendiente ? '[X]' : '[ ]'}</td>
                            <td>Completo: ${checks.completo ? '[X]' : '[ ]'}</td>
                        </tr>
                        <tr><td colspan="4"><strong>Daño Reportado:</strong> ${danioReportado}</td></tr>
                        <tr>
                            <td colspan="4">
                                <strong>Accesorios:</strong> 
                                SI (${checks.accesorios ? 'X' : ' '}) 
                                NO (${!checks.accesorios ? 'X' : ' '})
                                | <strong>Descripción:</strong> ${accesoriosDesc || "Ninguna"}
                            </td>
                        </tr>
                    </table>

                    <div class="section-title">PUNTOS DE VERIFICACIÓN TÉCNICA</div>
                    <table class="table">
                        <tr>
                            <td><div class="check-box ${checks.nivelacion ? 'active' : ''}">${checks.nivelacion ? 'X' : ''}</div> Nivelación</td>
                            <td><div class="check-box ${checks.presionAgua ? 'active' : ''}">${checks.presionAgua ? 'X' : ''}</div> Presión Agua</td>
                            <td><div class="check-box ${checks.modeloSerieCheck ? 'active' : ''}">${checks.modeloSerieCheck ? 'X' : ''}</div> Modelo/Serie</td>
                        </tr>
                    </table>

                    <div class="footer-sig" style="margin-top:35px; text-align:center;">
                        <img src="${firma}" style="width:200px; border-bottom: 1px solid #000;"/><br/>
                        <strong>FIRMA DE CONFORMIDAD DEL CLIENTE</strong>
                    </div>
                </body>
            </html>
        `;

        try {
            const { base64, uri } = await Print.printToFileAsync({ html: htmlContent, base64: true });
            // ... resto de tu fetch al backend
            Alert.alert("¡Éxito!", "Reporte enviado.");
            await Sharing.shareAsync(uri);
        } catch (e) { Alert.alert("Error", "Error de red."); }
        finally { setLoading(false); }
    };

    if (showSig) {
        return <View style={StyleSheet.absoluteFill}><SignatureScreen onOK={(sig) => { setFirma(sig); setShowSig(false); }} onEmpty={() => setShowSig(false)} descriptionText="Firma del Cliente" confirmText="Guardar" clearText="Borrar" /></View>;
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color="#FFF" /></TouchableOpacity>
                <View style={styles.headerTitleContainer}><Text style={styles.headerTitle}>Generar Reporte Técnico</Text><Text style={styles.headerSubtitle}>ODS: {servicio.SERV_NUM}</Text></View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Recepción y Diagnóstico</Text>
                    {/* SECCIÓN ORIGINAL MANTENIDA */}
                    <View style={styles.row}>
                        <CheckItem label="Garantía" value={checks.garantia} onToggle={() => toggleCheck('garantia')} />
                        <CheckItem label="Papeles" value={checks.papeles} onToggle={() => toggleCheck('papeles')} />
                    </View>
                    <View style={styles.row}>
                        <CheckItem label="Pendiente" value={checks.pendiente} onToggle={() => toggleCheck('pendiente')} />
                        <CheckItem label="Completo" value={checks.completo} onToggle={() => toggleCheck('completo')} />
                    </View>
                    
                    <TextInput style={styles.inputArea} multiline placeholder="DAÑO REPORTADO..." value={danioReportado} onChangeText={setDanioReportado} />
                    
                    <View style={styles.divider} />
                    
                    {/* NUEVA LÓGICA DE ACCESORIOS SI/NO */}
                    <Text style={styles.label}>¿Entrega Accesorios?</Text>
                    <View style={styles.row}>
                        <CheckItem 
                            label="SI" 
                            value={checks.accesorios} 
                            onToggle={() => setChecks({...checks, accesorios: true})} 
                        />
                        <CheckItem 
                            label="NO" 
                            value={!checks.accesorios} 
                            onToggle={() => setChecks({...checks, accesorios: false})} 
                        />
                    </View>
                    <TextInput 
                        style={styles.inputAcc} 
                        placeholder="Descripción de accesorios..." 
                        value={accesoriosDesc} 
                        onChangeText={setAccesoriosDesc} 
                    />
                </View>

                <TouchableOpacity style={styles.btnSubmit} onPress={generarReporteGod} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>GENERAR TICKET DIGITAL</Text>}
                </TouchableOpacity>
                <View style={{height: 50}} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const CheckItem = ({ label, value, onToggle }) => (
    <TouchableOpacity style={styles.checkItem} onPress={onToggle}>
        <Ionicons name={value ? "checkbox" : "square-outline"} size={22} color={value ? "#001C38" : "#666"} />
        <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    header: { backgroundColor: "#001C38", paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
    headerTitleContainer: { alignItems: 'center', flex: 1 },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
    headerSubtitle: { fontSize: 12, color: "#88BBDC" },
    scroll: { padding: 15 },
    card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 3 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#001C38', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 5, textTransform: 'uppercase' },
    label: { fontSize: 13, fontWeight: 'bold', color: '#444', marginTop: 10, marginBottom: 5 },
    inputArea: { backgroundColor: '#F9F9F9', borderRadius: 8, padding: 10, minHeight: 60, textAlignVertical: 'top' },
    inputAcc: { borderBottomWidth: 1, borderBottomColor: '#EEE', fontSize: 14, marginTop: 5 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    checkItem: { flexDirection: 'row', alignItems: 'center', width: '48%' },
    checkLabel: { marginLeft: 8, fontSize: 13, color: '#333' },
    divider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 15 },
    btnSubmit: { backgroundColor: '#34C759', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 40, elevation: 5 },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});