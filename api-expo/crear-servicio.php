<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// AJUSTA TU ZONA HORARIA AQUÍ PARA QUE LA HORA SEA CORRECTA
// Ejemplos: 'America/Guayaquil', 'America/Bogota', 'America/Lima', 'America/Mexico_City'
date_default_timezone_set('America/Guayaquil'); 

// Manejo de preflight CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db.php';

// Inicializar variables
$SERV_NUM = $SERV_DESCRIPCION = $SERV_CED_ENV = $SERV_NOM_ENV = $SERV_CED_REC = $SERV_NOM_REC = '';
$SERV_EST = 0;
$imagenBase64 = '';

// GENERAR LA FECHA AUTOMÁTICAMENTE EN EL SERVIDOR
// Esto garantiza que siempre se guarde la fecha y hora exacta del momento de creación
// formato: Año-Mes-Día Hora:Minuto:Segundo (Compatible 100% con MySQL DATETIME)
$SERV_FECH_ASIG = date('Y-m-d H:i:s'); 

// Determinar tipo de contenido
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

// 1. Si los datos llegan como JSON (Web)
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
// 2. Si los datos llegan como FormData/Multipart (Móvil)
else if (strpos($contentType, 'multipart/form-data') !== false || isset($_FILES['SERV_IMG_ENV'])) {
    $SERV_NUM = $_POST['SERV_NUM'] ?? '';
    $SERV_DESCRIPCION = $_POST['SERV_DESCRIPCION'] ?? '';
    $SERV_CED_ENV = $_POST['SERV_CED_ENV'] ?? '';
    $SERV_NOM_ENV = $_POST['SERV_NOM_ENV'] ?? '';
    $SERV_CED_REC = $_POST['SERV_CED_REC'] ?? '';
    $SERV_NOM_REC = $_POST['SERV_NOM_REC'] ?? '';
    $SERV_EST = $_POST['SERV_EST'] ?? 0;
    
    // Procesar imagen
    if (isset($_FILES['SERV_IMG_ENV']) && $_FILES['SERV_IMG_ENV']['error'] === 0) {
        $file = $_FILES['SERV_IMG_ENV'];
        $imageData = file_get_contents($file['tmp_name']);
        $imagenBase64 = base64_encode($imageData);
    }
}

// Validar datos requeridos
if (empty($SERV_NUM) || empty($SERV_CED_ENV) || empty($SERV_CED_REC)) {
    echo json_encode(["success" => false, "message" => "Faltan campos requeridos"]);
    exit();
}

if (empty($imagenBase64)) {
    echo json_encode(["success" => false, "message" => "La imagen es obligatoria"]);
    exit();
}

// Extraer base64 puro si viene con cabecera data:image
if (strpos($imagenBase64, 'data:image') === 0) {
    $parts = explode(',', $imagenBase64);
    if (count($parts) > 1) {
        $imagenBase64 = $parts[1];
    }
}

// Preparar SQL
$sql = "INSERT INTO serviciostecnicos 
        (SERV_NUM, SERV_DESCRIPCION, SERV_FECH_ASIG, SERV_CED_ENV, SERV_NOM_ENV, SERV_IMG_ENV, SERV_CED_REC, SERV_NOM_REC, SERV_EST) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Error SQL: " . $conn->error]);
    exit();
}

// Bind param: 9 variables (8 strings 's', 1 int 'i')
$stmt->bind_param(
    "ssssssssi", 
    $SERV_NUM,
    $SERV_DESCRIPCION,
    $SERV_FECH_ASIG, // Variable generada por PHP arriba
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
        "id" => $stmt->insert_id,
        "fecha" => $SERV_FECH_ASIG // Devuelve la fecha generada para confirmación
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Error al ejecutar: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>