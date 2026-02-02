import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from "react";
import {
    ActivityIndicator, Alert, Image, KeyboardAvoidingView,
    Platform, ScrollView, StyleSheet,
    Switch,
    Text, TextInput, TouchableOpacity, View
} from "react-native";
import SignatureScreen from "react-native-signature-canvas";
import { crearReporte } from "../../services/crearReporte";
import { generarHtmlReporte } from "../../utils/reporteTemplate";

export default function CrearReporte() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const servicio = JSON.parse(params.servicio);
    const [loading, setLoading] = useState(false);
    const [nombreCliente, setNombreCliente] = useState("");
    const [cedulaCliente, setCedulaCliente] = useState("");
    const [telefonoCliente, setTelefonoCliente] = useState("");
    const [direccionCliente, setDireccionCliente] = useState("");
    const [unidad, setUnidad] = useState("");
    const [marca, setMarca] = useState("");
    const [modeloEq, setModeloEq] = useState("");
    const [serieEq, setSerieEq] = useState("");
    const [colorEq, setColorEq] = useState("");

    const [checks, setChecks] = useState({
        garantia: false, papeles: false, pendiente: false, completo: false,
        nuevo: false, usado: true, excepcion: false,
        nivelacion: false, presionAgua: false,
        modeloSerieCheck: false, conexionesElectricas: false,
        conexionesAgua: false, equipoInstalado: false,
        accesorios: false,
        aceptaCondiciones: false
    });

    const [danioReportado, setDanioReportado] = useState("");
    const [inspeccionEstadoDesc, setInspeccionEstadoDesc] = useState("");
    const [accesoriosDesc, setAccesoriosDesc] = useState("");
    const [recomendaciones, setRecomendaciones] = useState("");
    const [fotoModelo, setFotoModelo] = useState(null);
    const [descModelo, setDescModelo] = useState("");
    const [fotoFactura, setFotoFactura] = useState(null);
    const [descFactura, setDescFactura] = useState("");
    const [fotoElectrico, setFotoElectrico] = useState(null);
    const [descElectrico, setDescElectrico] = useState("");

    const [firma, setFirma] = useState(null);
    const [showSig, setShowSig] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            const hayProgreso = nombreCliente || unidad || danioReportado || fotoModelo || firma;
            if (!hayProgreso || loading) return;
            e.preventDefault();
            Alert.alert("¿Descartar reporte?", "Se perderán todos los datos y fotos de este reporte técnico.", [
                { text: "Continuar editando", style: "cancel" },
                { text: "Salir y borrar", style: "destructive", onPress: () => navigation.dispatch(e.data.action) }
            ]);
        });
        return unsubscribe;
    }, [navigation, nombreCliente, unidad, danioReportado, fotoModelo, firma, loading]);

    const toggleCheck = (key) => setChecks(prev => ({ ...prev, [key]: !prev[key] }));

    const seleccionarImagen = (key) => {
        Alert.alert("Origen de la imagen", "¿Desea capturar una foto o elegir de la galería?", [
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

    const generarReporte = async () => {
        if (!nombreCliente || !unidad || !danioReportado || !firma || !checks.aceptaCondiciones) {
            Alert.alert("Atención", "Campos obligatorios: Cliente, Equipo, Daño, Firma y Aceptar Condiciones.");
            return;
        }

        setLoading(true);

        try {
            const fechaActual = new Date().toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            const fechaSimple = new Date().toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            const imgModelo = fotoModelo ? `data:image/jpeg;base64,${fotoModelo.base64}` : '';
            const imgFactura = fotoFactura ? `data:image/jpeg;base64,${fotoFactura.base64}` : '';
            const imgFinal = fotoElectrico ? `data:image/jpeg;base64,${fotoElectrico.base64}` : '';

            const datosReporte = {
                servicio,
                fechaSimple,
                fechaActual,
                nombreCliente,
                cedulaCliente,
                telefonoCliente,
                direccionCliente,
                unidad,
                marca,
                modeloEq,
                serieEq,
                colorEq,
                checks,
                danioReportado,
                inspeccionEstadoDesc,
                recomendaciones,
                accesoriosDesc,
                imgModelo,
                imgFactura,
                imgFinal,
                firma
            };

            const htmlContent = generarHtmlReporte(datosReporte);

            if (!htmlContent || htmlContent.length < 100) {
                throw new Error("HTML no se generó correctamente");
            }

            const { base64, uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: true
            });

            if (!base64) {
                throw new Error("No se pudo generar el PDF");
            }

            const res = await crearReporte({
                cedula: servicio.SERV_CED_REC,
                nombre: servicio.SERV_NOM_REC,
                tipo: danioReportado,
                pdf_base64: base64,
                serv_id: servicio.SERV_ID,
                serv_num: servicio.SERV_NUM
            });

            if (res.success) {
                Alert.alert("Éxito", "Reporte guardado y servicio finalizado.");
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri);
                } else {
                    Alert.alert("Éxito", "Reporte guardado. Comparte manualmente el archivo.");
                }
                router.push("/tecnico/home");
            } else {
                Alert.alert("Error", res.message || "Error al subir el reporte");
            }
        } catch (e) {
            Alert.alert("Error", "Problema al generar el reporte: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (showSig) {
        return (
            <View style={StyleSheet.absoluteFill}>
                <SignatureScreen
                    onOK={(sig) => { setFirma(sig); setShowSig(false); }}
                    onEmpty={() => setShowSig(false)}
                    descriptionText="Firma del Cliente"
                    confirmText="Guardar"
                    clearText="Limpiar"
                />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color="#FFF" /></TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Generar Reporte Técnico</Text>
                    <Text style={styles.headerSubtitle}>Orden Nº: {servicio.SERV_NUM}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* 1. DATOS CLIENTE */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>1. Datos del Cliente</Text>
                    <TextInput style={styles.input} placeholder="Nombre del cliente" value={nombreCliente} onChangeText={setNombreCliente} />
                    <TextInput style={styles.input} placeholder="Número de cédula o RUC" keyboardType="numeric" maxLength={13} value={cedulaCliente} onChangeText={(text) => setCedulaCliente(text.replace(/[^0-9]/g, ''))} />
                    <TextInput style={styles.input} placeholder="Teléfono de contacto" keyboardType="phone-pad" maxLength={10} value={telefonoCliente} onChangeText={(text) => setTelefonoCliente(text.replace(/[^0-9]/g, ''))} />
                    <TextInput style={styles.input} placeholder="Dirección del domicilio" value={direccionCliente} onChangeText={setDireccionCliente} />
                </View>

                {/* 2. IDENTIFICACION EQUIPO */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>2. Identificación del Equipo</Text>
                    <View style={styles.row}>
                        <TextInput style={[styles.input, { width: '48%' }]} placeholder="Unidad (Ej. Lavadora)" value={unidad} onChangeText={setUnidad} />
                        <TextInput style={[styles.input, { width: '48%' }]} placeholder="Marca" value={marca} onChangeText={setMarca} />
                    </View>
                    <TextInput style={styles.input} placeholder="Modelo" value={modeloEq} onChangeText={setModeloEq} />
                    <TextInput style={styles.input} placeholder="N° Serie" value={serieEq} onChangeText={setSerieEq} />
                    <TextInput style={styles.input} placeholder="Color" value={colorEq} onChangeText={setColorEq} />
                </View>

                {/* 3. RECEPCIÓN Y DIAGNÓSTICO */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>3. Recepción y Diagnóstico</Text>
                    <View style={styles.row}>
                        <CheckItem label="En Garantía" value={checks.garantia} onToggle={() => toggleCheck('garantia')} />
                        <CheckItem label="Con Papeles" value={checks.papeles} onToggle={() => toggleCheck('papeles')} />
                    </View>
                    <View style={styles.row}>
                        <CheckItem label="Pendiente" value={checks.pendiente} onToggle={() => toggleCheck('pendiente')} />
                        <CheckItem label="Caja Completa" value={checks.completo} onToggle={() => toggleCheck('completo')} />
                    </View>
                    <TextInput style={styles.inputArea} multiline placeholder="DESCRIBA EL DAÑO REPORTADO..." value={danioReportado} onChangeText={setDanioReportado} />
                </View>

                {/* 4. ACCESORIOS */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>4. ¿Recibe Accesorios?</Text>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.radioItem} onPress={() => setChecks({ ...checks, accesorios: true })}>
                            <Ionicons name={checks.accesorios ? "radio-button-on" : "radio-button-off"} size={22} color={checks.accesorios ? "#001C38" : "#666"} />
                            <Text style={styles.radioLabel}>SÍ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.radioItem} onPress={() => setChecks({ ...checks, accesorios: false })}>
                            <Ionicons name={!checks.accesorios ? "radio-button-on" : "radio-button-off"} size={22} color={!checks.accesorios ? "#001C38" : "#666"} />
                            <Text style={styles.radioLabel}>NO</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput style={styles.inputAcc} placeholder="Especifique accesorios recibidos..." value={accesoriosDesc} onChangeText={setAccesoriosDesc} />
                </View>

                {/* 5. INSPECCIÓN ESTADO */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>5. Inspección de Estado</Text>
                    <View style={styles.row}>
                        <CheckItem label="Estado Nuevo" value={checks.nuevo} onToggle={() => toggleCheck('nuevo')} />
                        <CheckItem label="Estado Usado" value={checks.usado} onToggle={() => toggleCheck('usado')} />
                    </View>
                    <CheckItem label="Fuera de Garantía" value={checks.excepcion} onToggle={() => toggleCheck('excepcion')} />
                    <TextInput style={styles.inputArea} multiline placeholder="Observaciones físicas (rayones, golpes)..." value={inspeccionEstadoDesc} onChangeText={setInspeccionEstadoDesc} />
                </View>

                {/* 6. PUNTOS TÉCNICOS */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>6. Verificación Técnica</Text>
                    <View style={styles.row}>
                        <CheckItem label="Nivelación" value={checks.nivelacion} onToggle={() => toggleCheck('nivelacion')} />
                        <CheckItem label="Presión de Agua" value={checks.presionAgua} onToggle={() => toggleCheck('presionAgua')} />
                    </View>
                    <View style={styles.row}>
                        <CheckItem label="Verif. Modelo" value={checks.modeloSerieCheck} onToggle={() => toggleCheck('modeloSerieCheck')} />
                        <CheckItem label="Inst. Eléctrica" value={checks.conexionesElectricas} onToggle={() => toggleCheck('conexionesElectricas')} />
                    </View>
                </View>

                {/* 7. EVIDENCIA FOTOGRÁFICA */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>7. Registro Fotográfico</Text>
                    <ItemFoto label="Foto Modelo/Serie" icon="barcode-outline" color="#007AFF" foto={fotoModelo} desc={descModelo} onFoto={() => seleccionarImagen('modelo')} onDesc={setDescModelo} />
                    <ItemFoto label="Foto de la Factura" icon="receipt-outline" color="#34C759" foto={fotoFactura} desc={descFactura} onFoto={() => seleccionarImagen('factura')} onDesc={setDescFactura} />
                    <ItemFoto label="Foto Est. Eléctrico" icon="flash-outline" color="#FF9500" foto={fotoElectrico} desc={descElectrico} onFoto={() => seleccionarImagen('electrico')} onDesc={setDescElectrico} />
                </View>

                {/* 8. CIERRE */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>8. Firma y Cierre</Text>
                    <TextInput style={styles.inputArea} multiline placeholder="Recomendaciones para el cliente..." value={recomendaciones} onChangeText={setRecomendaciones} />
                    <View style={styles.termsBox}>
                        <Text style={styles.termsText}>Certifico que el trabajo ha sido realizado y acepto los términos de conformidad.</Text>
                        <Switch value={checks.aceptaCondiciones} onValueChange={() => toggleCheck('aceptaCondiciones')} />
                    </View>
                    <Text style={styles.label}>Firma Digital del Cliente</Text>
                    <TouchableOpacity style={styles.signBox} onPress={() => setShowSig(true)}>
                        {firma ? <Image source={{ uri: firma }} style={styles.fill} resizeMode="contain" /> : <View style={{ alignItems: 'center' }}><Ionicons name="pencil-outline" size={24} color="#999" /><Text style={{ color: '#999', marginTop: 5 }}>Presione aquí para firmar</Text></View>}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.btnSubmit} onPress={generarReporte} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>GUARDAR Y FINALIZAR TRABAJO</Text>}
                </TouchableOpacity>
                <View style={{ height: 50 }} />
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

const ItemFoto = ({ label, icon, color, foto, desc, onFoto, onDesc }) => (
    <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity style={styles.photoBtn} onPress={onFoto}>
            {foto ? <Image source={{ uri: foto.uri }} style={styles.fill} /> : <Ionicons name={icon} size={40} color={color} />}
        </TouchableOpacity>
        <TextInput style={styles.inputSmall} placeholder="Descripción de la foto..." value={desc} onChangeText={onDesc} />
    </View>
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
    input: { backgroundColor: '#F9F9F9', borderBottomWidth: 1, borderBottomColor: '#DDD', padding: 8, marginBottom: 10, fontSize: 15 },
    inputArea: { backgroundColor: '#F9F9F9', borderRadius: 8, padding: 10, minHeight: 60, textAlignVertical: 'top' },
    inputAcc: { borderBottomWidth: 1, borderBottomColor: '#EEE', fontSize: 14, marginTop: 5 },
    inputSmall: { fontSize: 12, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 5, color: '#666' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    checkItem: { flexDirection: 'row', alignItems: 'center', width: '48%' },
    checkLabel: { marginLeft: 8, fontSize: 13, color: '#333' },
    radioItem: { flexDirection: 'row', alignItems: 'center', width: '45%', paddingVertical: 10 },
    radioLabel: { marginLeft: 10, fontSize: 15, fontWeight: '600', color: '#333' },
    photoBtn: { width: '100%', height: 160, backgroundColor: '#F8F9FA', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 5, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#CCC', overflow: 'hidden' },
    fill: { width: '100%', height: '100%' },
    termsBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6', padding: 12, borderRadius: 10, marginVertical: 15 },
    termsText: { flex: 1, fontSize: 11, color: '#856404', marginRight: 10 },
    signBox: { width: '100%', height: 130, borderStyle: 'dashed', borderWidth: 2, borderColor: '#007AFF', borderRadius: 12, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center' },
    btnSubmit: { backgroundColor: '#34C759', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 40, elevation: 5 },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});