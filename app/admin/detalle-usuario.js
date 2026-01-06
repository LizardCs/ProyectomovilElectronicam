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
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/editar-usuario.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: u.id,
                    origen: u.origen,
                    nombre,
                    apellido,
                    celular,
                    usuario,
                    clave: cambiarClave ? clave : ""
                })
            });
            const res = await response.json();
            if (res.success) {
                Alert.alert("Éxito", "Usuario actualizado");
                router.back();
            }
        } catch (e) { 
            Alert.alert("Error", "Fallo de conexión"); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleEliminar = () => {
        Alert.alert("Eliminar Usuario", "¿Estás seguro de eliminar a este usuario?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: confirmEliminar }
        ]);
    };

    const confirmEliminar = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/eliminar-usuario.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: u.id, origen: u.origen })
            });
            const res = await response.json();
            if (res.success) router.back();
        } catch (e) { 
            Alert.alert("Error", "No se pudo eliminar"); 
        }
    };

    return (
        // Agregamos 'bottom' para que respete la barra de gestos/botones del sistema
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
                    contentContainerStyle={styles.scrollContent} // Estilo para el padding interno
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
                        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

                        <Text style={styles.label}>Apellidos</Text>
                        <TextInput style={styles.input} value={apellido} onChangeText={setApellido} />

                        <Text style={styles.label}>Teléfono Celular</Text>
                        <TextInput style={styles.input} value={celular} onChangeText={setCelular} keyboardType="phone-pad" />

                        <Text style={styles.label}>Nombre de Usuario</Text>
                        <TextInput style={styles.input} value={usuario} onChangeText={setUsuario} autoCapitalize="none" />

                        <View style={styles.divider} />

                        <View style={styles.passwordHeader}>
                            <Text style={styles.labelPassword}>¿Actualizar contraseña?</Text>
                            <View style={styles.checkContainer}>
                                <TouchableOpacity
                                    style={[styles.checkBtn, !cambiarClave && styles.checkBtnActiveNo]}
                                    onPress={() => { setCambiarClave(false); setClave(""); }}
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
                                <TextInput
                                    style={[styles.input, { borderColor: '#007AFF', backgroundColor: '#F0F7FF' }]}
                                    secureTextEntry
                                    value={clave}
                                    onChangeText={setClave}
                                    placeholder="Escriba la nueva clave..."
                                />
                            </View>
                        )}

                        <TouchableOpacity style={styles.saveBtn} onPress={handleActualizar} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Actualizar Información</Text>}
                        </TouchableOpacity>
                    </View>

                    {/* BOTÓN ELIMINAR */}
                    <TouchableOpacity style={styles.deleteBtn} onPress={handleEliminar}>
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
        paddingBottom: 60 // <-- ESPACIO EXTRA para que el botón de eliminar no pegue abajo
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
    inputClaveAnim: { borderLeftWidth: 3, borderLeftColor: '#007AFF', paddingLeft: 10, marginBottom: 10, marginTop: 5 }
});