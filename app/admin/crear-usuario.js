import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
    ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";

export default function CrearUsuario() {
  const router = useRouter();
  const [tipo, setTipo] = useState(null); // 'movil' o 'web'
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    cedula: "", nombre: "", apellido: "", celular: "",
    usuario: "", clave: "", rol: "0" // rol solo para movil
  });

  const handleGuardar = async () => {
    if (!form.cedula || !form.usuario || !form.clave) {
      Alert.alert("Error", "Completa los campos principales");
      return;
    }

    setLoading(true);
    // Endpoint dinámico según el tipo seleccionado
    const url = tipo === 'movil' 
      ? 'http://192.168.110.167/api-expo/crear-usuario-movil.php'
      : 'http://192.168.110.167/api-expo/crear-usuario-web.php';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const res = await response.json();
      if (res.success) {
        Alert.alert("Éxito", "Usuario creado correctamente", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (e) { Alert.alert("Error", "No hay conexión"); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#FFF" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar Usuario</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* PASO 1: SELECCIONAR TIPO */}
        <Text style={styles.labelSection}>¿Qué tipo de acceso desea crear?</Text>
        <View style={styles.tipoContainer}>
          <TouchableOpacity 
            style={[styles.tipoBtn, tipo === 'movil' && styles.tipoBtnActive]} 
            onPress={() => setTipo('movil')}
          >
            <Ionicons name="phone-portrait-outline" size={24} color={tipo === 'movil' ? "#FFF" : "#007AFF"} />
            <Text style={[styles.tipoText, tipo === 'movil' && {color: '#FFF'}]}>APP MÓVIL</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tipoBtn, tipo === 'web' && styles.tipoBtnActive]} 
            onPress={() => setTipo('web')}
          >
            <Ionicons name="desktop-outline" size={24} color={tipo === 'web' ? "#FFF" : "#007AFF"} />
            <Text style={[styles.tipoText, tipo === 'web' && {color: '#FFF'}]}>SISTEMA WEB</Text>
          </TouchableOpacity>
        </View>

        {/* PASO 2: FORMULARIO DINÁMICO */}
        {tipo && (
          <View style={styles.formCard}>
            <Text style={styles.label}>Cédula de Identidad</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={form.cedula} onChangeText={(t)=>setForm({...form, cedula:t})} />

            <View style={{flexDirection:'row', gap:10}}>
              <View style={{flex:1}}>
                <Text style={styles.label}>Nombres</Text>
                <TextInput style={styles.input} value={form.nombre} onChangeText={(t)=>setForm({...form, nombre:t})} />
              </View>
              <View style={{flex:1}}>
                <Text style={styles.label}>Apellidos</Text>
                <TextInput style={styles.input} value={form.apellido} onChangeText={(t)=>setForm({...form, apellido:t})} />
              </View>
            </View>

            <Text style={styles.label}>Teléfono Celular</Text>
            <TextInput style={styles.input} keyboardType="phone-pad" value={form.celular} onChangeText={(t)=>setForm({...form, celular:t})} />

            <View style={styles.divider} />

            <Text style={styles.label}>Nombre de Usuario</Text>
            <TextInput style={styles.input} autoCapitalize="none" value={form.usuario} onChangeText={(t)=>setForm({...form, usuario:t})} />

            <Text style={styles.label}>Contraseña de Acceso</Text>
            <TextInput style={styles.input} secureTextEntry value={form.clave} onChangeText={(t)=>setForm({...form, clave:t})} />

            {/* Solo si es móvil, mostrar el ROL */}
            {tipo === 'movil' && (
              <>
                <Text style={styles.label}>Asignar Rol</Text>
                <View style={styles.tipoContainer}>
                   <TouchableOpacity 
                    style={[styles.rolBtn, form.rol === "0" && styles.rolBtnActive]} 
                    onPress={() => setForm({...form, rol: "0"})}
                   >
                     <Text style={form.rol === "0" ? {color: '#FFF'} : {}}>Técnico</Text>
                   </TouchableOpacity>
                   <TouchableOpacity 
                    style={[styles.rolBtn, form.rol === "1" && styles.rolBtnActive]} 
                    onPress={() => setForm({...form, rol: "1"})}
                   >
                     <Text style={form.rol === "1" ? {color: '#FFF'} : {}}>Administrador</Text>
                   </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleGuardar} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Crear Usuario {tipo.toUpperCase()}</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  header: { backgroundColor: "#001C38", paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
  scrollContainer: { padding: 20 },
  labelSection: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#444' },
  tipoContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tipoBtn: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#007AFF' },
  tipoBtnActive: { backgroundColor: '#007AFF' },
  tipoText: { marginTop: 5, fontWeight: 'bold', fontSize: 12, color: '#007AFF' },
  formCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, shadowColor: "#000", shadowOpacity: 0.1, elevation: 3 },
  label: { fontSize: 14, color: '#666', marginBottom: 5, fontWeight: '600' },
  input: { backgroundColor: "#F9F9F9", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  rolBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', alignItems: 'center' },
  rolBtnActive: { backgroundColor: '#34C759', borderColor: '#34C759' },
  submitButton: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});