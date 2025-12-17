import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
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

export default function CrearServicio() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [user, setUser] = useState(null);
    const [tecnicos, setTecnicos] = useState([]);

    // Estados del formulario
    const [formData, setFormData] = useState({
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
        loadTecnicos();
        requestPermissions();
    }, []);

    const loadUser = async () => {
        try {
            const userJson = await AsyncStorage.getItem('@user_data');
            if (userJson) {
                const userData = JSON.parse(userJson);
                setUser(userData);
                setFormData(prev => ({
                    ...prev,
                    SERV_CED_ENV: userData.cedula || "Admin",
                    SERV_NOM_ENV: userData.nombre_completo || "Administrador"
                }));
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
        }
    };

    const loadTecnicos = async () => {
        try {
            const response = await fetch('http://192.168.110.167/api-expo/obtener-tecnicos.php');
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            const data = await response.json();
            if (data.success) {
                setTecnicos(data.tecnicos);
            } else {
                setTecnicos([
                    { MOV_CED: "0987654321", NOM_MOV: "Juan", MOV_APE: "Pérez", nombre_completo: "Juan Pérez (Test)" },
                ]);
            }
        } catch (error) {
            console.error('Error cargando técnicos:', error);
            setTecnicos([
                { MOV_CED: "0987654321", NOM_MOV: "Juan", MOV_APE: "Pérez", nombre_completo: "Juan Pérez (Offline)" },
            ]);
        }
    };

    const requestPermissions = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
            Alert.alert("Permisos", "Se requiere acceso a cámara y galería.");
        }
    };

    const handleChange = (field, value) => {
        if (field === 'SERV_NUM') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData({ ...formData, [field]: numericValue });
        }
        else if (field === 'SERV_CED_REC') {
            const tecnicoSeleccionado = tecnicos.find(t => t.MOV_CED === value);
            setFormData({
                ...formData,
                [field]: value,
                SERV_NOM_REC: tecnicoSeleccionado ? tecnicoSeleccionado.nombre_completo : ""
            });
        }
        else {
            setFormData({ ...formData, [field]: value });
        }
    };

    const takePhoto = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
            if (!result.canceled) {
                setFormData({ ...formData, SERV_IMG_ENV: result.assets[0].uri });
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo tomar la foto");
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
            if (!result.canceled) {
                setFormData({ ...formData, SERV_IMG_ENV: result.assets[0].uri });
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo seleccionar la imagen");
        }
    };

    // FUNCIÓN PRINCIPAL DE ENVÍO
    const handleSubmit = async () => {
        if (!formData.SERV_IMG_ENV) { Alert.alert("Falta foto", "Debes tomar una foto"); return; }
        if (!formData.SERV_NUM) { Alert.alert("Falta número", "Ingresa el número de servicio"); return; }
        if (!formData.SERV_CED_REC) { Alert.alert("Falta técnico", "Selecciona un técnico"); return; }

        setIsLoading(true);

        try {
            // GENERAR LA FECHA ACTUAL DEL TELÉFONO (YYYY-MM-DD HH:MM:SS)
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            // Esta es la fecha que se envía oculta
            const fechaAsignacion = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

            console.log("📅 Fecha de asignación generada (Teléfono):", fechaAsignacion);

            const isWeb = Platform.OS === 'web';

            if (isWeb) {
                // ============ WEB ============
                const servicioData = {
                    SERV_IMG_ENV: formData.SERV_IMG_ENV,
                    SERV_NUM: formData.SERV_NUM,
                    SERV_DESCRIPCION: formData.SERV_DESCRIPCION,
                    SERV_FECH_ASIG: fechaAsignacion, // <--- SE ENVÍA AQUÍ
                    SERV_CED_ENV: formData.SERV_CED_ENV,
                    SERV_NOM_ENV: formData.SERV_NOM_ENV,
                    SERV_CED_REC: formData.SERV_CED_REC,
                    SERV_NOM_REC: formData.SERV_NOM_REC,
                    SERV_EST: 0
                };

                const response = await fetch('http://192.168.110.167/api-expo/crear-servicio.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(servicioData)
                });

                const result = await response.json();
                if (result.success) {
                    Alert.alert("Exito", "Servicio creado", [{ text: "OK", onPress: () => router.replace("/admin/home") }]);
                } else {
                    throw new Error(result.message);
                }

            } else {
                // ============ MÓVIL (Android/iOS) ============
                const formDataToSend = new FormData();
                formDataToSend.append('SERV_NUM', formData.SERV_NUM);
                formDataToSend.append('SERV_DESCRIPCION', formData.SERV_DESCRIPCION || '');
                formDataToSend.append('SERV_FECH_ASIG', fechaAsignacion); // <--- SE ENVÍA AQUÍ
                formDataToSend.append('SERV_CED_ENV', formData.SERV_CED_ENV);
                formDataToSend.append('SERV_NOM_ENV', formData.SERV_NOM_ENV);
                formDataToSend.append('SERV_CED_REC', formData.SERV_CED_REC);
                formDataToSend.append('SERV_NOM_REC', formData.SERV_NOM_REC);
                formDataToSend.append('SERV_EST', '0');

                if (formData.SERV_IMG_ENV) {
                    const uri = formData.SERV_IMG_ENV;
                    const filename = uri.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : `image/jpeg`;

                    formDataToSend.append('SERV_IMG_ENV', {
                        uri: uri,
                        name: filename,
                        type: type,
                    });
                }

                const response = await fetch('http://192.168.110.167/api-expo/crear-servicio.php', {
                    method: 'POST',
                    body: formDataToSend,
                    headers: { 'Accept': 'application/json' }
                });

                const result = await response.json();
                if (result.success) {
                    Alert.alert("Exito", "Servicio creado", [{ text: "OK", onPress: () => router.replace("/admin/home") }]);
                } else {
                    throw new Error(result.message);
                }
            }

        } catch (error) {
            console.error(error);
            Alert.alert("Error", error.message || "Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (formData.SERV_IMG_ENV || formData.SERV_NUM) {
            setShowCancelModal(true);
        } else {
            router.back();
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Asignación de Servicios</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.formCard}>

                    {/* FOTO */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="camera" size={22} color="#007AFF" />
                            <Text style={styles.sectionTitle}>Comprobante</Text>
                        </View>
                        {formData.SERV_IMG_ENV ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: formData.SERV_IMG_ENV }} style={styles.imagePreview} />
                                <TouchableOpacity style={styles.imageActionButton} onPress={() => setFormData({ ...formData, SERV_IMG_ENV: null })}>
                                    <Text style={styles.imageActionText}>Eliminar Foto</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.cameraButtons}>
                                <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                                    <Ionicons name="camera" size={30} color="#007AFF" />
                                    <Text>Cámara</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                                    <Ionicons name="images" size={30} color="#34C759" />
                                    <Text>Galería</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* NÚMERO */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="document" size={22} color="#007AFF" />
                            <Text style={styles.sectionTitle}>Número de Servicio</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: 2024001"
                            value={formData.SERV_NUM}
                            onChangeText={(text) => handleChange("SERV_NUM", text)}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* DESCRIPCIÓN */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="clipboard" size={22} color="#007AFF" />
                            <Text style={styles.sectionTitle}>Descripción</Text>
                        </View>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                            placeholder="Detalle el trabajo a realizar..."
                            value={formData.SERV_DESCRIPCION}
                            onChangeText={(text) => handleChange("SERV_DESCRIPCION", text)}
                            multiline={true}
                            numberOfLines={4}
                        />
                    </View>

                    {/* TÉCNICO */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="people" size={22} color="#007AFF" />
                            <Text style={styles.sectionTitle}>Seleccionar Técnico</Text>
                        </View>
                        {tecnicos.map((tecnico) => (
                            <TouchableOpacity
                                key={tecnico.MOV_CED}
                                style={[
                                    styles.tecnicoOption,
                                    formData.SERV_CED_REC === tecnico.MOV_CED && styles.tecnicoOptionSelected
                                ]}
                                onPress={() => handleChange("SERV_CED_REC", tecnico.MOV_CED)}
                            >
                                <Text style={{ fontWeight: 'bold' }}>{tecnico.nombre_completo}</Text>
                                <Text style={{ fontSize: 12, color: '#666' }}>CI: {tecnico.MOV_CED}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                </View>

                {/* BOTONES */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
                        {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Asignar</Text>}
                    </TouchableOpacity>
                </View>
                <View style={{ height: 50 }} />
            </ScrollView>

            <Modal visible={showCancelModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>¿Salir?</Text>
                        <Text>Se perderán los cambios.</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setShowCancelModal(false)} style={styles.modalButtonCancel}><Text>No</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => { setShowCancelModal(false); router.back(); }} style={styles.modalButtonConfirm}><Text style={{ color: 'white' }}>Sí</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    header: { backgroundColor: "#001C38", paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
    backButton: { padding: 5 },
    scrollContainer: { flex: 1, padding: 20 },
    formCard: { backgroundColor: "#FFF", borderRadius: 15, padding: 20, marginBottom: 20 },
    section: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: "#EEE", paddingBottom: 15 },
    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: "bold", marginLeft: 10, color: "#333" },
    input: { backgroundColor: "#F9F9F9", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 12, fontSize: 16 },
    cameraButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
    cameraButton: { alignItems: "center", padding: 10, backgroundColor: "#EEE", borderRadius: 10, width: "45%" },
    imagePreview: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
    imagePreviewContainer: { alignItems: 'center' },
    imageActionButton: { padding: 10, backgroundColor: '#FFEEED', borderRadius: 8 },
    imageActionText: { color: 'red' },
    tecnicoOption: { padding: 15, borderWidth: 1, borderColor: "#EEE", borderRadius: 10, marginBottom: 8, backgroundColor: "#FAFAFA" },
    tecnicoOptionSelected: { backgroundColor: "#E3F2FD", borderColor: "#2196F3" },
    actionButtons: { flexDirection: "row", gap: 10 },
    cancelButton: { flex: 1, padding: 15, backgroundColor: "#DDD", borderRadius: 10, alignItems: "center" },
    cancelButtonText: { fontWeight: "bold", color: "#333" },
    submitButton: { flex: 2, padding: 15, backgroundColor: "#007AFF", borderRadius: 10, alignItems: "center" },
    submitButtonText: { fontWeight: "bold", color: "#FFF" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    modalButtons: { flexDirection: "row", gap: 20, marginTop: 20 },
    modalButtonCancel: { padding: 10 },
    modalButtonConfirm: { padding: 10, backgroundColor: "red", borderRadius: 5 }
});