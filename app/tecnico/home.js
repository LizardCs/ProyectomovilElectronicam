import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- NUEVAS IMPORTACIONES MODULARES ---
import { obtenerServiciosTecnico } from "../../services/obtenerServiciosTecnico";
import { SessionService } from "../../services/session";

export default function HomeTecnico() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [filtroActivo, setFiltroActivo] = useState("total");
  const [busqueda, setBusqueda] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUser();
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  // Recarga automática cuando la pantalla vuelve a tener el foco
  useFocusEffect(
    useCallback(() => {
      if (user) {
        const ced = user.cedula;
        fetchServicios(ced);
      }
    }, [user])
  );

  const loadUser = async () => {
    try {
      const userData = await SessionService.getStoredUser();
      if (userData) {
        setUser(userData);
        fetchServicios(userData.cedula);
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  };

  // --- LLAMADA AL SERVICIO obtenerServiciosTecnico.js ---
  const fetchServicios = async (cedulaTecnico) => {
    const ced = cedulaTecnico || user?.cedula;
    if (!ced) return;

    try {
      const res = await obtenerServiciosTecnico(ced);
      if (res.success) {
        setServicios(res.servicios || []);
      } else {
        setServicios([]);
      }
    } catch (error) {
      console.error("Error obteniendo servicios:", error);
      Alert.alert("Error", "No se pudo sincronizar con la nube.");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const ced = user?.cedula;
    await fetchServicios(ced);
    setRefreshing(false);
  }, [user]);

  const handleLogout = async () => {
    Alert.alert("Cerrar Sesión", "¿Desea salir del sistema?", [
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

  const handleVerDetalles = (servicio) => {
    router.push({
      pathname: "/tecnico/detalle-serviciotecnico",
      params: { servicio: JSON.stringify(servicio) }
    });
  };

  const obtenerDatosFiltrados = () => {
    if (!Array.isArray(servicios)) return [];
    return servicios.filter(s => {
      const cumpleFiltro =
        filtroActivo === "total" ? true :
        filtroActivo === "pendientes" ? parseInt(s.SERV_EST) === 0 :
        filtroActivo === "listos" ? parseInt(s.SERV_EST) === 1 : true;

      const cumpleBusqueda = s.SERV_NUM?.toString().toLowerCase().includes(busqueda.toLowerCase());
      return cumpleFiltro && cumpleBusqueda;
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" backgroundColor="#001C38" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcome}>Panel Técnico</Text>
            <Text style={styles.userInfo}> 
              Hola, {(user?.nombre_completo || "Técnico").trim().split(" ")[0]}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats / Filtros */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={[styles.statCard, filtroActivo === "total" && styles.statCardActive]}
          onPress={() => setFiltroActivo("total")}
        >
          <Ionicons name="list" size={20} color={filtroActivo === "total" ? "#FFF" : "#007AFF"} />
          <Text style={[styles.statNumber, filtroActivo === "total" && { color: '#FFF' }]}>{servicios.length}</Text>
          <Text style={[styles.statLabel, filtroActivo === "total" && { color: '#FFF' }]}>Total</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, filtroActivo === "pendientes" && styles.statCardActive]}
          onPress={() => setFiltroActivo("pendientes")}
        >
          <Ionicons name="alert-circle" size={20} color={filtroActivo === "pendientes" ? "#FFF" : "#FF9500"} />
          <Text style={[styles.statNumber, filtroActivo === "pendientes" && { color: '#FFF' }]}>
            {servicios.filter(s => parseInt(s.SERV_EST) === 0).length}
          </Text>
          <Text style={[styles.statLabel, filtroActivo === "pendientes" && { color: '#FFF' }]}>Por hacer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, filtroActivo === "listos" && styles.statCardActive]}
          onPress={() => setFiltroActivo("listos")}
        >
          <Ionicons name="checkmark-circle" size={20} color={filtroActivo === "listos" ? "#FFF" : "#34C759"} />
          <Text style={[styles.statNumber, filtroActivo === "listos" && { color: '#FFF' }]}>
            {servicios.filter(s => parseInt(s.SERV_EST) === 1).length}
          </Text>
          <Text style={[styles.statLabel, filtroActivo === "listos" && { color: '#FFF' }]}>Listos</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={{ marginLeft: 15 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por número de servicio..."
          value={busqueda}
          onChangeText={setBusqueda}
          keyboardType="numeric"
        />
        {busqueda !== "" && (
          <TouchableOpacity onPress={() => setBusqueda("")}>
            <Ionicons name="close-circle" size={20} color="#CCC" style={{ marginRight: 15 }} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {obtenerDatosFiltrados().length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="construct-outline" size={50} color="#CCC" />
              <Text style={styles.emptyText}>No tienes servicios asignados aún.</Text>
            </View>
          ) : (
            obtenerDatosFiltrados().map((s) => (
              <View key={s.SERV_ID} style={styles.tareaCard}>
                <View style={styles.tareaHeader}>
                  <View style={styles.tareaIdContainer}><Text style={styles.tareaId}>ORDEN #{s.SERV_NUM}</Text></View>
                  <View style={[styles.estadoBadge, { backgroundColor: parseInt(s.SERV_EST) === 1 ? "#34C759" : "#FF9500" }]}>
                    <Text style={styles.estadoText}>{parseInt(s.SERV_EST) === 1 ? "LISTO" : "PENDIENTE"}</Text>
                  </View>
                </View>

                <Text style={styles.tareaDescripcion} numberOfLines={2}>{s.SERV_DESCRIPCION || "Sin detalles adicionales."}</Text>

                <View style={styles.tareaFooter}>
                  <View style={styles.assignerInfo}>
                    <Ionicons name="person-outline" size={14} color="#666" />
                    <Text style={styles.assignerName}>De: {s.SERV_NOM_ENV}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.verBtn}
                    onPress={() => handleVerDetalles(s)}
                  >
                    <Text style={styles.verBtnText}>Gestionar</Text>
                    <Ionicons name="chevron-forward" size={16} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  header: { backgroundColor: "#001C38", paddingTop: 10, paddingBottom: 50, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  welcome: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  userInfo: { fontSize: 16, color: "#88BBDC" },
  logoutButton: { backgroundColor: "rgba(255,255,255,0.15)", padding: 10, borderRadius: 12 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginTop: -35 },
  statCard: { backgroundColor: "white", alignItems: "center", padding: 15, borderRadius: 20, width: "30%", elevation: 4 },
  statCardActive: { backgroundColor: "#001C38", borderColor: '#007AFF', borderWidth: 1 },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#1C1C1E" },
  statLabel: { fontSize: 11, color: "#666" },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', margin: 20, borderRadius: 12, borderWidth: 1, borderColor: '#DDD', height: 50 },
  searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 16 },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  tareaCard: { backgroundColor: "white", borderRadius: 18, padding: 18, marginBottom: 15, elevation: 2 },
  tareaHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  tareaIdContainer: { backgroundColor: "#F2F2F7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tareaId: { fontWeight: "bold", color: "#001C38", fontSize: 12 },
  estadoBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  estadoText: { fontSize: 10, color: "white", fontWeight: "bold" },
  tareaDescripcion: { fontSize: 15, color: "#3A3A3C", marginBottom: 15, lineHeight: 20 },
  tareaFooter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#F2F2F7", paddingTop: 12, alignItems: 'center' },
  assignerInfo: { flexDirection: 'row', alignItems: 'center' },
  assignerName: { fontSize: 11, color: '#666', marginLeft: 5 },
  verBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  verBtnText: { color: '#007AFF', fontWeight: 'bold', marginRight: 2, fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 10 }
});