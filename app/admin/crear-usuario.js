import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { crearUsuarioMovil } from "../../services/crearUsuarioMovil";
import { crearUsuarioWeb } from "../../services/crearUsuarioWeb";

export default function CrearUsuario() {
  const router = useRouter();
  const [tipo, setTipo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    celular: "",
    usuario: "",
    clave: "",
    rol: "0"
  });

  const handleChangeNumeros = (campo, valor) => {
    const soloNumeros = valor.replace(/[^0-9]/g, '');
    setForm({ ...form, [campo]: soloNumeros });
  };

  const handleGuardar = async () => {
    if (!form.cedula || !form.usuario || !form.clave) {
      Alert.alert("Error", "La cédula, usuario y clave son obligatorios.");
      return;
    }

    if (!validarDocumentoEcuador(form.cedula)) {
      Alert.alert("Documento Inválido", "La Cédula o RUC ingresado no es válido en Ecuador.");
      return;
    }

    if (form.celular && !validarCelularEcuador(form.celular)) {
      Alert.alert("Celular Inválido", "El celular debe empezar con 09 y tener 10 dígitos.");
      return;
    }

    setLoading(true);

    try {
      let response;
      if (tipo === 'movil') {
        response = await crearUsuarioMovil(form);
      } else {
        response = await crearUsuarioWeb(form);
      }

      if (response.success) {
        Alert.alert("Éxito", response.message || "Usuario creado correctamente", [
          { text: "Continuar", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("No se pudo crear", response.message);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Hubo un fallo en la conexión con la base de datos.");
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
          <Text style={styles.headerTitle}>Registrar Usuario</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* PASO 1: SELECCIONAR TIPO */}
          <Text style={styles.labelSection}>¿Qué tipo de acceso desea crear?</Text>
          <View style={styles.tipoContainer}>
            <TouchableOpacity
              style={[styles.tipoBtn, tipo === 'movil' && styles.tipoBtnActive]}
              onPress={() => setTipo('movil')}
            >
              <Ionicons name="phone-portrait-outline" size={24} color={tipo === 'movil' ? "#FFF" : "#007AFF"} />
              <Text style={[styles.tipoText, tipo === 'movil' && { color: '#FFF' }]}>APP MÓVIL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tipoBtn, tipo === 'web' && styles.tipoBtnActive]}
              onPress={() => setTipo('web')}
            >
              <Ionicons name="desktop-outline" size={24} color={tipo === 'web' ? "#FFF" : "#007AFF"} />
              <Text style={[styles.tipoText, tipo === 'web' && { color: '#FFF' }]}>SISTEMA WEB</Text>
            </TouchableOpacity>
          </View>

          {/* PASO 2: FORMULARIO DINÁMICO */}
          {tipo && (
            <View style={styles.formCard}>
              <Text style={styles.label}>Cédula de Identidad</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                maxLength={13}
                value={form.cedula}
                onChangeText={(t) => handleChangeNumeros('cedula', t)}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Nombres</Text>
                  <TextInput
                    style={styles.input}
                    maxLength={25}
                    value={form.nombre}
                    onChangeText={(t) => setForm({ ...form, nombre: t })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Apellidos</Text>
                  <TextInput
                    style={styles.input}
                    maxLength={25}
                    value={form.apellido}
                    onChangeText={(t) => setForm({ ...form, apellido: t })}
                  />
                </View>
              </View>

              <Text style={styles.label}>Teléfono Celular</Text>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                maxLength={10}
                value={form.celular}
                onChangeText={(t) => handleChangeNumeros('celular', t)}
                placeholder="09..."
              />

              <View style={styles.divider} />

              <Text style={styles.label}>Nombre de Usuario</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                maxLength={40}
                value={form.usuario}
                onChangeText={(t) => setForm({ ...form, usuario: t })}
              />

              <Text style={styles.label}>Contraseña de Acceso</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.inputPassword}
                  secureTextEntry={!showPassword}
                  maxLength={40}
                  value={form.clave}
                  onChangeText={(t) => setForm({ ...form, clave: t })}
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

              {tipo === 'movil' && (
                <>
                  <Text style={styles.label}>Asignar Rol</Text>
                  <View style={styles.tipoContainer}>
                    <TouchableOpacity
                      style={[styles.rolBtn, form.rol === "0" && styles.rolBtnActive]}
                      onPress={() => setForm({ ...form, rol: "0" })}
                    >
                      <Text style={form.rol === "0" ? { color: '#FFF', fontWeight: 'bold' } : { color: '#666' }}>Técnico</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.rolBtn, form.rol === "1" && styles.rolBtnActive]}
                      onPress={() => setForm({ ...form, rol: "1" })}
                    >
                      <Text style={form.rol === "1" ? { color: '#FFF', fontWeight: 'bold' } : { color: '#666' }}>Administrador</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleGuardar}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Confirmar Registro {tipo.toUpperCase()}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const validarDocumentoEcuador = (documento) => {
  if (!documento) return false;
  const limits = [10, 13];
  if (!limits.includes(documento.length)) return false;
  if (documento.length === 13 && documento.slice(10, 13) !== '001') return false;

  const cedula = documento.substring(0, 10);
  const digitoRegion = parseInt(cedula.substring(0, 2));
  if (digitoRegion < 1 || digitoRegion > 24) return false;

  const ultimoDigito = parseInt(cedula.substring(9, 10));
  let pares = 0, impares = 0, suma = 0;

  for (let i = 0; i < 9; i++) {
    let val = parseInt(cedula.charAt(i));
    if (i % 2 === 0) {
      val = val * 2;
      if (val > 9) val -= 9;
      impares += val;
    } else {
      pares += val;
    }
  }

  suma = pares + impares;
  let verificador = 10 - (suma % 10);
  if (verificador === 10) verificador = 0;

  return verificador === ultimoDigito;
};

const validarCelularEcuador = (celular) => {
  return /^09\d{8}$/.test(celular);
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  header: { backgroundColor: "#001C38", paddingTop: 10, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomLeftRadius: 15, borderBottomRightRadius: 15 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  labelSection: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#444' },
  tipoContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tipoBtn: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#007AFF' },
  tipoBtnActive: { backgroundColor: '#007AFF' },
  tipoText: { marginTop: 5, fontWeight: 'bold', fontSize: 12, color: '#007AFF' },
  formCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, shadowColor: "#000", shadowOpacity: 0.1, elevation: 3 },
  label: { fontSize: 14, color: '#666', marginBottom: 5, fontWeight: '600' },
  input: { backgroundColor: "#F9F9F9", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 15 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    marginBottom: 15
  },
  inputPassword: { flex: 1, padding: 12, fontSize: 16 },
  eyeIcon: { paddingHorizontal: 12 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  rolBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', alignItems: 'center' },
  rolBtnActive: { backgroundColor: '#34C759', borderColor: '#34C759' },
  submitButton: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});