import { Ionicons } from "@expo/vector-icons";
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
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// --- NUEVAS IMPORTACIONES MODULARES ---
import { obtenerServicios } from "../../services/obtenerServicios";
import { obtenerUsuarios } from "../../services/obtenerUsuarios";
import { SessionService } from "../../services/session";

export default function HomeAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("servicios");
  const [user, setUser] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // --- ESTADOS PARA FILTROS Y BÚSQUEDA ---
  const [filtroActivo, setFiltroActivo] = useState("total");
  const [busqueda, setBusqueda] = useState("");

  // Animaciones de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadUser();
    startAnimations();
  }, []);

  // Recargar datos cada vez que la pantalla gane el foco o cambie el tab
  useFocusEffect(
    useCallback(() => {
      fetchData();
      setFiltroActivo("total");
      setBusqueda("");
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
    const userData = await SessionService.getStoredUser();
    if (userData) {
      setUser(userData);
    } else {
      router.replace('/');
    }
  };

  const fetchData = async () => {
    if (activeTab === "servicios") {
      await fetchServicios();
    } else {
      await fetchUsuarios();
    }
  };

  // --- LLAMADA AL SERVICIO obtenerServicios.js ---
  const fetchServicios = async () => {
    try {
      const res = await obtenerServicios();
      if (res.success) setServicios(res.servicios);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    }
  };

  // --- LLAMADA AL SERVICIO obtenerUsuarios.js ---
  const fetchUsuarios = async () => {
    try {
      const res = await obtenerUsuarios();
      if (res.success) setUsuarios(res.usuarios);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
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
          await SessionService.logout();
          router.replace('/');
        }
      }
    ]);
  };

  // --- LÓGICA DE FILTRADO DINÁMICO (Sin cambios, compatible con Supabase) ---
  const obtenerDatosFiltrados = () => {
    const query = busqueda.toLowerCase().trim();

    if (activeTab === "servicios") {
      return servicios.filter(s => {
        const cumpleFiltro =
          filtroActivo === "total" ? true :
            filtroActivo === "pendientes" ? parseInt(s.SERV_EST) === 0 :
              filtroActivo === "listos" ? parseInt(s.SERV_EST) === 1 : true;

        const cumpleBusqueda = s.SERV_NUM.toString().toLowerCase().includes(query);
        return cumpleFiltro && cumpleBusqueda;
      });
    } else {
      return usuarios.filter(u => {
        const cumpleFiltro =
          filtroActivo === "total" ? true :
            filtroActivo === "movil" ? u.origen === "MOVIL" :
              filtroActivo === "web" ? u.origen === "WEB" : true;

        const cumpleBusqueda =
          (u.nombre || "").toLowerCase().includes(query) ||
          (u.apellido || "").toLowerCase().includes(query) ||
          (u.cedula || "").toString().includes(query) ||
          (u.usuario || "").toLowerCase().includes(query);

        return cumpleFiltro && cumpleBusqueda;
      });
    }
  };

  const handleAddAction = () => {
    activeTab === "servicios" ? router.push("/admin/crear-servicio") : router.push("/admin/crear-usuario");
  };

  const handleVerDetallesServicio = (servicio) => {
    router.push({
      pathname: "/admin/detalle-servicioadmin",
      params: { servicio: JSON.stringify(servicio) }
    });
  };

  const handleGestionarUsuario = (usuario) => {
    router.push({
      pathname: "/admin/detalle-usuario",
      params: { user: JSON.stringify(usuario) }
    });
  };

  const getRolInfo = (item) => {
    if (item.origen === 'WEB') return { texto: "REPORTES WEB", color: "#5856D6" };
    if (parseInt(item.rol) === 1) return { texto: "ADMIN", color: "#007AFF" };
    return { texto: "TÉCNICO", color: "#34C759" };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#001C38" barStyle="light-content" />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcome}>Gestionamiento</Text>
            {user && (
              <Text style={styles.userInfo}>
                Bienvenido {(user.nombre_completo || user.nombre || "").trim().split(" ")[0]}
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Stats Cards como FILTROS */}
      <Animated.View style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity
          style={[styles.statCard, filtroActivo === "total" && styles.statCardActive]}
          onPress={() => setFiltroActivo("total")}
        >
          <Ionicons name="layers" size={24} color={filtroActivo === "total" ? "#FFF" : "#007AFF"} />
          <Text style={[styles.statNumber, filtroActivo === "total" && { color: '#FFF' }]}>
            {activeTab === "servicios" ? servicios.length : usuarios.length}
          </Text>
          <Text style={[styles.statLabel, filtroActivo === "total" && { color: '#FFF' }]}>Total</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, (filtroActivo === "pendientes" || filtroActivo === "movil") && styles.statCardActive]}
          onPress={() => setFiltroActivo(activeTab === "servicios" ? "pendientes" : "movil")}
        >
          <Ionicons
            name={activeTab === "servicios" ? "time" : "phone-portrait"}
            size={24}
            color={(filtroActivo === "pendientes" || filtroActivo === "movil") ? "#FFF" : "#FF9500"}
          />
          <Text style={[styles.statNumber, (filtroActivo === "pendientes" || filtroActivo === "movil") && { color: '#FFF' }]}>
            {activeTab === "servicios"
              ? servicios.filter(s => parseInt(s.SERV_EST) === 0).length
              : usuarios.filter(u => u.origen === "MOVIL").length}
          </Text>
          <Text style={[styles.statLabel, (filtroActivo === "pendientes" || filtroActivo === "movil") && { color: '#FFF' }]}>
            {activeTab === "servicios" ? "Pendientes" : "Móvil"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, (filtroActivo === "listos" || filtroActivo === "web") && styles.statCardActive]}
          onPress={() => setFiltroActivo(activeTab === "servicios" ? "listos" : "web")}
        >
          <Ionicons
            name={activeTab === "servicios" ? "checkmark-circle" : "desktop"}
            size={24}
            color={(filtroActivo === "listos" || filtroActivo === "web") ? "#FFF" : "#34C759"}
          />
          <Text style={[styles.statNumber, (filtroActivo === "listos" || filtroActivo === "web") && { color: '#FFF' }]}>
            {activeTab === "servicios"
              ? servicios.filter(s => parseInt(s.SERV_EST) === 1).length
              : usuarios.filter(u => u.origen === "WEB").length}
          </Text>
          <Text style={[styles.statLabel, (filtroActivo === "listos" || filtroActivo === "web") && { color: '#FFF' }]}>
            {activeTab === "servicios" ? "Listos" : "Web"}
          </Text>
        </TouchableOpacity>
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

      {/* BUSCADOR DINÁMICO */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={{ marginLeft: 15 }} />
        <TextInput
          style={styles.searchInput}
          placeholder={activeTab === "servicios" ? "Buscar por N° de servicio..." : "Buscar por nombre, cédula o usuario..."}
          value={busqueda}
          onChangeText={setBusqueda}
          keyboardType={activeTab === "servicios" ? "numeric" : "default"}
          autoCapitalize="none"
        />
        {busqueda !== "" && (
          <TouchableOpacity onPress={() => setBusqueda("")}>
            <Ionicons name="close-circle" size={20} color="#CCC" style={{ marginRight: 15 }} />
          </TouchableOpacity>
        )}
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
            {filtroActivo !== "total" && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterText}>Filtro: {filtroActivo.toUpperCase()}</Text>
              </View>
            )}
          </View>

          {obtenerDatosFiltrados().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No se encontraron resultados.</Text>
            </View>
          ) : (
            obtenerDatosFiltrados().map((item) => (
              <View key={item.SERV_ID || `${item.origen}-${item.id}`} style={styles.tareaCard}>
                <View style={styles.tareaHeader}>
                  <View style={styles.tareaIdContainer}>
                    <Text style={styles.tareaId}>
                      {activeTab === "servicios" ? `#${item.SERV_NUM}` : item.usuario}
                    </Text>
                  </View>
                  <View style={[
                    styles.estadoBadge,
                    { backgroundColor: activeTab === "servicios" ? (parseInt(item.SERV_EST) === 1 ? "#34C759" : "#FF9500") : getRolInfo(item).color }
                  ]}>
                    <Text style={styles.estadoText}>
                      {activeTab === "servicios" ? (parseInt(item.SERV_EST) === 1 ? "COMPLETADO" : "PENDIENTE") : getRolInfo(item).texto}
                    </Text>
                  </View>
                </View>

                <Text style={styles.tareaDescripcion} numberOfLines={2}>
                  {activeTab === "servicios" ? (item.SERV_DESCRIPCION || "Sin descripción") : `${item.nombre} ${item.apellido}`}
                </Text>

                <View style={styles.tareaFooter}>
                  <View style={styles.tecnicoInfo}>
                    <Ionicons name={activeTab === "servicios" ? "person-circle-outline" : "card-outline"} size={18} color="#666" />
                    <Text style={styles.tecnicoNombre}>
                      {activeTab === "servicios" ? (item.SERV_NOM_REC || "Por asignar") : `CI: ${item.cedula}`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => activeTab === "servicios" ? handleVerDetallesServicio(item) : handleGestionarUsuario(item)}
                  >
                    <Text style={styles.actionText}>{activeTab === "servicios" ? "Ver / Editar" : "Gestionar"}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={handleAddAction}>
        <Ionicons name="add" size={35} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  header: { backgroundColor: "#001C38", paddingTop: 50, paddingBottom: 50, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 10 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  welcome: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  userInfo: { fontSize: 16, color: "#88BBDC", marginTop: 2 },
  logoutButton: { backgroundColor: "rgba(255, 255, 255, 0.15)", padding: 10, borderRadius: 12 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginTop: -35 },
  statCard: { backgroundColor: "white", alignItems: "center", padding: 15, borderRadius: 20, width: "30%", elevation: 4 },
  statCardActive: { backgroundColor: "#001C38", transform: [{ scale: 1.05 }], borderColor: '#007AFF', borderWidth: 1 },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#1C1C1E", marginTop: 5 },
  statLabel: { fontSize: 11, color: "#666", marginTop: 2 },
  tabContainer: { flexDirection: "row", backgroundColor: "white", margin: 20, borderRadius: 15, padding: 5, elevation: 3 },
  tabButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12 },
  activeTab: { backgroundColor: "#F2F2F7" },
  tabText: { fontSize: 15, color: "#8E8E93", marginLeft: 8, fontWeight: "500" },
  activeTabText: { color: "#007AFF", fontWeight: "bold" },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#DDD', marginBottom: 15, height: 50 },
  searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 16, color: '#000' },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1C1C1E" },
  activeFilterBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  activeFilterText: { fontSize: 10, color: '#007AFF', fontWeight: 'bold' },
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
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 10, fontSize: 16 },
  floatingButton: { position: "absolute", bottom: 30, right: 25, backgroundColor: "#007AFF", width: 65, height: 65, borderRadius: 33, justifyContent: "center", alignItems: "center", elevation: 8, shadowColor: "#007AFF", shadowOpacity: 0.4, shadowRadius: 10 }
});