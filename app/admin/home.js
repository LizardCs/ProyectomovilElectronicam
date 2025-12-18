import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function HomeAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("servicios");
  const [user, setUser] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Animaciones de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadUser();
    startAnimations();
  }, []);

  // Recargar datos cada vez que la pantalla gane el foco
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [activeTab])
  );

  const startAnimations = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  };

  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('@user_data');
      if (userJson) {
        setUser(JSON.parse(userJson));
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  };

  const fetchData = async () => {
    if (activeTab === "servicios") {
      await fetchServicios();
    } else {
      await fetchUsuarios();
    }
  };

  const fetchServicios = async () => {
    try {
      const response = await fetch('http://192.168.110.167/api-expo/obtener-servicios.php');
      const data = await response.json();
      if (data.success) setServicios(data.servicios);
    } catch (error) {
      console.error("Error obteniendo servicios:", error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('http://192.168.110.167/api-expo/obtener-usuarios.php');
      const data = await response.json();
      if (data.success) setUsuarios(data.usuarios);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [activeTab]);

  const handleLogout = async () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, salir",
        onPress: async () => {
          await AsyncStorage.removeItem('@user_data');
          router.replace('/');
        }
      }
    ]);
  };

  // --- LÓGICA DE NAVEGACIÓN ---
  const handleAddAction = () => {
    if (activeTab === "servicios") {
      router.push("/admin/crear-servicio");
    } else {
      router.push("/admin/crear-usuario");
    }
  };

  const handleVerDetallesServicio = (servicio) => {
    router.push({
      pathname: "/admin/detalle-servicioadmin",
      params: { servicio: JSON.stringify(servicio) }
    });
  };

  // --- HELPERS VISUALES ---
  const getEstadoColor = (estadoNum) => {
    return parseInt(estadoNum) === 1 ? "#34C759" : "#FF9500";
  };

  const getRolInfo = (item) => {
    if (item.origen === 'WEB') return { texto: "ACCESO WEB", color: "#5856D6" };
    if (parseInt(item.rol) === 1) return { texto: "ADMIN MÓVIL", color: "#007AFF" };
    return { texto: "TÉCNICO", color: "#34C759" };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#001C38" barStyle="light-content" />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcome}>Panel Central</Text>
            {user && (
              <Text style={styles.userInfo}>{user.nombre_completo || user.nombre}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Stats Cards (Basadas en servicios) */}
      <Animated.View style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.statCard}>
          <Ionicons name="layers" size={24} color="#007AFF" />
          <Text style={styles.statNumber}>{activeTab === "servicios" ? servicios.length : usuarios.length}</Text>
          <Text style={styles.statLabel}>{activeTab === "servicios" ? "Servicios" : "Usuarios"}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#FF9500" />
          <Text style={styles.statNumber}>{servicios.filter(s => parseInt(s.SERV_EST) === 0).length}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#34C759" />
          <Text style={styles.statNumber}>{servicios.filter(s => parseInt(s.SERV_EST) === 1).length}</Text>
          <Text style={styles.statLabel}>Listos</Text>
        </View>
      </Animated.View>

      {/* Tabs Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "servicios" && styles.activeTab]}
          onPress={() => setActiveTab("servicios")}
        >
          <Ionicons name="construct" size={20} color={activeTab === "servicios" ? "#007AFF" : "#8E8E93"} />
          <Text style={[styles.tabText, activeTab === "servicios" && styles.activeTabText]}>Servicios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "usuarios" && styles.activeTab]}
          onPress={() => setActiveTab("usuarios")}
        >
          <Ionicons name="people" size={20} color={activeTab === "usuarios" ? "#007AFF" : "#8E8E93"} />
          <Text style={[styles.tabText, activeTab === "usuarios" && styles.activeTabText]}>Usuarios</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView
        style={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeTab === "servicios" ? "Asignaciones" : "Personal Registrado"}
            </Text>
          </View>

          {activeTab === "servicios" ? (
            // LISTA DE SERVICIOS
            servicios.length === 0 ? (
              <Text style={styles.emptyText}>No hay servicios registrados.</Text>
            ) : (
              servicios.map((s) => (
                <View key={s.SERV_ID} style={styles.tareaCard}>
                  <View style={styles.tareaHeader}>
                    <View style={styles.tareaIdContainer}><Text style={styles.tareaId}>#{s.SERV_NUM}</Text></View>
                    <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(s.SERV_EST) }]}>
                      <Text style={styles.estadoText}>{parseInt(s.SERV_EST) === 1 ? "COMPLETADO" : "PENDIENTE"}</Text>
                    </View>
                  </View>
                  <Text style={styles.tareaDescripcion} numberOfLines={2}>{s.SERV_DESCRIPCION || "Sin descripción"}</Text>
                  <View style={styles.tareaFooter}>
                    <View style={styles.tecnicoInfo}>
                      <Ionicons name="person-circle-outline" size={18} color="#666" />
                      <Text style={styles.tecnicoNombre}>{s.SERV_NOM_REC || "Por asignar"}</Text>
                    </View>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleVerDetallesServicio(s)}>
                      <Text style={styles.actionText}>Ver</Text>
                      <Ionicons name="chevron-forward" size={16} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )
          ) : (
            // LISTA DE USUARIOS
            usuarios.length === 0 ? (
              <Text style={styles.emptyText}>No hay usuarios registrados.</Text>
            ) : (
              usuarios.map((u) => {
                const rol = getRolInfo(u);
                return (
                  <View key={`${u.origen}-${u.id}`} style={styles.tareaCard}>
                    <View style={styles.tareaHeader}>
                      <View style={styles.tareaIdContainer}><Text style={styles.tareaId}>{u.usuario}</Text></View>
                      <View style={[styles.estadoBadge, { backgroundColor: rol.color }]}>
                        <Text style={styles.estadoText}>{rol.texto}</Text>
                      </View>
                    </View>
                    <Text style={styles.tareaDescripcion}>{u.nombre} {u.apellido}</Text>
                    <View style={styles.tareaFooter}>
                      <View style={styles.tecnicoInfo}>
                        <Ionicons name="card-outline" size={18} color="#666" />
                        <Text style={styles.tecnicoNombre}>ID: {u.cedula}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleGestionarUsuario(u)}
                      >
                        <Text style={styles.actionText}>Gestionar</Text>
                        <Ionicons name="settings-outline" size={16} color="#007AFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )
          )}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={handleAddAction}>
        <Ionicons name="add" size={35} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  header: {
    backgroundColor: "#001C38",
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
  },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  welcome: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  userInfo: { fontSize: 16, color: "#88BBDC", marginTop: 2 },
  logoutButton: { backgroundColor: "rgba(255, 255, 255, 0.15)", padding: 10, borderRadius: 12 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginTop: -35 },
  statCard: { backgroundColor: "white", alignItems: "center", padding: 15, borderRadius: 20, width: "30%", elevation: 4 },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#1C1C1E", marginTop: 5 },
  statLabel: { fontSize: 11, color: "#666", marginTop: 2 },
  tabContainer: { flexDirection: "row", backgroundColor: "white", margin: 20, borderRadius: 15, padding: 5, elevation: 3 },
  tabButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12 },
  activeTab: { backgroundColor: "#F2F2F7" },
  tabText: { fontSize: 15, color: "#8E8E93", marginLeft: 8, fontWeight: "500" },
  activeTabText: { color: "#007AFF", fontWeight: "bold" },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  sectionHeader: { marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#1C1C1E" },
  tareaCard: { backgroundColor: "white", borderRadius: 18, padding: 20, marginBottom: 15, elevation: 2 },
  tareaHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  tareaIdContainer: { backgroundColor: "#F2F2F7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tareaId: { fontSize: 14, fontWeight: "bold", color: "#001C38" },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  estadoText: { fontSize: 10, color: "white", fontWeight: "bold" },
  tareaDescripcion: { fontSize: 16, color: "#3A3A3C", marginBottom: 15, lineHeight: 22 },
  tareaFooter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#F2F2F7", paddingTop: 15 },
  tecnicoInfo: { flexDirection: "row", alignItems: "center" },
  tecnicoNombre: { fontSize: 14, color: "#666", marginLeft: 6 },
  actionButton: { flexDirection: "row", alignItems: "center" },
  actionText: { fontSize: 14, color: "#007AFF", marginRight: 4, fontWeight: "bold" },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: "#007AFF",
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#007AFF",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  }
});