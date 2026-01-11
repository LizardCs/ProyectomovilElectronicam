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

// --- NUEVAS IMPORTACIONES MODULARES ---
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
    });

    useEffect(() => {
        loadUser();
        loadTecnicosList();
        requestPermissions();
        checkEditMode();
    }, []);

    // --- CARGA DE DATOS ---
    const loadUser = async () => {
        const userData = await SessionService.getStoredUser();
        if (userData) {
            setUser(userData);
            if (!params.servicioEditar) {
                setFormData(prev => ({
                    ...prev,
                    SERV_CED_ENV: userData.cedula || "Admin",
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
                SERV_NUM: servicio.SERV_NUM.toString(),
                SERV_DESCRIPCION: servicio.SERV_DESCRIPCION,
                SERV_CED_ENV: servicio.SERV_CED_ENV,
                SERV_NOM_ENV: servicio.SERV_NOM_ENV,
                SERV_CED_REC: servicio.SERV_CED_REC,
                SERV_NOM_REC: servicio.SERV_NOM_REC,
                SERV_EST: parseInt(servicio.SERV_EST),
                SERV_IMG_ENV: servicio.SERV_IMG_ENV ? (servicio.SERV_IMG_ENV.startsWith('data:') ? servicio.SERV_IMG_ENV : `data:image/jpeg;base64,${servicio.SERV_IMG_ENV}`) : null
            });
        }
    };

    // --- MANEJO DE IMÁGENES ---
    const requestPermissions = async () => {
        const { status: camera } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: library } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (camera !== 'granted' || library !== 'granted') {
            Alert.alert("Permisos", "Se requiere acceso a cámara y galería.");
        }
    };

    const processAndSetImage = async (uri) => {
        try {
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 800 } }],
                { 
                    compress: 0.7, 
                    format: ImageManipulator.SaveFormat.JPEG,
                    base64: true
                }
            );
            
            if (manipResult.base64) {
                setFormData({ 
                    ...formData, 
                    SERV_IMG_ENV: `data:image/jpeg;base64,${manipResult.base64}` 
                });
            } else {
                throw new Error("No se generó el código Base64");
            }

        } catch (e) {
            console.error("❌ Error detallado al procesar imagen:", e);
            Alert.alert("Error", "No se pudo procesar la imagen. Intente de nuevo.");
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

    // --- ACCIÓN PRINCIPAL: GUARDAR ---
    const handleSubmit = async () => {
        if (!formData.SERV_IMG_ENV) { Alert.alert("Falta información", "Debe adjuntar una foto del equipo."); return; }
        if (!formData.SERV_NUM) { Alert.alert("Falta información", "Ingrese el número de asignación."); return; }
        if (!formData.SERV_CED_REC) { Alert.alert("Falta información", "Debe seleccionar un técnico."); return; }

        setIsLoading(true);

        try {
            let res;
            if (isEditing) {
                res = await editarServicio(formData);
            } else {
                res = await crearServicio(formData);
            }

            if (res.success) {
                Alert.alert("Éxito", isEditing ? "Servicio actualizado" : "Servicio asignado correctamente", [
                    { text: "OK", onPress: () => router.push("/admin/home") }
                ]);
            } else {
                Alert.alert("Error", res.message);
            }
        } catch (error) {
            Alert.alert("Error", "Ocurrió un error inesperado en la nube.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value) => {
        if (field === 'SERV_NUM') {
            setFormData({ ...formData, [field]: value.replace(/[^0-9]/g, '') });
        } else if (field === 'SERV_CED_REC') {
            const tec = tecnicos.find(t => t.MOV_CED === value);
            setFormData({ ...formData, [field]: value, SERV_NOM_REC: tec ? tec.nombre_completo : "" });
        } else {
            setFormData({ ...formData, [field]: value });
        }
    };

    const handleCancel = () => {
        if (formData.SERV_IMG_ENV || formData.SERV_NUM) setShowCancelModal(true);
        else router.back();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar style="light" backgroundColor="#001C38" />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? "Editar Servicio" : "Nueva Asignación"}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.formCard}>
                        {/* SECCIÓN FOTO */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="camera" size={20} color="#007AFF" />
                                <Text style={styles.sectionTitle}>Comprobante Visual</Text>
                            </View>
                            {formData.SERV_IMG_ENV ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: formData.SERV_IMG_ENV }} style={styles.imagePreview} />
                                    <TouchableOpacity style={styles.imageActionButton} onPress={() => setFormData({ ...formData, SERV_IMG_ENV: null })}>
                                        <Text style={styles.imageActionText}>Eliminar y cambiar foto</Text>
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

                        {/* SECCIÓN NÚMERO */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="document-text" size={20} color="#007AFF" />
                                <Text style={styles.sectionTitle}>N° de Servicio / Orden</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Ingrese número de identificación"
                                value={formData.SERV_NUM}
                                onChangeText={(text) => handleChange("SERV_NUM", text)}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* SECCIÓN DESCRIPCIÓN */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="clipboard" size={20} color="#007AFF" />
                                <Text style={styles.sectionTitle}>Descripción del Problema</Text>
                            </View>
                            <TextInput
                                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                placeholder="Escriba aquí los detalles técnicos..."
                                value={formData.SERV_DESCRIPCION}
                                onChangeText={(text) => handleChange("SERV_DESCRIPCION", text)}
                                multiline={true}
                            />
                        </View>

                        {/* SECCIÓN TÉCNICO */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="people" size={20} color="#007AFF" />
                                <Text style={styles.sectionTitle}>Técnico Responsable</Text>
                            </View>
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

                        {/* RESUMEN DE ASIGNACIÓN */}
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Resumen</Text>
                            <Text style={styles.summaryText}>Asignado por: <Text style={{ fontWeight: 'bold' }}>{formData.SERV_NOM_ENV}</Text></Text>
                            {formData.SERV_NOM_REC ? <Text style={styles.summaryText}>Asignado a: <Text style={{ fontWeight: 'bold' }}>{formData.SERV_NOM_REC}</Text></Text> : null}
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                <Text style={{ fontWeight: 'bold' }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
                                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>{isEditing ? "Guardar Cambios" : "Confirmar Asignación"}</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal visible={showCancelModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>¿Desea salir?</Text>
                        <Text>Los cambios no guardados se perderán.</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setShowCancelModal(false)} style={styles.modalButtonCancel}>
                                <Text>Continuar editando</Text>
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
    section: { marginBottom: 25 },
    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: 15, fontWeight: "bold", marginLeft: 8, color: "#444" },
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
    summaryCard: { backgroundColor: "#FFF8E1", borderRadius: 12, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: "#FFECB3" },
    summaryTitle: { fontSize: 14, fontWeight: "bold", color: "#B8860B", marginBottom: 5 },
    summaryText: { fontSize: 13, color: "#555" },
    actionButtons: { flexDirection: "row", gap: 10 },
    cancelButton: { flex: 1, padding: 15, backgroundColor: "#E5E5EA", borderRadius: 12, alignItems: "center" },
    submitButton: { flex: 2, padding: 15, backgroundColor: "#007AFF", borderRadius: 12, alignItems: "center" },
    submitButtonText: { fontWeight: "bold", color: "#FFF" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContent: { backgroundColor: "white", padding: 25, borderRadius: 15, width: "85%", alignItems: "center" },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    modalButtons: { flexDirection: "row", gap: 15, marginTop: 25 },
    modalButtonCancel: { padding: 12 },
    modalButtonConfirm: { paddingHorizontal: 25, paddingVertical: 12, backgroundColor: "#FF3B30", borderRadius: 10 }
});