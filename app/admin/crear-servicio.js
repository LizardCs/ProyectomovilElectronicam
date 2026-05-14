// app/admin/crear-servicio.js
import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { buscarCliente } from "../../services/buscarCliente";
import { crearServicio } from "../../services/crearServicio";
import { editarServicio } from "../../services/editarServicio";
import { obtenerTecnicos } from "../../services/obtenerTecnicos";
import { SessionService } from "../../services/session";

export default function CrearServicio() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [isLoading, setIsLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [user, setUser] = useState(null);
    const [tecnicos, setTecnicos] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isSearchingClient, setIsSearchingClient] = useState(false);

    const handleBuscarCliente = async () => {
        const query = formData.SERV_CED_CLI || formData.SERV_TEL_CLI;
        
        if (!query) {
            Alert.alert("Aviso", "Ingrese una cédula o teléfono para buscar.");
            return;
        }

        setIsSearchingClient(true);
        const res = await buscarCliente(query);
        setIsSearchingClient(false);

        if (res.success && res.cliente) {
            setFormData(prev => ({
                ...prev,
                SERV_CED_CLI: res.cliente.CLI_CEDULA || "",
                SERV_NOM_CLI: res.cliente.CLI_NOMBRES || "",
                SERV_TEL_CLI: res.cliente.CLI_TELEFONO || "",
                SERV_CORREO_CLI: res.cliente.CLI_CORREO || "",
                SERV_DIRECCION: res.cliente.CLI_DIRECCION || "",
                SERV_CIUDAD: res.cliente.CLI_CIUDAD || ""
            }));
            Alert.alert("Cliente Encontrado", "Los datos se han autocompletado.");
        } else {
            Alert.alert("Nuevo Cliente", "No se encontró registro. Puede ingresar los datos manualmente para registrarlo.");
        }
    };
    

    const [formData, setFormData] = useState({
        SERV_ID: null,
        SERV_IMG_ENV: null,
        SERV_NUM: "",
        SERV_DESCRIPCION: "",
        SERV_CED_ENV: "",
        SERV_NOM_ENV: "",
        SERV_CED_REC: "",
        SERV_NOM_REC: "",
        SERV_EST: 0,
        SERV_NOM_CLI: "",
        SERV_TEL_CLI: "",
        SERV_CED_CLI: "",
        SERV_CORREO_CLI: "",
        SERV_CIUDAD: "",
        SERV_DIR: "",
        SERV_OBS: "",
        SERV_REQUIERE_FACT: null,
    });

    useEffect(() => {
        loadUser();
        loadTecnicosList();
        requestPermissions();
        checkEditMode();
    }, []);

    const loadUser = async () => {
        const userData = await SessionService.getStoredUser();
        if (userData) {
            setUser(userData);
            if (!params.servicioEditar) {
                setFormData(prev => ({
                    ...prev,
                    SERV_CED_ENV: String(userData.cedula || "Admin"),
                    SERV_NOM_ENV: userData.nombre_completo || "Administrador"
                }));
            }
        }
    };

    const loadTecnicosList = async () => {
        const res = await obtenerTecnicos();
        if (res.success) setTecnicos(res.tecnicos);
    };

    const checkEditMode = () => {
        if (params.servicioEditar) {
            const servicio = JSON.parse(params.servicioEditar);
            setIsEditing(true);
            setFormData({
                SERV_ID: servicio.SERV_ID,
                SERV_NUM: servicio.SERV_NUM ? String(servicio.SERV_NUM) : "",
                SERV_DESCRIPCION: servicio.SERV_DESCRIPCION || "",
                SERV_CED_ENV: servicio.SERV_CED_ENV || "",
                SERV_NOM_ENV: servicio.SERV_NOM_ENV || "",
                SERV_CED_REC: servicio.SERV_CED_REC || "",
                SERV_NOM_REC: servicio.SERV_NOM_REC || "",
                SERV_EST: parseInt(servicio.SERV_EST || 0),
                SERV_IMG_ENV: servicio.SERV_IMG_ENV || null,
                SERV_NOM_CLI: servicio.SERV_NOM_CLI || "",
                SERV_TEL_CLI: servicio.SERV_TEL_CLI || "",
                SERV_CED_CLI: servicio.SERV_CED_CLI || "",
                SERV_CORREO_CLI: servicio.SERV_CORREO_CLI || "",
                SERV_CIUDAD: servicio.SERV_CIUDAD || "",
                SERV_DIR: servicio.SERV_DIR || "",
                SERV_OBS: servicio.SERV_OBS || "",
                SERV_REQUIERE_FACT: servicio.SERV_REQUIERE_FACT === true ? true : servicio.SERV_REQUIERE_FACT === false ? false : null,
            });
        }
    };

    const requestPermissions = async () => {
        const { status: camera } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: library } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (camera !== 'granted' || library !== 'granted') {
        }
    };

    const processAndSetImage = async (uri) => {
        try {
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 600 } }],
                {
                    compress: 0.5,
                    format: ImageManipulator.SaveFormat.JPEG,
                    base64: true
                }
            );

            if (manipResult.base64) {
                setFormData({ ...formData, SERV_IMG_ENV: manipResult.base64 });
            }
        } catch (e) {
            console.error("Error al procesar imagen:", e);
            Alert.alert("Error", "No se pudo procesar la imagen.");
        }
    };

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 1 });
        if (!result.canceled) processAndSetImage(result.assets[0].uri);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 1 });
        if (!result.canceled) processAndSetImage(result.assets[0].uri);
    };

    const handleSubmit = async () => {
        if (!formData.SERV_NUM.trim()) { Alert.alert("Información faltante", "El número de servicio es obligatorio."); return; }
        if (!formData.SERV_NOM_CLI.trim()) { Alert.alert("Información faltante", "El nombre del cliente es obligatorio."); return; }
        if (!formData.SERV_TEL_CLI.trim()) { Alert.alert("Información faltante", "El teléfono del cliente es obligatorio."); return; }
        if (!formData.SERV_CIUDAD.trim()) { Alert.alert("Información faltante", "La ciudad es obligatoria."); return; }
        if (!formData.SERV_DIR.trim()) { Alert.alert("Información faltante", "La dirección es obligatoria."); return; }
        if (!formData.SERV_DESCRIPCION.trim()) { Alert.alert("Información faltante", "Debe describir el daño o problema del equipo."); return; }
        if (formData.SERV_REQUIERE_FACT === null) { Alert.alert("Información faltante", "Debe indicar si requiere factura o no."); return; }

        setIsLoading(true);
        try {
            const res = isEditing ? await editarServicio(formData) : await crearServicio(formData);

            if (res.success) {
                Alert.alert("Éxito", isEditing ? "Servicio actualizado" : "Servicio creado correctamente", [
                    { text: "OK", onPress: () => router.push("/admin/home") }
                ]);
            } else {
                Alert.alert("Error", res.message || "No se pudo guardar.");
            }
        } catch (error) {
            Alert.alert("Error", "Error de conexión con Supabase.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value) => {
        if (field === 'SERV_NUM') {
            setFormData({ ...formData, [field]: value });
        } else if (field === 'SERV_CED_REC') {
            const tec = tecnicos.find(t => t.MOV_CED === value);
            setFormData({ ...formData, [field]: value, SERV_NOM_REC: tec ? tec.nombre_completo : "" });
        } else {
            setFormData({ ...formData, [field]: value });
        }
    };

    const handleCancel = () => {
        if (formData.SERV_NOM_CLI || formData.SERV_NUM) setShowCancelModal(true);
        else router.back();
    };

    const getPreviewUri = () => {
        if (!formData.SERV_IMG_ENV) return null;
        if (formData.SERV_IMG_ENV.startsWith('data:')) return formData.SERV_IMG_ENV;
        return `data:image/jpeg;base64,${formData.SERV_IMG_ENV}`;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar style="light" backgroundColor="#001C38" />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? "Editar Orden" : "Nueva Asignación"}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.formCard}>
                        {/* FOTO */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="camera" size={20} color="#007AFF" />
                                <Text style={styles.sectionTitle}>Foto del equipo o nota de servicio <Text style={styles.optionalText}>(Opcional)</Text></Text>
                            </View>
                            {formData.SERV_IMG_ENV ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: getPreviewUri() }} style={styles.imagePreview} />
                                    <TouchableOpacity style={styles.imageActionButton} onPress={() => setFormData({ ...formData, SERV_IMG_ENV: null })}>
                                        <Text style={styles.imageActionText}>Borrar foto</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.cameraButtons}>
                                    <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                                        <Ionicons name="camera" size={28} color="#007AFF" />
                                        <Text style={styles.btnLabel}>Cámara</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                                        <Ionicons name="images" size={28} color="#34C759" />
                                        <Text style={styles.btnLabel}>Galería</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* NÚMERO */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="document-text" size={20} color="#007AFF" />
                                <Text style={styles.sectionTitle}>N° de Servicio <Text style={styles.requiredAsterisk}>*</Text></Text>
                            </View>
                            <TextInput
                                style={[styles.input, isEditing && { backgroundColor: '#E5E5EA', color: '#888' }]}
                                placeholder="Ej: A-10542"
                                maxLength={20}
                                editable={!isEditing} // No dejamos cambiar el ID si estamos editando
                                value={formData.SERV_NUM}
                                onChangeText={(text) => handleChange("SERV_NUM", text)}
                                autoCapitalize="characters"
                            />
                        </View>

                       {/* CLIENTE */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="person" size={20} color="#007AFF" />
                                <Text style={styles.sectionTitle}>Datos del Cliente <Text style={styles.requiredAsterisk}>*</Text></Text>
                            </View>

                            {/* 1. TELÉFONO (Con botón de búsqueda) */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 }}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                    placeholder="Teléfono *"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    value={formData.SERV_TEL_CLI}
                                    onChangeText={(text) => handleChange("SERV_TEL_CLI", text)}
                                />
                                <TouchableOpacity 
                                    style={{ backgroundColor: '#E3F2FD', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#007AFF' }}
                                    onPress={handleBuscarCliente}
                                    disabled={isSearchingClient}
                                >
                                    {isSearchingClient ? (
                                        <ActivityIndicator size="small" color="#007AFF" />
                                    ) : (
                                        <Ionicons name="search" size={20} color="#007AFF" />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* 2. CÉDULA (Con botón de búsqueda) */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 }}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                    placeholder="Número de cédula o RUC (Opcional)"
                                    keyboardType="numeric"
                                    maxLength={13}
                                    value={formData.SERV_CED_CLI}
                                    onChangeText={(text) => handleChange("SERV_CED_CLI", text.replace(/[^0-9]/g, ''))}
                                />
                                <TouchableOpacity 
                                    style={{ backgroundColor: '#E3F2FD', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#007AFF' }}
                                    onPress={handleBuscarCliente}
                                    disabled={isSearchingClient}
                                >
                                    {isSearchingClient ? (
                                        <ActivityIndicator size="small" color="#007AFF" />
                                    ) : (
                                        <Ionicons name="search" size={20} color="#007AFF" />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* 3. NOMBRES */}
                            <TextInput
                                style={styles.input}
                                placeholder="Nombres y Apellidos *"
                                value={formData.SERV_NOM_CLI}
                                onChangeText={(text) => handleChange("SERV_NOM_CLI", text)}
                            />

                            {/* 4. CORREO */}
                            <TextInput
                                style={styles.input}
                                placeholder="Correo electrónico (Opcional)"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.SERV_CORREO_CLI}
                                onChangeText={(text) => handleChange("SERV_CORREO_CLI", text)}
                            />
                        </View>

                        {/* UBICACIÓN */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="location" size={20} color="#007AFF" />
                                <Text style={styles.sectionTitle}>Ubicación <Text style={styles.requiredAsterisk}>*</Text></Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Ciudad"
                                value={formData.SERV_CIUDAD}
                                onChangeText={(text) => handleChange("SERV_CIUDAD", text)}
                            />
                            <TextInput
                                style={[styles.input, { marginTop: 10 }]}
                                placeholder="Dirección Exacta"
                                value={formData.SERV_DIR}
                                onChangeText={(text) => handleChange("SERV_DIR", text)}
                            />
                        </View>

                        {/* PROBLEMA */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="build" size={20} color="#007AFF" />
                                <Text style={styles.sectionTitle}>Daño / Problema <Text style={styles.requiredAsterisk}>*</Text></Text>
                            </View>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Describa la falla reportada..."
                                value={formData.SERV_DESCRIPCION}
                                onChangeText={(text) => handleChange("SERV_DESCRIPCION", text)}
                                multiline={true}
                            />
                        </View>

                        {/* OBSERVACIONES */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="eye" size={20} color="#007AFF" />
                                <Text style={styles.sectionTitle}>Observaciones <Text style={styles.optionalText}>(Opcional)</Text></Text>
                            </View>
                            <TextInput
                                style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                                placeholder="Detalles extra..."
                                value={formData.SERV_OBS}
                                onChangeText={(text) => handleChange("SERV_OBS", text)}
                                multiline={true}
                            />
                        </View>

                        {/* FACTURA */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="receipt" size={20} color="#007AFF" />
                                <Text style={styles.sectionTitle}>¿Requiere Factura? <Text style={styles.requiredAsterisk}>*</Text></Text>
                            </View>
                            <View style={styles.radioGroup}>
                                <TouchableOpacity
                                    style={styles.radioOption}
                                    onPress={() => setFormData({ ...formData, SERV_REQUIERE_FACT: true })}
                                >
                                    <Ionicons
                                        name={formData.SERV_REQUIERE_FACT === true ? "radio-button-on" : "radio-button-off"}
                                        size={24}
                                        color={formData.SERV_REQUIERE_FACT === true ? "#007AFF" : "#AAA"}
                                    />
                                    <Text style={[styles.radioLabel, formData.SERV_REQUIERE_FACT === true && styles.radioLabelSelected]}>Sí</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.radioOption}
                                    onPress={() => setFormData({ ...formData, SERV_REQUIERE_FACT: false })}
                                >
                                    <Ionicons
                                        name={formData.SERV_REQUIERE_FACT === false ? "radio-button-on" : "radio-button-off"}
                                        size={24}
                                        color={formData.SERV_REQUIERE_FACT === false ? "#007AFF" : "#AAA"}
                                    />
                                    <Text style={[styles.radioLabel, formData.SERV_REQUIERE_FACT === false && styles.radioLabelSelected]}>No</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* TÉCNICO */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="people" size={20} color="#007AFF" />
                                <Text style={styles.sectionTitle}>Asignar a Técnico <Text style={styles.optionalText}>(Opcional)</Text></Text>
                            </View>
                            {formData.SERV_CED_REC ? (
                                <TouchableOpacity onPress={() => handleChange("SERV_CED_REC", "")} style={{ alignSelf: 'flex-end', marginBottom: 5 }}>
                                    <Text style={{ color: '#FF3B30', fontSize: 12 }}>Quitar selección</Text>
                                </TouchableOpacity>
                            ) : null}
                            <View style={styles.pickerContainer}>
                                {tecnicos.map((tec) => (
                                    <TouchableOpacity
                                        key={tec.MOV_CED}
                                        style={[styles.tecnicoOption, formData.SERV_CED_REC === tec.MOV_CED && styles.tecnicoOptionSelected]}
                                        onPress={() => handleChange("SERV_CED_REC", tec.MOV_CED)}
                                    >
                                        <Ionicons
                                            name={formData.SERV_CED_REC === tec.MOV_CED ? "checkmark-circle" : "ellipse-outline"}
                                            size={20}
                                            color={formData.SERV_CED_REC === tec.MOV_CED ? "#007AFF" : "#999"}
                                        />
                                        <View style={{ marginLeft: 10 }}>
                                            <Text style={[styles.tecnicoName, formData.SERV_CED_REC === tec.MOV_CED && { fontWeight: 'bold' }]}>
                                                {tec.nombre_completo}
                                            </Text>
                                            <Text style={styles.tecnicoCedula}>CI: {tec.MOV_CED}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* ACCIONES */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                <Text style={{ fontWeight: 'bold', color: '#444' }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
                                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>{isEditing ? "Actualizar" : "Guardar Servicio"}</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* MODAL */}
            <Modal visible={showCancelModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>¿Desea salir?</Text>
                        <Text style={{ textAlign: 'center', color: '#666' }}>Se perderá la información ingresada.</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setShowCancelModal(false)} style={styles.modalButtonCancel}>
                                <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Continuar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setShowCancelModal(false); router.back(); }} style={styles.modalButtonConfirm}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Salir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    header: { backgroundColor: "#001C38", paddingTop: 10, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomLeftRadius: 15, borderBottomRightRadius: 15 },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
    backButton: { padding: 5 },
    scrollContainer: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    formCard: { backgroundColor: "#FFF", borderRadius: 15, padding: 20, elevation: 2 },
    section: { marginBottom: 20 },
    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    sectionTitle: { fontSize: 15, fontWeight: "bold", marginLeft: 8, color: "#444" },
    optionalText: { fontSize: 12, fontWeight: "normal", color: "#999" },
    requiredAsterisk: { color: "#FF3B30", fontWeight: "bold" },
    input: { backgroundColor: "#F9F9F9", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 12, fontSize: 16 },
    cameraButtons: { flexDirection: "row", justifyContent: "space-around" },
    cameraButton: { alignItems: "center", padding: 15, backgroundColor: "#F0F0F0", borderRadius: 12, width: "45%" },
    btnLabel: { fontSize: 12, marginTop: 5, color: '#666' },
    imagePreview: { width: "100%", height: 200, borderRadius: 10 },
    imagePreviewContainer: { alignItems: 'center' },
    imageActionButton: { marginTop: 10, padding: 8, backgroundColor: '#FFEEED', borderRadius: 8 },
    imageActionText: { color: '#FF3B30', fontSize: 12, fontWeight: 'bold' },
    pickerContainer: { gap: 8 },
    tecnicoOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: "#EEE", borderRadius: 10 },
    tecnicoOptionSelected: { backgroundColor: "#E3F2FD", borderColor: "#007AFF" },
    tecnicoName: { fontSize: 15, color: "#333" },
    tecnicoCedula: { fontSize: 12, color: "#888" },
    actionButtons: { flexDirection: "row", gap: 10, marginTop: 10 },
    cancelButton: { flex: 1, padding: 15, backgroundColor: "#E5E5EA", borderRadius: 12, alignItems: "center" },
    submitButton: { flex: 2, padding: 15, backgroundColor: "#007AFF", borderRadius: 12, alignItems: "center" },
    submitButtonText: { fontWeight: "bold", color: "#FFF", fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContent: { backgroundColor: "white", padding: 25, borderRadius: 15, width: "85%", alignItems: "center" },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    modalButtons: { flexDirection: "row", gap: 25, marginTop: 25 },
    modalButtonCancel: { padding: 10 },
    modalButtonConfirm: { paddingHorizontal: 25, paddingVertical: 12, backgroundColor: "#FF3B30", borderRadius: 10 },
    radioGroup: { flexDirection: 'row', gap: 30, marginTop: 5, paddingLeft: 10 },
    radioOption: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    radioLabel: { fontSize: 16, color: '#555' },
    radioLabelSelected: { fontWeight: 'bold', color: '#007AFF' },
});