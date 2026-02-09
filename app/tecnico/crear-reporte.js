import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator, Alert, Image, KeyboardAvoidingView,
    Modal,
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
    const sigRef = useRef(null);

    // Estados de control de ventanas
    const [showTerms, setShowTerms] = useState(false);
    const [showSig, setShowSig] = useState(false);

    // Datos Cliente
    const [nombreCliente, setNombreCliente] = useState("");
    const [cedulaCliente, setCedulaCliente] = useState("");
    const [telefonoCliente, setTelefonoCliente] = useState("");
    const [direccionCliente, setDireccionCliente] = useState("");
    const [correoCliente, setCorreoCliente] = useState("");

    // Datos Equipo
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

    // Fotos
    const [foto1, setFoto1] = useState(null);
    const [desc1, setDesc1] = useState("");
    const [foto2, setFoto2] = useState(null);
    const [desc2, setDesc2] = useState("");
    const [foto3, setFoto3] = useState(null);
    const [desc3, setDesc3] = useState("");
    const [foto4, setFoto4] = useState(null);
    const [desc4, setDesc4] = useState("");
    const [foto5, setFoto5] = useState(null);
    const [desc5, setDesc5] = useState("");

    const [firma, setFirma] = useState(null);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            const hayProgreso = nombreCliente || unidad || danioReportado || foto1 || firma;
            if (!hayProgreso || loading) return;
            e.preventDefault();
            Alert.alert("¿Descartar reporte?", "Se perderán todos los datos y fotos.", [
                { text: "Continuar", style: "cancel" },
                { text: "Salir", style: "destructive", onPress: () => navigation.dispatch(e.data.action) }
            ]);
        });
        return unsubscribe;
    }, [navigation, nombreCliente, unidad, danioReportado, foto1, firma, loading]);

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
            if (key === 1) setFoto1(asset);
            else if (key === 2) setFoto2(asset);
            else if (key === 3) setFoto3(asset);
            else if (key === 4) setFoto4(asset);
            else if (key === 5) setFoto5(asset);
        }
    };

    const generarReporte = async () => {
        if (!nombreCliente || !unidad || !danioReportado || !firma || !checks.aceptaCondiciones) {
            Alert.alert("Atención", "Complete los campos obligatorios y acepte las condiciones.");
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

            const convertToBase64 = (foto) => foto ? `data:image/jpeg;base64,${foto.base64}` : '';

            const datosReporte = {
                servicio, fechaSimple, fechaActual,
                nombreCliente, cedulaCliente, telefonoCliente, direccionCliente, correoCliente,
                unidad, marca, modeloEq, serieEq, colorEq,
                checks, danioReportado, inspeccionEstadoDesc, recomendaciones, accesoriosDesc,
                img1: convertToBase64(foto1), desc1,
                img2: convertToBase64(foto2), desc2,
                img3: convertToBase64(foto3), desc3,
                img4: convertToBase64(foto4), desc4,
                img5: convertToBase64(foto5), desc5,
                firma
            };

            const htmlContent = generarHtmlReporte(datosReporte);
            const { base64, uri } = await Print.printToFileAsync({ html: htmlContent, base64: true });

            const res = await crearReporte({
                cedula: servicio.SERV_CED_REC,
                nombre: servicio.SERV_NOM_REC,
                tipo: danioReportado,
                pdf_base64: base64,
                serv_id: servicio.SERV_ID,
                serv_num: servicio.SERV_NUM
            });

            if (res.success) {
                Alert.alert("Éxito", "Reporte finalizado.");
                if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
                router.push("/tecnico/home");
            } else {
                Alert.alert("Error", res.message || "Error al subir");
            }
        } catch (e) {
            Alert.alert("Error", "Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (showSig) {
        return (
            <View style={styles.signatureOverlay}>
                <View style={styles.signatureContainer}>
                    <View style={styles.signatureHeader}>
                        <Text style={styles.signatureTitle}>Firma del Cliente</Text>
                        <TouchableOpacity onPress={() => setShowSig(false)}>
                            <Ionicons name="close-circle" size={30} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>

                    <SignatureScreen
                        ref={sigRef}
                        onOK={(sig) => { setFirma(sig); setShowSig(false); }}
                        onEmpty={() => Alert.alert("Atención", "El cliente debe firmar antes de continuar.")}
                        descriptionText="Firma Digital - Electrónica Mantilla"
                        webStyle={`.m-signature-pad--footer { display: none; margin: 0; }`}
                        autoClear={true}
                    />

                    <View style={styles.signatureFooter}>
                        <TouchableOpacity
                            style={[styles.sigBtn, { backgroundColor: '#8E8E93' }]}
                            onPress={() => sigRef.current?.clearSignature()}
                        >
                            <Text style={styles.sigBtnText}>LIMPIAR</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sigBtn, { backgroundColor: '#007AFF' }]}
                            onPress={() => sigRef.current?.readSignature()}
                        >
                            <Text style={styles.sigBtnText}>LISTO</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>1. Datos del Cliente</Text>
                    <TextInput style={styles.input} placeholder="Nombre del cliente" value={nombreCliente} onChangeText={setNombreCliente} maxLength={50}/>
                    <TextInput style={styles.input} placeholder="Número de cédula o RUC" keyboardType="numeric" maxLength={13} value={cedulaCliente} onChangeText={(text) => setCedulaCliente(text.replace(/[^0-9]/g, ''))} />
                    <TextInput style={styles.input} placeholder="Teléfono" keyboardType="phone-pad" maxLength={10} value={telefonoCliente} onChangeText={(text) => setTelefonoCliente(text.replace(/[^0-9]/g, ''))} />
                    <TextInput style={styles.input} placeholder="Dirección" value={direccionCliente} onChangeText={setDireccionCliente} />
                    <TextInput style={styles.input} placeholder="Correo electrónico" keyboardType="email-address" autoCapitalize="none" value={correoCliente} onChangeText={setCorreoCliente} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>2. Identificación del Equipo</Text>
                    <View style={styles.row}>
                        <TextInput style={[styles.input, { width: '48%' }]} placeholder="Equipo Ej. Lavadora " value={unidad} onChangeText={setUnidad} />
                        <TextInput style={[styles.input, { width: '48%' }]} placeholder="Marca" value={marca} onChangeText={setMarca} />
                    </View>
                    <TextInput style={styles.input} placeholder="Modelo" value={modeloEq} onChangeText={setModeloEq} maxLength={40} />
                    <TextInput style={styles.input} placeholder="N° Serie" value={serieEq} onChangeText={setSerieEq} maxLength={40} />
                    <TextInput style={styles.input} placeholder="Color" value={colorEq} onChangeText={setColorEq} maxLength={20} />
                </View>

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

                {/* SECCIÓN 4: ACCESORIOS (CON LÓGICA CONDICIONAL) */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>4. ¿Recibe Accesorios?</Text>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.radioItem} onPress={() => setChecks({ ...checks, accesorios: true })}>
                            <Ionicons name={checks.accesorios ? "radio-button-on" : "radio-button-off"} size={22} color={checks.accesorios ? "#001C38" : "#666"} />
                            <Text style={styles.radioLabel}>SÍ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.radioItem} onPress={() => { setChecks({ ...checks, accesorios: false }); setAccesoriosDesc(""); }}>
                            <Ionicons name={!checks.accesorios ? "radio-button-on" : "radio-button-off"} size={22} color={!checks.accesorios ? "#001C38" : "#666"} />
                            <Text style={styles.radioLabel}>NO</Text>
                        </TouchableOpacity>
                    </View>
                    {checks.accesorios && (
                        <TextInput style={styles.inputAcc} placeholder="Especifique..." value={accesoriosDesc} onChangeText={setAccesoriosDesc} />
                    )}
                </View>

                {/* SECCIÓN 5: ESTADO (CON EXCLUSIÓN MUTUA) */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>5. Estado del equipo</Text>
                    <View style={styles.row}>
                        <CheckItem label="Estado Nuevo" value={checks.nuevo} onToggle={() => setChecks({ ...checks, nuevo: !checks.nuevo, usado: false })} />
                        <CheckItem label="Estado Usado" value={checks.usado} onToggle={() => setChecks({ ...checks, usado: !checks.usado, nuevo: false })} />
                    </View>
                    <CheckItem label="Fuera de Garantía" value={checks.excepcion} onToggle={() => toggleCheck('excepcion')} />
                    <TextInput style={styles.inputArea} multiline placeholder="Observaciones físicas..." value={inspeccionEstadoDesc} onChangeText={setInspeccionEstadoDesc} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>6. Verificación Técnica</Text>
                    <View style={styles.row}>
                        <CheckItem label="Nivelación" value={checks.nivelacion} onToggle={() => toggleCheck('nivelacion')} />
                        <CheckItem label="Presión de Agua" value={checks.presionAgua} onToggle={() => toggleCheck('presionAgua')} />
                    </View>
                    <View style={styles.row}>
                        <CheckItem label="Modelo/S Verificado" value={checks.modeloSerieCheck} onToggle={() => toggleCheck('modeloSerieCheck')} />
                        <CheckItem label="Inst. Eléctrica" value={checks.conexionesElectricas} onToggle={() => toggleCheck('conexionesElectricas')} />
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>7. Informe Gráfico</Text>
                    <ItemFoto label="1. Modelo - Serie" icon="barcode-outline" color="#007AFF" foto={foto1} desc={desc1} onFoto={() => seleccionarImagen(1)} onDesc={setDesc1} />
                    <ItemFoto label="2. Estado de equipo" icon="construct-outline" color="#34C759" foto={foto2} desc={desc2} onFoto={() => seleccionarImagen(2)} onDesc={setDesc2} />
                    <ItemFoto label="3. Factura" icon="document-text-outline" color="#FF9500" foto={foto3} desc={desc3} onFoto={() => seleccionarImagen(3)} onDesc={setDesc3} />
                    <ItemFoto label="4. Verificación Eléctrica" icon="flash-outline" color="#FF3B30" foto={foto4} desc={desc4} onFoto={() => seleccionarImagen(4)} onDesc={setDesc4} />
                    <ItemFoto label="5. Otra evidencia" icon="images-outline" color="#5856D6" foto={foto5} desc={desc5} onFoto={() => seleccionarImagen(5)} onDesc={setDesc5} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>8. Firma y Cierre</Text>
                    <TextInput
                        style={styles.inputArea}
                        multiline
                        placeholder="Recomendaciones que se dan al cliente ..."
                        value={recomendaciones}
                        onChangeText={setRecomendaciones}
                    />

                    <View style={styles.termsBox}>
                        <Text style={styles.termsText}>Aceptación de los términos de conformidad por parte del cliente.</Text>
                        <Switch
                            value={checks.aceptaCondiciones}
                            onValueChange={() => setShowTerms(true)}
                        />
                    </View>

                    {/* Renderizado condicional de la firma */}
                    {checks.aceptaCondiciones ? (
                        <View>
                            <Text style={styles.label}>Firma Digital del Cliente</Text>
                            <TouchableOpacity style={styles.signBox} onPress={() => setShowSig(true)}>
                                {firma ? (
                                    <Image source={{ uri: firma }} style={styles.fill} resizeMode="contain" />
                                ) : (
                                    <View style={{ alignItems: 'center' }}>
                                        <Ionicons name="pencil-outline" size={24} color="#999" />
                                        <Text style={{ color: '#999', marginTop: 5 }}>Presione aquí para firmar</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.lockedSignature}>
                            <Ionicons name="lock-closed-outline" size={20} color="#999" />
                            <Text style={styles.lockedText}>
                                El cliente debe aceptar los términos para poder la firmar.

                            </Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.btnSubmit} onPress={generarReporte} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>GUARDAR Y ENVIAR REPORTE</Text>}
                </TouchableOpacity>
                <View style={{ height: 50 }} />
            </ScrollView>

            {/* MODAL DE TÉRMINOS Y CONDICIONES */}
            <Modal visible={showTerms} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Términos y Condiciones</Text>
                        <ScrollView style={styles.termsScroll}>
                            <Text style={styles.legalText}>
                                <Text style={{ fontWeight: 'bold' }}>1. Garantía de Servicio:</Text>  El establecimiento otorga una garantía limitada de noventa (90) días calendario exclusivamente sobre la mano de obra y la reparación de la falla específica reportada en este documento. {"\n"}
                                Esta garantía entrará en vigencia a partir de la fecha de entrega del equipo. {"\n"}
                                No se cubrirán daños distintos a los aquí descritos ni fallas derivadas de componentes que no fueron intervenidos en la reparación original. {"\n\n"}

                                <Text style={{ fontWeight: 'bold' }}>2. Almacenaje y Abandono:</Text> Transcurridos 90 días desde la notificación de finalización del servicio, se cobrará una tasa de bodegaje de ley.  {"\n"}
                                Conforme al Art. 44 de la LODC, los equipos no retirados en un plazo de 6 meses se considerarán legalmente abandonados, permitiendo al establecimiento disponer de los mismos para recuperar costos de reparación y almacenamiento. {"\n\n"}

                                <Text style={{ fontWeight: 'bold' }}>3. Exclusiones de Garantía:</Text> La garantía quedará sin efecto si el equipo presenta sellos de seguridad rotos, evidencia de humedad, golpes, fluctuaciones eléctricas externas, o si ha sido manipulado por personal ajeno a este taller. {"\n"}
                                El valor de chequeo y transporte es acordao previamente con el cliente, el cual es independiente del costo de reparación y se cancela por adelantado. {"\n\n"}

                                <Text style={{ fontWeight: 'bold' }}>4. Protección de Datos (LOPDP):</Text> El cliente autoriza a Electrónica Mantilla al tratamiento de sus datos personales para fines de gestión de servicio, contacto mediante telefonía, WhatsApp, SMS o correo electrónico, y fines comerciales informativos.{"\n"}
                                El titular podrá ejercer sus derechos de acceso, rectificación o eliminación según lo estipula la Ley Orgánica de Protección de Datos Personales vigente en Ecuador {"\n\n"}
                                <Text style={{ fontWeight: 'italic', fontWeight: '600' }}>Nota: ESTE TICKET NO CONSTITUYE PRUEBA DE INGRESO DE ESTE PRODUCTO.</Text>{"\n\n"}
                                <Text style={{ fontStyle: 'italic', fontWeight: '600' }}>Declaración de Aceptación: {"\n\n"} Como cliente certifico que los datos en este documento son reales y acepto las condiciones indicadas.</Text>{"\n\n"}

                            </Text>
                        </ScrollView>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#EEE' }]} onPress={() => { setShowTerms(false); setChecks({ ...checks, aceptaCondiciones: false }); }}>
                                <Text style={{ color: '#333' }}>No acepta</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#001C38' }]} onPress={() => { setShowTerms(false); setChecks({ ...checks, aceptaCondiciones: true }); }}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Si, acepta</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    inputAcc: { borderBottomWidth: 1, borderBottomColor: '#EEE', fontSize: 14, marginTop: 5, paddingVertical: 5 },
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
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

    // ESTILOS DE FIRMA Y MODAL
    signatureOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    signatureContainer: { width: '100%', height: 450, backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', padding: 10 },
    signatureHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    signatureTitle: { fontSize: 16, fontWeight: 'bold', color: '#001C38' },
    signatureFooter: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, backgroundColor: '#FFF' },
    sigBtn: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10, elevation: 2 },
    sigBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '90%', height: '75%', backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#001C38', marginBottom: 15, textAlign: 'center' },
    termsScroll: { flex: 1, marginBottom: 20 },
    legalText: { fontSize: 13, lineHeight: 20, color: '#444', textAlign: 'justify' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    modalBtn: { width: '48%', padding: 15, borderRadius: 10, alignItems: 'center' }
});