import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from "react-native";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    
    // Simulación de autenticación
    setTimeout(() => {
      setIsLoading(false);
      
      // Credenciales de prueba
      if (email === "admin@mantilla.com" && password === "admin123") {
        router.replace("/admin/home");
      } else if (email === "tecnico@mantilla.com" && password === "tecnico123") {
        router.replace("/tecnico/home");
      } else {
        Alert.alert(
          "Credenciales incorrectas",
          "Por favor verifica tu usuario y contraseña",
          [{ text: "Entendido" }]
        );
      }
    }, 1000);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Recuperar contraseña",
      "Contacta al administrador del sistema para restablecer tu contraseña.",
      [{ text: "Entendido" }]
    );
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
        </View>

        {/* Formulario de login */}
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.loginTitle}>Iniciar Sesión</Text>
            <Text style={styles.loginSubtitle}>
              Ingresa tus credenciales para continuar
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
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#88BBDC"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
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
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                autoComplete="password"
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
                <Ionicons name="refresh-outline" size={24} color="#000000" style={styles.loadingIcon} />
                <Text style={styles.buttonText}>Verificando...</Text>
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

          {/* Información de credenciales de prueba */}
          <View style={styles.demoCredentials}>
            <Text style={styles.demoTitle}>Credenciales de prueba:</Text>
            <Text style={styles.demoText}>Admin: admin@mantilla.com / admin123</Text>
            <Text style={styles.demoText}>Técnico: tecnico@mantilla.com / tecnico123</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Electrónica Mantilla. Todos los derechos reservados.
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
  loadingIcon: {
    marginRight: 10,
    transform: [{ rotate: "0deg" }],
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