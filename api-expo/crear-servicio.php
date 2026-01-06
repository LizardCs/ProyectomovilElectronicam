<?php
// 1. CONFIGURACIÓN
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(); }

ob_start();

try {
    date_default_timezone_set('America/Guayaquil');
    include 'db.php';

    if ($conn->connect_error) { throw new Exception("Error de conexión"); }

    // Captura de datos (Soporta JSON y FormData)
    $SERV_NUM = $_POST['SERV_NUM'] ?? '';
    $SERV_DESCRIPCION = $_POST['SERV_DESCRIPCION'] ?? '';
    $SERV_CED_ENV = $_POST['SERV_CED_ENV'] ?? '';
    $SERV_NOM_ENV = $_POST['SERV_NOM_ENV'] ?? '';
    $SERV_CED_REC = $_POST['SERV_CED_REC'] ?? '';
    $SERV_NOM_REC = $_POST['SERV_NOM_REC'] ?? '';
    $SERV_EST = $_POST['SERV_EST'] ?? 0;
    $SERV_FECH_ASIG = date('Y-m-d H:i:s');
    
    $imagenBase64 = '';

    // PROCESAMIENTO DE IMAGEN
    if (isset($_FILES['SERV_IMG_ENV']) && $_FILES['SERV_IMG_ENV']['error'] === 0) {
        // Si llega como archivo (FormData)
        $imageData = file_get_contents($_FILES['SERV_IMG_ENV']['tmp_name']);
        $imagenBase64 = base64_encode($imageData);
    } else {
        // Si llega como string base64
        $imagenBase64 = $_POST['SERV_IMG_ENV'] ?? '';
    }

    if (empty($SERV_NUM) || empty($SERV_CED_REC) || empty($imagenBase64)) {
        throw new Exception("Datos incompletos.");
    }

    // Limpiar el encabezado "data:image/jpeg;base64," si existe
    if (strpos($imagenBase64, ',') !== false) {
        $imagenBase64 = explode(',', $imagenBase64)[1];
    }

    $sql = "INSERT INTO serviciostecnicos 
            (SERV_NUM, SERV_DESCRIPCION, SERV_FECH_ASIG, SERV_CED_ENV, SERV_NOM_ENV, SERV_IMG_ENV, SERV_CED_REC, SERV_NOM_REC, SERV_EST) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssssssi", 
        $SERV_NUM, $SERV_DESCRIPCION, $SERV_FECH_ASIG, 
        $SERV_CED_ENV, $SERV_NOM_ENV, $imagenBase64, 
        $SERV_CED_REC, $SERV_NOM_REC, $SERV_EST
    );

    if ($stmt->execute()) {
        ob_clean();
        echo json_encode(["success" => true, "message" => "Servicio creado con éxito"]);
    } else {
        throw new Exception("Error al guardar: " . $stmt->error);
    }

} catch (Exception $e) {
    ob_clean();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
ob_end_flush();
?>