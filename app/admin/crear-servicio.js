import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImageManipulator from 'expo-image-manipulator'; // Importado
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
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
        loadTecnicos();
        requestPermissions();
        checkEditMode();
    }, []);

    // --- FUNCIÓN PARA COMPRIMIR LA FOTO ---
    const optimizeImage = async (uri) => {
        try {
            const actions = [{ resize: { width: 800 } }]; // Redimensionar a 800px
            const saveOptions = {
                compress: 0.7, // 70% de calidad
                format: ImageManipulator.SaveFormat.JPEG,
            };
            const result = await ImageManipulator.manipulateAsync(uri, actions, saveOptions);
            return result.uri;
        } catch (error) {
            console.error("Error optimizando:", error);
            return uri; // Si falla, devuelve la original
        }
    };

    const checkEditMode = () => {
        if (params.servicioEditar) {
            const servicio = JSON.parse(params.servicioEditar);
            setIsEditing(true);
            setFormData(prev => ({
                ...prev,
                SERV_ID: servicio.SERV_ID,
                SERV_NUM: servicio.SERV_NUM,
                SERV_DESCRIPCION: servicio.SERV_DESCRIPCION,
                SERV_CED_ENV: servicio.SERV_CED_ENV,
                SERV_NOM_ENV: servicio.SERV_NOM_ENV,
                SERV_CED_REC: servicio.SERV_CED_REC,
                SERV_NOM_REC: servicio.SERV_NOM_REC,
                SERV_EST: parseInt(servicio.SERV_EST),
                SERV_IMG_ENV: servicio.SERV_IMG_ENV ? `data:image/jpeg;base64,${servicio.SERV_IMG_ENV}` : null
            }));
        }
    };

    const loadUser = async () => {
        try {
            const userJson = await AsyncStorage.getItem('@user_data');
            if (userJson) {
                const userData = JSON.parse(userJson);
                setUser(userData);
                const cedulaReal = userData.cedula || userData.MOV_CED || userData.id || "Admin";
                if (!params.servicioEditar) {
                    setFormData(prev => ({
                        ...prev,
                        SERV_CED_ENV: cedulaReal,
                        SERV_NOM_ENV: userData.nombre_completo || "Administrador"
                    }));
                }
            }
        } catch (error) { console.error('Error cargando usuario:', error); }
    };

    const loadTecnicos = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/obtener-tecnicos.php`);
            const data = await response.json();
            if (data.success) setTecnicos(data.tecnicos);
        } catch (error) { console.error('Error técnicos:', error); }
    };

    const requestPermissions = async () => {
        await ImagePicker.requestCameraPermissionsAsync();
        await ImagePicker.requestMediaLibraryPermissionsAsync();
    };

    const handleChange = (field, value) => {
        if (field === 'SERV_NUM') {
            setFormData({ ...formData, [field]: value.replace(/[^0-9]/g, '') });
        } else if (field === 'SERV_CED_REC') {
            const tecnico = tecnicos.find(t => t.MOV_CED === value);
            setFormData({ ...formData, [field]: value, SERV_NOM_REC: tecnico ? tecnico.nombre_completo : "" });
        } else {
            setFormData({ ...formData, [field]: value });
        }
    };

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 1 });
        if (!result.canceled) {
            const optimizedUri = await optimizeImage(result.assets[0].uri);
            setFormData({ ...formData, SERV_IMG_ENV: optimizedUri });
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 1 });
        if (!result.canceled) {
            const optimizedUri = await optimizeImage(result.assets[0].uri);
            setFormData({ ...formData, SERV_IMG_ENV: optimizedUri });
        }
    };

    const handleSubmit = async () => {
        if (!formData.SERV_IMG_ENV || !formData.SERV_NUM || !formData.SERV_CED_REC) {
            Alert.alert("Error", "Complete todos los campos obligatorios y la foto.");
            return;
        }

        setIsLoading(true);
        const url = isEditing 
            ? `${process.env.EXPO_PUBLIC_API_URL}/editar-servicio.php` 
            : `${process.env.EXPO_PUBLIC_API_URL}/crear-servicio.php`;

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('SERV_NUM', formData.SERV_NUM);
            formDataToSend.append('SERV_DESCRIPCION', formData.SERV_DESCRIPCION || '');
            formDataToSend.append('SERV_CED_REC', formData.SERV_CED_REC);
            formDataToSend.append('SERV_NOM_REC', formData.SERV_NOM_REC);
            
            if (isEditing) {
                formDataToSend.append('SERV_ID', formData.SERV_ID);
            } else {
                formDataToSend.append('SERV_CED_ENV', formData.SERV_CED_ENV);
                formDataToSend.append('SERV_NOM_ENV', formData.SERV_NOM_ENV);
                formDataToSend.append('SERV_EST', '0');
            }

            if (formData.SERV_IMG_ENV) {
                const uri = formData.SERV_IMG_ENV;
                const filename = uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                
                formDataToSend.append('SERV_IMG_ENV', {
                    uri: uri,
                    name: filename || 'photo.jpg',
                    type: type,
                });
            }

            const response = await fetch(url, {
                method: 'POST',
                body: formDataToSend,
                headers: { 'Accept': 'application/json' }
            });

            const result = await response.json();
            if (result.success) {
                Alert.alert("Éxito", result.message, [{ text: "OK", onPress: () => router.replace("/admin/home") }]);
            } else {
                Alert.alert("Error", result.message);
            }
        } catch (error) {
            Alert.alert("Error", "Error de conexión con el servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditing ? "Editar Servicio" : "Asignar Servicio"}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollContainer}>
                <View style={styles.formCard}>
                    {/* Sección Foto */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Foto Comprobante</Text>
                        {formData.SERV_IMG_ENV ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: formData.SERV_IMG_ENV }} style={styles.imagePreview} />
                                <TouchableOpacity onPress={() => setFormData({ ...formData, SERV_IMG_ENV: null })}>
                                    <Text style={{ color: 'red', marginTop: 5 }}>Quitar foto</Text>
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

                    {/* Número de Servicio */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Número</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: 11111"
                            value={formData.SERV_NUM}
                            onChangeText={(t) => handleChange("SERV_NUM", t)}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Descripción */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Descripción</Text>
                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            placeholder="Detalles..."
                            multiline
                            value={formData.SERV_DESCRIPCION}
                            onChangeText={(t) => handleChange("SERV_DESCRIPCION", t)}
                        />
                    </View>

                    {/* Técnicos */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Técnico Asignado</Text>
                        {tecnicos.map((t) => (
                            <TouchableOpacity
                                key={t.MOV_CED}
                                style={[styles.tecnicoOption, formData.SERV_CED_REC === t.MOV_CED && styles.tecnicoOptionSelected]}
                                onPress={() => handleChange("SERV_CED_REC", t.MOV_CED)}
                            >
                                <Text>{t.nombre_completo}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>GUARDAR SERVICIO</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    header: { backgroundColor: "#001C38", paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
    scrollContainer: { padding: 20 },
    formCard: { backgroundColor: "#FFF", borderRadius: 15, padding: 20, marginBottom: 20 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
    input: { backgroundColor: "#F9F9F9", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 12 },
    cameraButtons: { flexDirection: "row", justifyContent: "space-around" },
    cameraButton: { alignItems: "center", padding: 10, backgroundColor: "#EEE", borderRadius: 10, width: "45%" },
    imagePreview: { width: "100%", height: 200, borderRadius: 10 },
    imagePreviewContainer: { alignItems: 'center' },
    tecnicoOption: { padding: 12, borderWidth: 1, borderColor: "#EEE", borderRadius: 10, marginBottom: 5 },
    tecnicoOptionSelected: { backgroundColor: "#E3F2FD", borderColor: "#007AFF" },
    submitButton: { backgroundColor: "#007AFF", padding: 18, borderRadius: 10, alignItems: "center" },
    submitButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 }
});