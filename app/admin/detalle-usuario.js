import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { editarUsuarios } from "../../services/editarUsuarios";
import { eliminarUsuario } from "../../services/eliminarUsuario";

export default function DetalleUsuario() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const u = params.user ? JSON.parse(params.user) : {};

    const [loading, setLoading] = useState(false);
    const [nombre, setNombre] = useState(u.nombre || "");
    const [apellido, setApellido] = useState(u.apellido || "");
    const [celular, setCelular] = useState(u.celular || "");
    const [usuario, setUsuario] = useState(u.usuario || "");

    const [cambiarClave, setCambiarClave] = useState(false);
    const [clave, setClave] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleActualizar = async () => {
        if (!nombre || !apellido || !usuario) {
            Alert.alert("Error", "Campos obligatorios vacíos.");
            return;
        }

        if (cambiarClave && !clave) {
            Alert.alert("Error", "Por favor escriba la nueva contraseña.");
            return;
        }

        setLoading(true);
        try {
            const res = await editarUsuarios({
                id: u.id,
                origen: u.origen,
                nombre,
                apellido,
                celular,
                usuario,
                clave: cambiarClave ? clave : ""
            });

            if (res.success) {
                Alert.alert("Éxito", "Usuario actualizado correctamente.");
                router.back();
            } else {
                Alert.alert("Error", res.message || "No se pudo actualizar el usuario.");
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Ocurrió un error al conectar con la base de datos.");
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = () => {
        Alert.alert("Eliminar Usuario", `¿Estás seguro de eliminar a ${nombre}? Esta acción es permanente.`, [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: confirmEliminar }
        ]);
    };

    const confirmEliminar = async () => {
        setLoading(true);
        try {
            const res = await eliminarUsuario(u.id, u.origen);
            if (res.success) {
                Alert.alert("Eliminado", "El usuario ha sido borrado del sistema.");
                router.back();
            } else {
                Alert.alert("Error", res.message || "No se pudo eliminar el usuario.");
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Fallo de conexión al intentar eliminar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar style="light" backgroundColor="#001C38" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Gestionar Usuario</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* INFO BLOQUEADA */}
                    <View style={styles.infoCard}>
                        <View style={styles.lockedHeader}>
                            <Ionicons name="lock-closed" size={18} color="#999" />
                            <Text style={styles.lockedTitle}>Información Protegida</Text>
                        </View>
                        <Text style={styles.label}>Cédula de Identidad</Text>
                        <Text style={styles.readOnlyText}>{u.cedula}</Text>
                        <Text style={styles.label}>Tipo de Acceso / Rol</Text>
                        <Text style={styles.readOnlyText}>
                            {u.origen === 'WEB' ? 'SISTEMA WEB' : (parseInt(u.rol) === 1 ? 'ADMINISTRADOR MÓVIL' : 'TÉCNICO MÓVIL')}
                        </Text>
                    </View>

                    {/* FORMULARIO EDITABLE */}
                    <View style={[styles.infoCard, { marginTop: 20 }]}>
                        <View style={styles.lockedHeader}>
                            <Ionicons name="create" size={18} color="#007AFF" />
                            <Text style={[styles.lockedTitle, { color: '#007AFF' }]}>Editar Datos</Text>
                        </View>

                        <Text style={styles.label}>Nombres</Text>
                        <TextInput style={styles.input} value={nombre} maxLength={40} onChangeText={setNombre} />

                        <Text style={styles.label}>Apellidos</Text>
                        <TextInput style={styles.input} value={apellido} maxLength={40} onChangeText={setApellido} />

                        <Text style={styles.label}>Teléfono Celular</Text>
                        <TextInput style={styles.input} value={celular} maxLength={10} onChangeText={setCelular} keyboardType="phone-pad" />

                        <Text style={styles.label}>Nombre de Usuario</Text>
                        <TextInput style={styles.input} value={usuario} maxLength={40} onChangeText={setUsuario} autoCapitalize="none" />

                        <View style={styles.divider} />

                        <View style={styles.passwordHeader}>
                            <Text style={styles.labelPassword}>¿Actualizar contraseña?</Text>
                            <View style={styles.checkContainer}>
                                <TouchableOpacity
                                    style={[styles.checkBtn, !cambiarClave && styles.checkBtnActiveNo]}
                                    onPress={() => { setCambiarClave(false); setClave(""); setShowPassword(false); }}
                                >
                                    <Text style={!cambiarClave ? { color: '#FFF', fontWeight: 'bold' } : { color: '#666' }}>No</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.checkBtn, cambiarClave && styles.checkBtnActiveSi]}
                                    onPress={() => setCambiarClave(true)}
                                >
                                    <Text style={cambiarClave ? { color: '#FFF', fontWeight: 'bold' } : { color: '#666' }}>Sí</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {cambiarClave && (
                            <View style={styles.inputClaveAnim}>
                                <Text style={styles.label}>Nueva Contraseña</Text>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.inputClave}
                                        secureTextEntry={!showPassword}
                                        maxLength={40}
                                        value={clave}
                                        onChangeText={setClave}
                                        placeholder="Escriba la nueva clave..."
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-outline" : "eye-off-outline"}
                                            size={22}
                                            color="#007AFF"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity style={styles.saveBtn} onPress={handleActualizar} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Actualizar Información</Text>}
                        </TouchableOpacity>
                    </View>

                    {/* BOTÓN ELIMINAR */}
                    <TouchableOpacity style={styles.deleteBtn} onPress={handleEliminar} disabled={loading}>
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        <Text style={styles.deleteBtnText}>Eliminar Usuario del Sistema</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    header: {
        backgroundColor: "#001C38",
        paddingTop: 10,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
    scrollView: { flex: 1 },
    scrollContent: {
        padding: 20,
        paddingBottom: 60
    },
    infoCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    lockedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 10 },
    lockedTitle: { marginLeft: 8, fontSize: 14, fontWeight: 'bold', color: '#999' },
    label: { fontSize: 12, color: '#666', marginBottom: 2, fontWeight: '600' },
    readOnlyText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15, backgroundColor: '#F8F9FA', padding: 10, borderRadius: 8 },
    input: { backgroundColor: "#F9F9F9", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 15 },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
    saveBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, padding: 10 },
    deleteBtnText: { color: '#FF3B30', fontWeight: 'bold', marginLeft: 8 },
    passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, backgroundColor: '#F2F2F7', padding: 10, borderRadius: 10 },
    labelPassword: { fontSize: 14, fontWeight: 'bold', color: '#444' },
    checkContainer: { flexDirection: 'row', backgroundColor: '#DDD', borderRadius: 8, padding: 2 },
    checkBtn: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 6 },
    checkBtnActiveNo: { backgroundColor: '#8E8E93' },
    checkBtnActiveSi: { backgroundColor: '#007AFF' },
    inputClaveAnim: { borderLeftWidth: 3, borderLeftColor: '#007AFF', paddingLeft: 10, marginBottom: 10, marginTop: 5 },
    passwordInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F7FF', borderWidth: 1, borderColor: '#007AFF', borderRadius: 10, marginBottom: 15 },
    inputClave: { flex: 1, padding: 12, fontSize: 16, color: '#333' },
    eyeIcon: { paddingHorizontal: 12 }
});