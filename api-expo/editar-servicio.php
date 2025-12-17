<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

include 'db.php';

// Variables iniciales
$SERV_ID = $SERV_NUM = $SERV_DESCRIPCION = $SERV_CED_REC = $SERV_NOM_REC = '';
$imagenBase64 = ''; // Aquí guardaremos la imagen final

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

// 1. Recibir datos (JSON o FormData)
if (strpos($contentType, 'application/json') !== false) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if ($data) {
        $SERV_ID = $data['SERV_ID'] ?? '';
        $SERV_NUM = $data['SERV_NUM'] ?? '';
        $SERV_DESCRIPCION = $data['SERV_DESCRIPCION'] ?? '';
        $SERV_CED_REC = $data['SERV_CED_REC'] ?? '';
        $SERV_NOM_REC = $data['SERV_NOM_REC'] ?? '';
        $imagenBase64 = $data['SERV_IMG_ENV'] ?? ''; // Puede venir la nueva o la vieja
    }
} else {
    // FormData
    $SERV_ID = $_POST['SERV_ID'] ?? '';
    $SERV_NUM = $_POST['SERV_NUM'] ?? '';
    $SERV_DESCRIPCION = $_POST['SERV_DESCRIPCION'] ?? '';
    $SERV_CED_REC = $_POST['SERV_CED_REC'] ?? '';
    $SERV_NOM_REC = $_POST['SERV_NOM_REC'] ?? '';
    
    // Verificamos si enviaron una imagen NUEVA como archivo
    if (isset($_FILES['SERV_IMG_ENV']) && $_FILES['SERV_IMG_ENV']['error'] === 0) {
        $file = $_FILES['SERV_IMG_ENV'];
        $imageData = file_get_contents($file['tmp_name']);
        $imagenBase64 = base64_encode($imageData);
    } else {
        // Si no es archivo, revisamos si enviaron la cadena base64 antigua como texto
        $imagenBase64 = $_POST['SERV_IMG_ENV'] ?? '';
    }
}

if (empty($SERV_ID)) {
    echo json_encode(["success" => false, "message" => "Falta el ID del servicio"]);
    exit();
}

// Limpiar la imagen si viene con prefijo (data:image...)
if (strpos($imagenBase64, 'data:image') === 0) {
    $parts = explode(',', $imagenBase64);
    if (count($parts) > 1) {
        $imagenBase64 = $parts[1];
    }
}

// SQL UPDATE
$sql = "UPDATE serviciostecnicos SET 
        SERV_NUM = ?, 
        SERV_DESCRIPCION = ?, 
        SERV_CED_REC = ?, 
        SERV_NOM_REC = ?, 
        SERV_IMG_ENV = ?
        WHERE SERV_ID = ?";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Error SQL: " . $conn->error]);
    exit();
}

// "sssssi" -> 5 strings, 1 entero (ID)
$stmt->bind_param("sssssi", $SERV_NUM, $SERV_DESCRIPCION, $SERV_CED_REC, $SERV_NOM_REC, $imagenBase64, $SERV_ID);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Servicio actualizado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>