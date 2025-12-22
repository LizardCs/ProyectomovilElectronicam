<?php
// 1. CONFIGURACIÓN DE ERRORES (Silenciar HTML, activar logs)
ini_set('display_errors', 0); // No mostrar errores como HTML
ini_set('log_errors', 1);     // Guardar errores en el log de XAMPP
error_reporting(E_ALL);

// 2. HEADERS CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Manejo de preflight CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. INICIAR BUFFER (Para evitar que espacios en blanco rompan el JSON)
ob_start();

try {
    date_default_timezone_set('America/Guayaquil');
    include 'db.php';

    // Verificar si la conexión falló
    if ($conn->connect_error) {
        throw new Exception("Error de conexión a la base de datos");
    }

    // Inicializar variables
    $SERV_NUM = $SERV_DESCRIPCION = $SERV_CED_ENV = $SERV_NOM_ENV = $SERV_CED_REC = $SERV_NOM_REC = '';
    $SERV_EST = 0;
    $imagenBase64 = '';
    $SERV_FECH_ASIG = date('Y-m-d H:i:s');

    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    // --- CAPTURA DE DATOS ---
    if (strpos($contentType, 'application/json') !== false) {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        if ($data) {
            $SERV_NUM = $data['SERV_NUM'] ?? '';
            $SERV_DESCRIPCION = $data['SERV_DESCRIPCION'] ?? '';
            $SERV_CED_ENV = $data['SERV_CED_ENV'] ?? '';
            $SERV_NOM_ENV = $data['SERV_NOM_ENV'] ?? '';
            $SERV_CED_REC = $data['SERV_CED_REC'] ?? '';
            $SERV_NOM_REC = $data['SERV_NOM_REC'] ?? '';
            $SERV_EST = $data['SERV_EST'] ?? 0;
            $imagenBase64 = $data['SERV_IMG_ENV'] ?? '';
        }
    } 
    else {
        $SERV_NUM = $_POST['SERV_NUM'] ?? '';
        $SERV_DESCRIPCION = $_POST['SERV_DESCRIPCION'] ?? '';
        $SERV_CED_ENV = $_POST['SERV_CED_ENV'] ?? '';
        $SERV_NOM_ENV = $_POST['SERV_NOM_ENV'] ?? '';
        $SERV_CED_REC = $_POST['SERV_CED_REC'] ?? '';
        $SERV_NOM_REC = $_POST['SERV_NOM_REC'] ?? '';
        $SERV_EST = $_POST['SERV_EST'] ?? 0;

        if (isset($_FILES['SERV_IMG_ENV']) && $_FILES['SERV_IMG_ENV']['error'] === 0) {
            $imageData = file_get_contents($_FILES['SERV_IMG_ENV']['tmp_name']);
            $imagenBase64 = base64_encode($imageData);
        } else {
            $imagenBase64 = $_POST['SERV_IMG_ENV'] ?? '';
        }
    }

    // --- VALIDACIONES ---
    if (empty($SERV_NUM) || empty($SERV_CED_ENV) || empty($SERV_CED_REC)) {
        throw new Exception("Faltan campos obligatorios (Número, Emisor o Técnico)");
    }

    if (empty($imagenBase64)) {
        throw new Exception("La imagen es obligatoria para crear el servicio");
    }

    // Limpiar base64 si trae el prefijo data:image
    if (preg_match('/^data:image\/(\w+);base64,/', $imagenBase64, $type)) {
        $imagenBase64 = substr($imagenBase64, strpos($imagenBase64, ',') + 1);
    }

    // --- BASE DE DATOS ---
    $sql = "INSERT INTO serviciostecnicos 
            (SERV_NUM, SERV_DESCRIPCION, SERV_FECH_ASIG, SERV_CED_ENV, SERV_NOM_ENV, SERV_IMG_ENV, SERV_CED_REC, SERV_NOM_REC, SERV_EST) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar consulta: " . $conn->error);
    }

    $stmt->bind_param("ssssssssi", 
        $SERV_NUM, $SERV_DESCRIPCION, $SERV_FECH_ASIG, 
        $SERV_CED_ENV, $SERV_NOM_ENV, $imagenBase64, 
        $SERV_CED_REC, $SERV_NOM_REC, $SERV_EST
    );

    if ($stmt->execute()) {
        // Limpiar cualquier salida accidental (warnings) antes de enviar el JSON
        ob_clean(); 
        echo json_encode([
            "success" => true,
            "message" => "Servicio asignado correctamente",
            "id" => $stmt->insert_id
        ]);
    } else {
        throw new Exception("Error al insertar: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    // Si algo falla, limpiamos el buffer y enviamos el error en formato JSON
    ob_clean();
    http_response_code(200); // Mantenemos 200 para que la app maneje el success: false
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

ob_end_flush();
?>