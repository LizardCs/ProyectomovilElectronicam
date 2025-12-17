<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Manejo de preflight CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db.php';

// Inicializar variables (Agregamos SERV_DESCRIPCION)
$SERV_NUM = $SERV_CED_ENV = $SERV_NOM_ENV = $SERV_CED_REC = $SERV_NOM_REC = $SERV_DESCRIPCION = '';
$SERV_EST = 0;
$imagenBase64 = '';

// Determinar tipo de contenido
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

// 1. Si los datos llegan como JSON (Web)
if (strpos($contentType, 'application/json') !== false) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if ($data) {
        $SERV_NUM = $data['SERV_NUM'] ?? '';
        $SERV_DESCRIPCION = $data['SERV_DESCRIPCION'] ?? ''; // <--- NUEVO
        $SERV_CED_ENV = $data['SERV_CED_ENV'] ?? '';
        $SERV_NOM_ENV = $data['SERV_NOM_ENV'] ?? '';
        $SERV_CED_REC = $data['SERV_CED_REC'] ?? '';
        $SERV_NOM_REC = $data['SERV_NOM_REC'] ?? '';
        $SERV_EST = $data['SERV_EST'] ?? 0;
        $imagenBase64 = $data['SERV_IMG_ENV'] ?? '';
    }
} 
// 2. Si los datos llegan como FormData/Multipart (Móvil - Android/iOS)
else if (strpos($contentType, 'multipart/form-data') !== false || isset($_FILES['SERV_IMG_ENV'])) {
    $SERV_NUM = $_POST['SERV_NUM'] ?? '';
    $SERV_DESCRIPCION = $_POST['SERV_DESCRIPCION'] ?? ''; // <--- NUEVO
    $SERV_CED_ENV = $_POST['SERV_CED_ENV'] ?? '';
    $SERV_NOM_ENV = $_POST['SERV_NOM_ENV'] ?? '';
    $SERV_CED_REC = $_POST['SERV_CED_REC'] ?? '';
    $SERV_NOM_REC = $_POST['SERV_NOM_REC'] ?? '';
    $SERV_EST = $_POST['SERV_EST'] ?? 0;
    
    // Procesar imagen de FormData
    if (isset($_FILES['SERV_IMG_ENV']) && $_FILES['SERV_IMG_ENV']['error'] === 0) {
        $file = $_FILES['SERV_IMG_ENV'];
        $imageData = file_get_contents($file['tmp_name']);
        $imagenBase64 = base64_encode($imageData);
    }
}

// Validar datos requeridos
if (empty($SERV_NUM) || empty($SERV_CED_ENV) || empty($SERV_CED_REC)) {
    echo json_encode(["success" => false, "message" => "Faltan campos requeridos (Número, Asignador o Técnico)"]);
    exit();
}

// Validar imagen
if (empty($imagenBase64)) {
    echo json_encode(["success" => false, "message" => "La imagen del comprobante es obligatoria"]);
    exit();
}

// Si la imagen viene como data URL (data:image/...;base64,...), extraer solo base64
if (strpos($imagenBase64, 'data:image') === 0) {
    $parts = explode(',', $imagenBase64);
    if (count($parts) > 1) {
        $imagenBase64 = $parts[1]; // Extraer solo la parte base64
    }
}

// Preparar SQL
// Se agrega SERV_DESCRIPCION a la lista de columnas y un signo ? extra
$sql = "INSERT INTO serviciostecnicos 
        (SERV_NUM, SERV_DESCRIPCION, SERV_CED_ENV, SERV_NOM_ENV, SERV_IMG_ENV, SERV_CED_REC, SERV_NOM_REC, SERV_EST) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Error SQL: " . $conn->error]);
    exit();
}

// Vincular parámetros (bind_param)
// "sssssssi" -> 7 strings y 1 entero
$stmt->bind_param(
    "sssssssi", 
    $SERV_NUM,
    $SERV_DESCRIPCION, // <--- NUEVO CAMPO VINCULADO
    $SERV_CED_ENV,
    $SERV_NOM_ENV,
    $imagenBase64,
    $SERV_CED_REC,
    $SERV_NOM_REC,
    $SERV_EST
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true, 
        "message" => "Servicio creado exitosamente", 
        "id" => $stmt->insert_id
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Error al ejecutar: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>