import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar"; // <-- AGREGADO
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
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
import { SafeAreaView } from "react-native-safe-area-context"; // <-- CAMBIADO (Soluciona el Warning)
import Svg, { Path } from 'react-native-svg';

import { AuthService } from "../services/api";

const { width } = Dimensions.get('window');

export default function Login() {
    const router = useRouter();
    const [usuario, setUsuario] = useState("");
    const [clave, setClave] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        checkExistingSession();
    }, []);

    const checkExistingSession = async () => {
        try {
            const user = await AuthService.getStoredUser();
            if (user) {
                user.rol === 1 ? router.replace("/admin/home") : router.replace("/tecnico/home");
            }
        } catch (error) {
            console.log('Sin sesión previa');
        }
    };

    const handleLogin = async () => {
        if (!usuario || !clave) {
            Alert.alert("Campos incompletos", "Por favor ingresa tus credenciales.");
            return;
        }

        setIsLoading(true);
        Keyboard.dismiss();

        try {
            const response = await AuthService.login({ 
                usuario: usuario.trim(), 
                clave: clave.trim() 
            });
            
            if (response.success && response.user) {
                response.user.rol === 1 ? router.replace("/admin/home") : router.replace("/tecnico/home");
            } else {
                Alert.alert("Acceso Denegado", response.message || "Usuario o contraseña incorrectos.");
            }
        } catch (error) {
            console.error("❌ Error completo en login:", error);
            Alert.alert(
                "🔌 Error de conexión",
                "No se pudo conectar al servidor de Electrónica Mantilla.\n\n" +
                "Verifica que XAMPP esté encendido y que el dispositivo esté en la misma red WiFi."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestConnection = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/test.php`);
            const text = await response.text();
            Alert.alert("🔍 Test de conexión", "Respuesta del servidor: " + text.substring(0, 50));
        } catch (error) {
            Alert.alert("❌ Conexión fallida", "No hay respuesta del servidor local.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <LinearGradient 
                colors={['#0f172a', '#1e3a8a', '#1e40af']} 
                style={styles.container}
            >
                {/* Asegura que los iconos de la barra de estado sean blancos */}
                <StatusBar style="light" /> 

                <View style={StyleSheet.absoluteFill}>
                    <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <Path 
                            d="M0,40 C30,35 70,10 100,0" 
                            stroke="#fde68a" 
                            strokeWidth="0.5" 
                            fill="none" 
                            opacity="0.2"
                        />
                    </Svg>
                </View>

                {/* Usamos SafeAreaView para evitar que el logo choque con el notch */}
                <SafeAreaView style={{ flex: 1 }}>
                    <KeyboardAvoidingView 
                        style={{ flex: 1 }}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                    >
                        <View style={styles.innerContainer}>
                            
                            <View style={styles.header}>
                                <View style={styles.brandContainer}>
                                    <Text style={styles.brandTitle}>ELECTRÓNICA</Text>
                                    <Text style={styles.brandName}>MANTILLA</Text>
                                    <View style={styles.brandDivider} />
                                </View>
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.loginTitle}>Gestión de Servicios</Text>
                                <Text style={styles.loginSubtitle}>Bienvenido</Text>

                                <View style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={20} color="#1e40af" style={styles.icon} />
                                    <TextInput
                                        placeholder="Usuario"
                                        placeholderTextColor="#94a3b8"
                                        value={usuario}
                                        onChangeText={setUsuario}
                                        style={styles.input}
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#1e40af" style={styles.icon} />
                                    <TextInput
                                        placeholder="Contraseña"
                                        placeholderTextColor="#94a3b8"
                                        secureTextEntry
                                        value={clave}
                                        onChangeText={setClave}
                                        style={styles.input}
                                    />
                                </View>

                                <TouchableOpacity 
                                    onPress={handleLogin} 
                                    style={[styles.button, isLoading && styles.buttonDisabled]}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#1e3a8a" />
                                    ) : (
                                        <>
                                            <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
                                            <Ionicons name="arrow-forward" size={20} color="#1e3a8a" />
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => Alert.alert("Soporte", "Contacte al administrador para restablecer su clave.")}>
                                    <Text style={styles.forgotText}>¿Olvidó sus credenciales?</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleTestConnection} style={{ marginTop: 15 }}>
                                    <Text style={{ textAlign: 'center', color: '#cbd5e1', fontSize: 10 }}>Acceso de Soporte</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>© 2025 ELECTRÓNICA MANTILLA</Text>
                                <Text style={styles.footerSub}>SISTEMA DE GESTIÓN CORPORATIVO</Text>
                            </View>

                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    innerContainer: { flex: 1, paddingHorizontal: 30, justifyContent: "center" },
    header: { alignItems: "center", marginBottom: 50 },
    brandContainer: { alignItems: "center" },
    brandTitle: { color: "white", fontSize: 16, fontWeight: "300", letterSpacing: 8, marginBottom: 5 },
    brandName: { color: "#fde68a", fontSize: 38, fontWeight: "900", letterSpacing: 2, textTransform: "uppercase" },
    brandDivider: { width: 40, height: 3, backgroundColor: "#fde68a", marginTop: 10, borderRadius: 2 },
    formCard: { backgroundColor: "white", borderRadius: 30, padding: 30, elevation: 10, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 20 },
    loginTitle: { fontSize: 22, fontWeight: "800", color: "#1e3a8a", textAlign: "center" },
    loginSubtitle: { fontSize: 11, color: "#64748b", textAlign: "center", marginBottom: 25, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: "#e2e8f0" },
    icon: { marginRight: 10 },
    input: { flex: 1, paddingVertical: 14, color: "#1e293b", fontSize: 15 },
    button: { flexDirection: "row", backgroundColor: "#fde68a", borderRadius: 12, paddingVertical: 16, justifyContent: "center", alignItems: "center", marginTop: 10, gap: 10 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: "#1e3a8a", fontSize: 14, fontWeight: "800" },
    forgotText: { textAlign: "center", color: "#1e40af", fontSize: 12, fontWeight: "600", marginTop: 20 },
    footer: { position: "absolute", bottom: 30, left: 0, right: 0, alignItems: "center" },
    footerText: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: "bold", letterSpacing: 1 },
    footerSub: { color: "rgba(255,255,255,0.3)", fontSize: 8, marginTop: 2 }
});