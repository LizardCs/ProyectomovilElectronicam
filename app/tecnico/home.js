import { FlatList, Text, View } from "react-native";

const asignados = [
  { id: "N-101", descripcion: "Televisor Samsung no enciende" },
  { id: "N-102", descripcion: "Lavadora LG hace ruido" },
];

export default function HomeTecnico() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 26, fontWeight: "bold" }}>
        Trabajos Asignados
      </Text>

      <FlatList
        style={{ marginTop: 20 }}
        data={asignados}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#eee",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{item.id}</Text>
            <Text>{item.descripcion}</Text>
          </View>
        )}
      />
    </View>
  );
}
