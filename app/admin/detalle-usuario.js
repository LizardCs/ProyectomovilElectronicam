import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert, KeyboardAvoidingView, Platform, ScrollView,
    StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";

export default function DetalleUsuario() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const u = JSON.parse(params.user); // Datos que vienen del Home

    const [loading, setLoading] = useState(false);
    // Solo dejamos editable el usuario y la clave
    const [usuario, setUsuario] = useState(u.usuario);
    const [clave, setClave] = useState(u.clave || ""); 

    const handleActualizar = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://192.168.110.167/api-expo/editar-usuario.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: u.id, origen: u.origen, usuario, clave })
            });
            const res = await response.json();
            if (res.success) {
                Alert.alert("Éxito", "Credenciales actualizadas");
                router.back();
            }
        } catch (e) { Alert.alert("Error", "No hay conexión"); }
        finally { setLoading(false); }
    };

    const handleEliminar = () => {
        Alert.alert("Eliminar Usuario", "¿Estás seguro de eliminar a este usuario de forma permanente?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: confirmEliminar }
        ]);
    };

    const confirmEliminar = async () => {
        try {
            const response = await fetch('http://192.168.110.167/api-expo/eliminar-usuario.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: u.id, origen: u.origen })
            });
            const res = await response.json();
            if (res.success) router.back();
        } catch (e) { Alert.alert("Error", "No se pudo eliminar"); }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#FFF" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Gestionar Usuario</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollContainer}>
                {/* INFO BLOQUEADA (READ ONLY) */}
                <View style={styles.infoCard}>
                    <View style={styles.lockedHeader}>
                        <Ionicons name="lock-closed" size={18} color="#999" />
                        <Text style={styles.lockedTitle}>Información Protegida</Text>
                    </View>
                    
                    <Text style={styles.label}>Cédula</Text>
                    <Text style={styles.readOnlyText}>{u.cedula}</Text>

                    <Text style={styles.label}>Nombres y Apellidos</Text>
                    <Text style={styles.readOnlyText}>{u.nombre} {u.apellido}</Text>

                    <Text style={styles.label}>Tipo de Acceso / Rol</Text>
                    <Text style={styles.readOnlyText}>
                        {u.origen === 'WEB' ? 'SISTEMA WEB' : (u.rol == 1 ? 'ADMINISTRADOR' : 'TÉCNICO')}
                    </Text>
                </View>

                {/* INFO EDITABLE */}
                <View style={[styles.infoCard, {marginTop: 20}]}>
                    <View style={styles.lockedHeader}>
                        <Ionicons name="create" size={18} color="#007AFF" />
                        <Text style={[styles.lockedTitle, {color: '#007AFF'}]}>Credenciales de Acceso</Text>
                    </View>

                    <Text style={styles.label}>Nombre de Usuario</Text>
                    <TextInput style={styles.input} value={usuario} onChangeText={setUsuario} autoCapitalize="none" />

                    <Text style={styles.label}>Nueva Contraseña</Text>
                    <TextInput style={styles.input} secureTextEntry value={clave} onChangeText={setClave} placeholder="Escriba nueva clave..." />

                    <TouchableOpacity style={styles.saveBtn} onPress={handleActualizar} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Guardar Cambios</Text>}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.deleteBtn} onPress={handleEliminar}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    <Text style={styles.deleteBtnText}>Eliminar Usuario del Sistema</Text>
                </TouchableOpacity>
                
                <View style={{height: 50}} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    header: { backgroundColor: "#001C38", paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
    scrollContainer: { padding: 20 },
    infoCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, elevation: 3 },
    lockedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 10 },
    lockedTitle: { marginLeft: 8, fontSize: 14, fontWeight: 'bold', color: '#999' },
    label: { fontSize: 12, color: '#666', marginBottom: 2 },
    readOnlyText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15, backgroundColor: '#F8F9FA', padding: 10, borderRadius: 8 },
    input: { backgroundColor: "#F9F9F9", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 15 },
    saveBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 12, alignItems: 'center' },
    saveBtnText: { color: '#FFF', fontWeight: 'bold' },
    deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, padding: 10 },
    deleteBtnText: { color: '#FF3B30', fontWeight: 'bold', marginLeft: 8 }
});