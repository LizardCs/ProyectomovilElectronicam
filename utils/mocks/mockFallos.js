// utils/mocks/mockFallos.js
export const MOCK_FALLOS = [
    {
        id: 1,
        fallo: "No enciende / No da señal",
        solucion: "Verificar fuente de poder, revisar voltajes de salida en la fuente, inspeccionar capacitor principal y diodos rectificadores. Posible reemplazo de placa fuente.",
    },
    {
        id: 2,
        fallo: "Pantalla con líneas o manchas",
        solucion: "Inspeccionar panel LCD/LED, verificar conexiones flex (T-Con), revisar si el daño es físico. Si es panel dañado, se requiere reemplazo de pantalla o evaluación de costo-beneficio.",
    },
    {
        id: 3,
        fallo: "No hay sonido / Audio distorsionado",
        solucion: "Revisar parlantes, tarjeta de audio, conectores. Verificar configuración de software. Posible reemplazo de parlantes o placa de audio.",
    },
    {
        id: 4,
        fallo: "Se apaga solo / Se reinicia",
        solucion: "Revisar fuente de poder, actualización de firmware, sensores de temperatura. Inspeccionar soldaduras frías en la placa principal (Main Board).",
    },
    {
        id: 5,
        fallo: "Puertos HDMI/USB no funcionan",
        solucion: "Inspeccionar puertos físicamente, revisar placa principal, verificar controlador de puertos. Posible reemplazo de Main Board o resoldadura de puertos.",
    },
];