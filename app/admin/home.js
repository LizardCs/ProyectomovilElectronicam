import { Text, View } from "react-native";

export default function HomeAdmin() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 26, fontWeight: "bold" }}>
        Panel de Administrador
      </Text>

      <Text style={{ marginTop: 10 }}>
        Aquí podrás asignar números a técnicos.
      </Text>
    </View>
  );
}
