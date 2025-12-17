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

    // Estados del formulario según tu tabla serviciostecnicos
    const [formData, setFormData] = useState({
        SERV_IMG_ENV: null,        // Foto del comprobante (URI)
        SERV_NUM: "",              // Número de servicio (solo números)
        SERV_CED_ENV: "",          // Cedula del asignador (automático)
        SERV_NOM_ENV: "",          // Nombre del asignador (automático)
        SERV_CED_REC: "",          // Cédula del técnico (seleccionar de lista)
        SERV_NOM_REC: "",          // Nombre del técnico (se llena automáticamente)
        SERV_EST: 0,               // Estado (0 = pendiente)
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
                // Llenar automáticamente los campos del asignador
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
            // Llamada a tu API para obtener técnicos (MOV_ROL = 0)
            const response = await fetch('http://192.168.110.167/api-expo/obtener-tecnicos.php');

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setTecnicos(data.tecnicos);
                console.log('✅ Técnicos cargados:', data.tecnicos);
            } else {
                console.warn('⚠️ No se encontraron técnicos:', data.message);
                // Mantener datos de prueba como fallback
                setTecnicos([
                    { MOV_CED: "0987654321", NOM_MOV: "Juan", MOV_APE: "Pérez", nombre_completo: "Juan Pérez" },
                    { MOV_CED: "1122334455", NOM_MOV: "Carlos", MOV_APE: "López", nombre_completo: "Carlos López" },
                    { MOV_CED: "5566778899", NOM_MOV: "Ana", MOV_APE: "García", nombre_completo: "Ana García" },
                ]);
            }
        } catch (error) {
            console.error('❌ Error cargando técnicos:', error);
            // Datos de prueba como fallback
            setTecnicos([
                { MOV_CED: "0987654321", NOM_MOV: "Juan", MOV_APE: "Pérez", nombre_completo: "Juan Pérez" },
                { MOV_CED: "1122334455", NOM_MOV: "Carlos", MOV_APE: "López", nombre_completo: "Carlos López" },
                { MOV_CED: "5566778899", NOM_MOV: "Ana", MOV_APE: "García", nombre_completo: "Ana García" },
            ]);
        }
    };

    const requestPermissions = async () => {
        // Solicitar permiso para cámara
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
            Alert.alert(
                "Permisos necesarios",
                "Necesitas permitir el acceso a la cámara y galería para subir fotos"
            );
        }
    };

    const handleChange = (field, value) => {
        // Si es número de servicio, solo permitir números
        if (field === 'SERV_NUM') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData({
                ...formData,
                [field]: numericValue
            });
        }
        // Si es cédula del técnico, buscar y completar nombre automáticamente
        else if (field === 'SERV_CED_REC') {
            const tecnicoSeleccionado = tecnicos.find(t => t.MOV_CED === value);
            setFormData({
                ...formData,
                [field]: value,
                SERV_NOM_REC: tecnicoSeleccionado ? tecnicoSeleccionado.nombre_completo : ""
            });
        }
        else {
            setFormData({
                ...formData,
                [field]: value
            });
        }
    };

    // TOMAR FOTO CON CÁMARA
    const takePhoto = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                base64: true, // <-- IMPORTANTE: obtener base64
            });

            if (!result.canceled) {
                setFormData({
                    ...formData,
                    SERV_IMG_ENV: `data:image/jpeg;base64,${result.assets[0].base64}`
                });
            }
        } catch (error) {
            console.error('Error tomando foto:', error);
            Alert.alert("Error", "No se pudo tomar la foto");
        }
    };

    // ELEGIR FOTO DE LA GALERÍA
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                base64: true, // <-- IMPORTANTE: obtener base64
            });

            if (!result.canceled) {
                setFormData({
                    ...formData,
                    SERV_IMG_ENV: `data:image/jpeg;base64,${result.assets[0].base64}`
                });
            }
        } catch (error) {
            console.error('Error seleccionando imagen:', error);
            Alert.alert("Error", "No se pudo seleccionar la imagen");
        }
    };

    const handleSubmit = async () => {
        // Validación del formulario
        if (!formData.SERV_IMG_ENV) {
            Alert.alert("Falta foto", "Debes tomar una foto del comprobante");
            return;
        }

        if (!formData.SERV_NUM) {
            Alert.alert("Falta número", "Ingresa el número de servicio");
            return;
        }

        if (!formData.SERV_CED_REC) {
            Alert.alert("Falta técnico", "Selecciona un técnico");
            return;
        }

        setIsLoading(true);

        try {
            // DETERMINAR SI ESTAMOS EN WEB O MÓVIL
            const isWeb = Platform.OS === 'web';
            console.log(`Ejecutando en: ${Platform.OS} (Web: ${isWeb})`);

            if (isWeb) {
                // ============ PARA WEB ============
                console.log('En WEB: Enviando como JSON...');

                const servicioData = {
                    SERV_IMG_ENV: formData.SERV_IMG_ENV,
                    SERV_NUM: formData.SERV_NUM,
                    SERV_CED_ENV: formData.SERV_CED_ENV,
                    SERV_NOM_ENV: formData.SERV_NOM_ENV,
                    SERV_CED_REC: formData.SERV_CED_REC,
                    SERV_NOM_REC: formData.SERV_NOM_REC,
                    SERV_EST: 0
                };

                console.log('Datos a enviar:', {
                    SERV_NUM: servicioData.SERV_NUM,
                    SERV_CED_REC: servicioData.SERV_CED_REC
                });

                const response = await fetch('http://192.168.110.167/api-expo/crear-servicio.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(servicioData)
                });

                const responseText = await response.text();
                console.log('Respuesta completa:', responseText);

                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (error) {
                    console.error('Error parseando JSON:', error);
                    throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 200)}`);
                }

                if (result.success) {
                    Alert.alert(
                        "✅ Servicio asignado",
                        `Servicio ${formData.SERV_NUM} asignado a ${formData.SERV_NOM_REC}`,
                        [
                            {
                                text: "OK",
                                onPress: () => {
                                    // Usar la ruta correcta para tu estructura de carpetas
                                    // Si tu home está en app/admin/home.js
                                    router.replace("/admin/home");
                                }
                            }
                        ]
                    );
                } else {
                    throw new Error(result.message || 'Error al crear el servicio');
                }

            } else {
                // ============ PARA MÓVIL (Android/iOS) ============
                console.log('En MÓVIL: Enviando como FormData...');

                const formDataToSend = new FormData();

                // Agregar campos de texto
                formDataToSend.append('SERV_NUM', formData.SERV_NUM);
                formDataToSend.append('SERV_CED_ENV', formData.SERV_CED_ENV);
                formDataToSend.append('SERV_NOM_ENV', formData.SERV_NOM_ENV);
                formDataToSend.append('SERV_CED_REC', formData.SERV_CED_REC);
                formDataToSend.append('SERV_NOM_REC', formData.SERV_NOM_REC);
                formDataToSend.append('SERV_EST', '0');

                // Agregar la imagen
                if (formData.SERV_IMG_ENV) {
                    // Si es un data URL (base64)
                    if (formData.SERV_IMG_ENV.startsWith('data:')) {
                        const base64Data = formData.SERV_IMG_ENV.split(',')[1];
                        const byteCharacters = atob(base64Data);
                        const byteArrays = [];

                        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                            const slice = byteCharacters.slice(offset, offset + 512);
                            const byteNumbers = new Array(slice.length);

                            for (let i = 0; i < slice.length; i++) {
                                byteNumbers[i] = slice.charCodeAt(i);
                            }

                            const byteArray = new Uint8Array(byteNumbers);
                            byteArrays.push(byteArray);
                        }

                        const blob = new Blob(byteArrays, { type: 'image/jpeg' });
                        formDataToSend.append('SERV_IMG_ENV', blob, `comprobante_${Date.now()}.jpg`);

                    } else {
                        // Es una URI normal de archivo
                        const filename = formData.SERV_IMG_ENV.split('/').pop() || `comprobante_${Date.now()}.jpg`;
                        formDataToSend.append('SERV_IMG_ENV', {
                            uri: formData.SERV_IMG_ENV,
                            type: 'image/jpeg',
                            name: filename
                        });
                    }
                }

                const response = await fetch('http://192.168.110.167/api-expo/crear-servicio.php', {
                    method: 'POST',
                    body: formDataToSend,
                });

                const result = await response.json();

                if (result.success) {
                    Alert.alert(
                        "✅ Servicio asignado",
                        `Servicio ${formData.SERV_NUM} asignado a ${formData.SERV_NOM_REC}`,
                        [
                            {
                                text: "Volver al inicio",
                                onPress: () => {
                                    // Ruta correcta para móvil
                                    router.replace("/admin/home");
                                }
                            }
                        ]
                    );
                } else {
                    throw new Error(result.message || 'Error al crear el servicio');
                }
            }

        } catch (error) {
            console.error('❌ Error detallado:', error);
            Alert.alert(
                "Error",
                error.message || "No se pudo crear el servicio. Verifica tu conexión."
            );
        } finally {
            setIsLoading(false);
        }
    };


    const resetForm = () => {
        setFormData({
            SERV_IMG_ENV: null,
            SERV_NUM: "",
            SERV_CED_ENV: formData.SERV_CED_ENV,
            SERV_NOM_ENV: formData.SERV_NOM_ENV,
            SERV_CED_REC: "",
            SERV_NOM_REC: "",
            SERV_EST: 0,
        });
    };

    const handleCancel = () => {
        // Verificar si hay datos sin guardar
        if (formData.SERV_IMG_ENV || formData.SERV_NUM || formData.SERV_CED_REC) {
            setShowCancelModal(true);
        } else {
            router.back();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleCancel}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Asignación de Servicios</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.formCard}>
                    {/* Sección 1: Foto del Comprobante */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="camera" size={22} color="#007AFF" />
                            <Text style={styles.sectionTitle}>Comprobante</Text>
                        </View>

                        <Text style={styles.sectionDescription}>
                            Seleccione de su galeria o tome una foto del comprobante de servicio
                        </Text>

                        {formData.SERV_IMG_ENV ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image
                                    source={{ uri: formData.SERV_IMG_ENV }}
                                    style={styles.imagePreview}
                                />
                                <View style={styles.imageActions}>
                                    <TouchableOpacity
                                        style={styles.imageActionButton}
                                        onPress={takePhoto}
                                    >
                                        <Ionicons name="camera" size={20} color="#007AFF" />
                                        <Text style={styles.imageActionText}>Retomar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.imageActionButton}
                                        onPress={() => setFormData({ ...formData, SERV_IMG_ENV: null })}
                                    >
                                        <Ionicons name="trash" size={20} color="#FF3B30" />
                                        <Text style={styles.imageActionText}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.cameraButtons}>
                                <TouchableOpacity
                                    style={styles.cameraButton}
                                    onPress={takePhoto}
                                >
                                    <Ionicons name="camera" size={30} color="#007AFF" />
                                    <Text style={styles.cameraButtonText}>Tomar Foto</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cameraButton}
                                    onPress={pickImage}
                                >
                                    <Ionicons name="images" size={30} color="#34C759" />
                                    <Text style={styles.cameraButtonText}>Galería</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Sección 2: Número de Servicio */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="document" size={22} color="#007AFF" />
                            <Text style={styles.sectionTitle}>Número de Servicio</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ejmplo: 2024001"
                                value={formData.SERV_NUM}
                                onChangeText={(text) => handleChange("SERV_NUM", text)}
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                maxLength={10}
                            />
                        </View>
                    </View>

                    {/* Sección 4: Selección del Técnico */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="people" size={22} color="#007AFF" />
                            <Text style={styles.sectionTitle}>Seleccionar Técnico *</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.pickerContainer}>
                                {tecnicos.map((tecnico) => (
                                    <TouchableOpacity
                                        key={tecnico.MOV_CED}
                                        style={[
                                            styles.tecnicoOption,
                                            formData.SERV_CED_REC === tecnico.MOV_CED && styles.tecnicoOptionSelected
                                        ]}
                                        onPress={() => handleChange("SERV_CED_REC", tecnico.MOV_CED)}
                                    >
                                        <View style={styles.tecnicoInfo}>
                                            <Ionicons
                                                name={formData.SERV_CED_REC === tecnico.MOV_CED ? "checkmark-circle" : "ellipse-outline"}
                                                size={20}
                                                color={formData.SERV_CED_REC === tecnico.MOV_CED ? "#007AFF" : "#999"}
                                            />
                                            <View style={styles.tecnicoDetails}>
                                                <Text style={[
                                                    styles.tecnicoName,
                                                    formData.SERV_CED_REC === tecnico.MOV_CED && styles.tecnicoNameSelected
                                                ]}>
                                                    {tecnico.nombre_completo}
                                                </Text>
                                                <Text style={styles.tecnicoCedula}>
                                                    CI: {tecnico.MOV_CED}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Nombre del técnico seleccionado (SOLO LECTURA) */}
                        {formData.SERV_CED_REC && (
                            <View style={styles.readOnlyContainer}>
                                <View style={styles.readOnlyField}>
                                    <Text style={styles.readOnlyLabel}>Técnico asignado:</Text>
                                    <Text style={styles.readOnlyValue}>{formData.SERV_NOM_REC}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Información de resumen */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryHeader}>
                            <Ionicons name="information-circle" size={22} color="#FF9500" />
                            <Text style={styles.summaryTitle}>Resumen de la Asignación</Text>
                        </View>

                        <View style={styles.summaryItems}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Estado:</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>PENDIENTE</Text>
                                </View>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Asignado por:</Text>
                                <Text style={styles.summaryValue}>{formData.SERV_NOM_ENV}</Text>
                            </View>
                            {formData.SERV_NOM_REC && (
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Asignado a:</Text>
                                    <Text style={styles.summaryValue}>{formData.SERV_NOM_REC}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Botones de acción */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancel}
                        disabled={isLoading}
                    >
                        <Ionicons name="close-circle" size={20} color="#666" />
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                                <Text style={styles.submitButtonText}>Asignar</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Modal de confirmación de cancelación */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showCancelModal}
                onRequestClose={() => setShowCancelModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Ionicons name="warning" size={50} color="#FF9500" style={styles.modalIcon} />
                        <Text style={styles.modalTitle}>¿Deseas salir?</Text>
                        <Text style={styles.modalText}>
                            Tienes datos sin guardar. Si sales ahora, perderás los cambios.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalButtonCancel}
                                onPress={() => setShowCancelModal(false)}
                            >
                                <Text style={styles.modalButtonCancelText}>No, quedarme</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButtonConfirm}
                                onPress={() => {
                                    setShowCancelModal(false);
                                    router.back();
                                }}
                            >
                                <Text style={styles.modalButtonConfirmText}>Sí, salir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },
    header: {
        backgroundColor: "#001C38",
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFF",
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    formCard: {
        backgroundColor: "#FFF",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    section: {
        marginBottom: 25,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F2F2F7",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1C1C1E",
        marginLeft: 10,
    },
    sectionDescription: {
        fontSize: 14,
        color: "#666",
        marginBottom: 15,
    },
    imagePreviewContainer: {
        alignItems: "center",
    },
    imagePreview: {
        width: "100%",
        height: 250,
        borderRadius: 15,
        marginBottom: 15,
        backgroundColor: "#F2F2F7",
    },
    imageActions: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
    },
    imageActionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#F2F2F7",
        borderRadius: 10,
    },
    imageActionText: {
        fontSize: 14,
        marginLeft: 8,
        fontWeight: "500",
    },
    cameraButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
    },
    cameraButton: {
        alignItems: "center",
        backgroundColor: "#F2F2F7",
        padding: 20,
        borderRadius: 15,
        width: "45%",
    },
    cameraButtonText: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: "500",
        color: "#1C1C1E",
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1C1C1E",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#F2F2F7",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#1C1C1E",
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    readOnlyContainer: {
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        padding: 15,
        marginTop: 10,
    },
    readOnlyField: {
        flexDirection: "row",
        alignItems: "center",
    },
    readOnlyLabel: {
        fontSize: 14,
        color: "#666",
        width: 120,
    },
    readOnlyValue: {
        fontSize: 15,
        color: "#1C1C1E",
        fontWeight: "600",
        flex: 1,
    },
    pickerContainer: {
        marginTop: 10,
    },
    tecnicoOption: {
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    tecnicoOptionSelected: {
        backgroundColor: "#E3F2FD",
        borderColor: "#007AFF",
    },
    tecnicoInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    tecnicoDetails: {
        marginLeft: 12,
        flex: 1,
    },
    tecnicoName: {
        fontSize: 16,
        color: "#333",
    },
    tecnicoNameSelected: {
        color: "#007AFF",
        fontWeight: "600",
    },
    tecnicoCedula: {
        fontSize: 13,
        color: "#666",
        marginTop: 2,
    },
    summaryCard: {
        backgroundColor: "#FFF8E1",
        borderRadius: 15,
        padding: 20,
        marginTop: 20,
        borderWidth: 1,
        borderColor: "#FFECB3",
    },
    summaryHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FF8F00",
        marginLeft: 10,
    },
    summaryItems: {
        gap: 10,
    },
    summaryItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    summaryLabel: {
        fontSize: 14,
        color: "#666",
    },
    summaryValue: {
        fontSize: 14,
        color: "#1C1C1E",
        fontWeight: "500",
    },
    statusBadge: {
        backgroundColor: "#FFECB3",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statusText: {
        fontSize: 12,
        color: "#FF8F00",
        fontWeight: "600",
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
        marginBottom: 20,
    },
    cancelButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        backgroundColor: "#F2F2F7",
        borderRadius: 12,
        marginRight: 10,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
        marginLeft: 8,
    },
    submitButton: {
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        backgroundColor: "#007AFF",
        borderRadius: 12,
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 30,
        width: "100%",
        alignItems: "center",
    },
    modalIcon: {
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1C1C1E",
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 30,
    },
    modalButtons: {
        flexDirection: "row",
        width: "100%",
        gap: 10,
    },
    modalButtonCancel: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: "#F2F2F7",
        borderRadius: 12,
        alignItems: "center",
    },
    modalButtonCancelText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    modalButtonConfirm: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: "#FF3B30",
        borderRadius: 12,
        alignItems: "center",
    },
    modalButtonConfirmText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
});