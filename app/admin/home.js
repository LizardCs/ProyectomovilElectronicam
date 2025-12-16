import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
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
  // CAMBIO: Inicializamos en "servicios" en lugar de "tareas"
  const [activeTab, setActiveTab] = useState("servicios");
  const [user, setUser] = useState(null);

  // CAMBIO: Renombrado de 'tareas' a 'servicios'
  const [servicios, setServicios] = useState([
    { id: "N-101", descripcion: "Televisor Samsung no enciende", tecnico: "Juan Pérez", estado: "pendiente" },
    { id: "N-102", descripcion: "Lavadora LG hace ruido", tecnico: "Carlos López", estado: "en_proceso" },
    { id: "N-103", descripcion: "Refrigeradora Mabe no enfria", tecnico: "Ana García", estado: "completado" },
    { id: "N-104", descripcion: "Microondas Philips no calienta", tecnico: "Sin asignar", estado: "pendiente" },
  ]);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadUser();

    // Animación de entrada
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
  }, []);

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

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@user_data');
    router.replace('/');
  };

  const handleAddService = () => {
    // Navegar a la pantalla de crear servicio
    router.push("/admin/crear-servicio");
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente": return "#ff9500";
      case "en_proceso": return "#007AFF";
      case "completado": return "#34C759";
      default: return "#8E8E93";
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case "pendiente": return "Pendiente";
      case "en_proceso": return "En Proceso";
      case "completado": return "Completado";
      default: return estado;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#001C38" barStyle="light-content" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcome}>Administración </Text>
            {user && (
              <Text style={styles.userInfo}>
                {user.nombre_completo || user.nombre}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Stats Cards */}
      <Animated.View
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.statCard}>
          <Ionicons name="briefcase" size={28} color="#007AFF" />
          <Text style={styles.statNumber}>{servicios.length}</Text>
          <Text style={styles.statLabel}>Total Servicios</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={28} color="#FF9500" />
          <Text style={styles.statNumber}>
            {servicios.filter(t => t.estado === "pendiente").length}
          </Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={28} color="#34C759" />
          <Text style={styles.statNumber}>
            {servicios.filter(t => t.estado === "completado").length}
          </Text>
          <Text style={styles.statLabel}>Completados</Text>
        </View>
      </Animated.View>

      {/* Tabs Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "servicios" && styles.activeTab]}
          onPress={() => setActiveTab("servicios")}
        >
          {/* Cambié el ícono a briefcase para servicios */}
          <Ionicons
            name={activeTab === "servicios" ? "briefcase" : "briefcase-outline"}
            size={24}
            color={activeTab === "servicios" ? "#007AFF" : "#8E8E93"}
          />
          <Text style={[
            styles.tabText,
            activeTab === "servicios" && styles.activeTabText
          ]}>
            Servicios
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "usuarios" && styles.activeTab]}
          onPress={() => setActiveTab("usuarios")}
        >
          <Ionicons
            name={activeTab === "usuarios" ? "people" : "people-outline"}
            size={24}
            color={activeTab === "usuarios" ? "#007AFF" : "#8E8E93"}
          />
          <Text style={[
            styles.tabText,
            activeTab === "usuarios" && styles.activeTabText
          ]}>
            Usuarios
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.contentContainer}>
        {activeTab === "servicios" ? (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            {/* Servicios Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Servicios Asignados</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddService}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={30} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {/* Lista de Servicios */}
            {servicios.map((servicio, index) => (
              <Animated.View
                key={servicio.id}
                style={[
                  styles.tareaCard,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 30],
                        outputRange: [0, index * 10]
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.tareaHeader}>
                  <View style={styles.tareaIdContainer}>
                    <Text style={styles.tareaId}>{servicio.id}</Text>
                  </View>
                  <View style={[
                    styles.estadoBadge,
                    { backgroundColor: getEstadoColor(servicio.estado) }
                  ]}>
                    <Text style={styles.estadoText}>
                      {getEstadoTexto(servicio.estado)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.tareaDescripcion}>
                  {servicio.descripcion}
                </Text>

                <View style={styles.tareaFooter}>
                  <View style={styles.tecnicoInfo}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text style={styles.tecnicoNombre}>
                      {servicio.tecnico}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>Ver Detalles</Text>
                    <Ionicons name="chevron-forward" size={16} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </Animated.View>
        ) : (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            {/* Usuarios Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gestión de Usuarios</Text>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="person-add" size={30} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {/* Placeholder para usuarios */}
            <View style={styles.placeholderContainer}>
              <Ionicons name="people" size={80} color="#E5E5EA" />
              <Text style={styles.placeholderTitle}>
                Gestión de Usuarios
              </Text>
              <Text style={styles.placeholderText}>
                Aquí podrás agregar, editar y eliminar usuarios del sistema.
              </Text>
              <Text style={styles.placeholderSubtext}>
                (Próximamente)
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Floating Action Button para agregar servicio */}
      {activeTab === "servicios" && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleAddService}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
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
    // CAMBIO: Aumenté el paddingBottom de 25 a 50 para dar más espacio
    paddingBottom: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Cambiado a center para mejor alineación vertical
  },
  headerTextContainer: {
    // CAMBIO: Contenedor extra si se necesita ajuste fino,
    // pero el paddingBottom del header hace la mayor parte del trabajo.
    marginBottom: 5,
  },
  welcome: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  userInfo: {
    fontSize: 16,
    color: "#88BBDC",
    // CAMBIO: Agregado un pequeño margen inferior extra por si acaso
    marginBottom: 5,
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    borderRadius: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    // CAMBIO: Ajustado de -25 a -35 para que suba, pero como el header es más alto,
    // se verá separado del texto.
    marginTop: -35,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "white",
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    width: "30%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: 'center', // Asegurar que el texto esté centrado
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#F2F2F7",
  },
  tabText: {
    fontSize: 16,
    color: "#8E8E93",
    marginLeft: 8,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  addButton: {
    padding: 5,
  },
  tareaCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tareaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tareaIdContainer: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tareaId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  estadoText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  tareaDescripcion: {
    fontSize: 16,
    color: "#3C3C43",
    lineHeight: 22,
    marginBottom: 15,
  },
  tareaFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    paddingTop: 15,
  },
  tecnicoInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  tecnicoNombre: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    color: "#007AFF",
    marginRight: 4,
    fontWeight: "500",
  },
  placeholderContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginTop: 20,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 10,
    fontStyle: "italic",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});