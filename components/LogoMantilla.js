import Svg, { Rect, Text } from "react-native-svg";

export default function LogoMantilla() {
  return (
    <Svg width="260" height="120">
      <Rect width="260" height="120" rx="18" fill="#003B66" />

      <Text
        x="50%"
        y="42%"
        fill="#FFFFFF"
        fontSize="26"
        fontWeight="bold"
        textAnchor="middle"
      >
        ELECTRÓNICA
      </Text>

      <Text
        x="50%"
        y="72%"
        fill="#FFD700"
        fontSize="28"
        fontWeight="bold"
        textAnchor="middle"
      >
        MANTILLA
      </Text>
    </Svg>
  );
}
