import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

// Importar el servicio de API
import { AuthService } from "../services/api";

export default function Login() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiInfo, setApiInfo] = useState("");

  useEffect(() => {
    // Verificar si hay usuario guardado
    checkExistingSession();
    // Mostrar info de la API
    setApiInfo("API: http://192.168.110.167/api-expo");
  }, []);

  const checkExistingSession = async () => {
    try {
      const user = await AuthService.getStoredUser();
      if (user) {
        // Si hay usuario guardado, redirigir según rol
        if (user.rol === 1) {
          router.replace("/admin/home");
        } else {
          router.replace("/tecnico/home");
        }
      }
    } catch (error) {
      console.log('No hay sesión previa');
    }
  };

  const handleLogin = async () => {
    if (!usuario || !clave) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      console.log("🔐 Intentando login con:", { usuario, clave });
      
      const response = await AuthService.login({ 
        usuario: usuario.trim(), 
        clave: clave.trim() 
      });
      
      console.log("📥 Respuesta del servidor:", response);
      
      if (response.success && response.user) {
        // Login exitoso
        console.log("✅ Usuario autenticado:", response.user);
        
        // Redirigir según el rol (1=admin, 0=tecnico)
        if (response.user.rol === 1) {
          router.replace("/admin/home");
        } else {
          router.replace("/tecnico/home");
        }
        
      } else {
        // Login fallido
        Alert.alert(
          "❌ Error de autenticación",
          response.message || "Credenciales incorrectas",
          [{ text: "Intentar nuevamente" }]
        );
      }
    } catch (error) {
      console.error("❌ Error completo en login:", error);
      Alert.alert(
        "🔌 Error de conexión",
        "No se pudo conectar al servidor.\n\n" +
        "Verifica que:\n" +
        "• XAMPP Apache y MySQL estén ejecutándose\n" +
        "• Tu IP local sea correcta\n" +
        "• Ambos dispositivos estén en la misma red WiFi\n\n" +
        "Para Android Emulador usa: http://10.0.2.2/api-expo",
        [{ text: "Entendido" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "🔐 Recuperar contraseña",
      "Contacta al administrador del sistema:\n\n" +
      "📧 Electronicamantilla@gmail.com\n" +
      "📱 099xxxxxxx",
      [{ text: "Entendido" }]
    );
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://192.168.110.167/api-expo/test.php");
      const text = await response.text();
      Alert.alert(
        "🔍 Test de conexión",
        text.substring(0, 150) + "...",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert(
        "❌ Conexión fallida",
        `No se pudo conectar a la API.\n\n` +
        `URL probada: http://192.168.110.167/api-expo/test.php\n\n` +
        "Solución:\n" +
        "1. Abre XAMPP y activa Apache\n" +
        "2. Verifica tu IP local con ipconfig\n" +
        "3. Asegúrate de que el archivo test.php existe",
        [{ text: "Entendido" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header con logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>EM</Text>
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.institutionName}>Electrónica</Text>
              <Text style={styles.institutionSubname}>Mantilla ⭐</Text>
            </View>
          </View>
          <Text style={styles.welcomeText}>
            Sistema de gestión técnica
          </Text>
          
          {/* Botón para probar conexión */}
          <TouchableOpacity 
            onPress={handleTestConnection}
            style={styles.testButton}
            disabled={isLoading}
          >
            <Ionicons name="wifi-outline" size={16} color="#88BBDC" />
            <Text style={styles.testButtonText}>Probar conexión API</Text>
          </TouchableOpacity>
          
          <Text style={styles.apiInfo}>{apiInfo}</Text>
        </View>

        {/* Formulario de login */}
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.loginTitle}>Iniciar Sesión</Text>
            <Text style={styles.loginSubtitle}>
              Ingresa tus credenciales
            </Text>
          </View>

          {/* Campo de usuario */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Usuario</Text>
            <View style={styles.inputWrapper}>
              <Ionicons 
                name="person-outline" 
                size={22} 
                color="#0A6CC9" 
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Ej: admin@mantilla.com"
                placeholderTextColor="#88BBDC"
                value={usuario}
                onChangeText={setUsuario}
                style={styles.input}
                autoCapitalize="none"
                autoComplete="username"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Campo de contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Ionicons 
                name="lock-closed-outline" 
                size={22} 
                color="#0A6CC9" 
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#88BBDC"
                secureTextEntry
                value={clave}
                onChangeText={setClave}
                style={styles.input}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>
          </View>

          {/* Botón de login */}
          <TouchableOpacity 
            onPress={handleLogin} 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#000000" />
                <Text style={styles.buttonText}>Conectando...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
                <Ionicons name="arrow-forward" size={22} color="#000000" />
              </>
            )}
          </TouchableOpacity>

          {/* Enlace para recuperar contraseña */}
          <TouchableOpacity 
            onPress={handleForgotPassword} 
            style={styles.forgotButton}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            <Ionicons name="help-circle-outline" size={18} color="#0A6CC9" />
          </TouchableOpacity>

          {/* Información de credenciales */}
          <View style={styles.demoCredentials}>
            <Text style={styles.demoTitle}>Datos de prueba en BD:</Text>
            <Text style={styles.demoText}>• Usuario: admin</Text>
            <Text style={styles.demoText}>• Contraseña: password</Text>
            <Text style={styles.demoText}>• MOV_ROL: 1 (Admin) / 0 (Técnico)</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Electrónica Mantilla. Conectado a XAMPP
          </Text>
          <Text style={styles.footerVersion}>v2.1.0</Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#002A4D",
    justifyContent: "space-between",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: "#001C38",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#002A4D",
  },
  logoTextContainer: {
    flexDirection: "column",
  },
  institutionName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  institutionSubname: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0A6CC9",
    marginTop: -2,
  },
  welcomeText: {
    fontSize: 16,
    color: "#88BBDC",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 108, 201, 0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 5,
    marginBottom: 10,
  },
  testButtonText: {
    color: "#88BBDC",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  apiInfo: {
    fontSize: 11,
    color: "#0A6CC9",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  formHeader: {
    marginBottom: 35,
    alignItems: "center",
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: "#88BBDC",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 22,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
    marginLeft: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(10, 108, 201, 0.3)",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === "ios" ? 16 : 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "500",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD700",
    borderRadius: 14,
    paddingVertical: 18,
    marginTop: 30,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginRight: 10,
  },
  forgotButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 10,
  },
  forgotText: {
    fontSize: 16,
    color: "#0A6CC9",
    marginRight: 8,
    fontWeight: "500",
  },
  demoCredentials: {
    backgroundColor: "rgba(10, 108, 201, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 40,
    borderWidth: 1,
    borderColor: "rgba(10, 108, 201, 0.2)",
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 8,
  },
  demoText: {
    fontSize: 13,
    color: "#88BBDC",
    marginBottom: 4,
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: "#001C38",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#88BBDC",
    textAlign: "center",
    marginBottom: 5,
  },
  footerVersion: {
    fontSize: 11,
    color: "#0A6CC9",
    fontWeight: "500",
  },
});