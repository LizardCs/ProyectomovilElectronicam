<?php
// api-expo/crear-usuario-web.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'db.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($_SERVER['REQUEST_METHOD'] == 'POST' && !empty($data)) {
    // Mapeo de datos
    $cedula    = $data['cedula'] ?? '';
    $nombres   = $data['nombre'] ?? '';
    $apellidos = $data['apellido'] ?? '';
    $usuario   = $data['usuario'] ?? '';
    $clave     = $data['clave'] ?? '';
    $celular   = $data['celular'] ?? '';

    if (empty($cedula) || empty($usuario) || empty($clave)) {
        echo json_encode(["success" => false, "message" => "Faltan campos críticos"]);
        exit;
    }

    $sql = "INSERT INTO usersweb (WEB_CED, WEB_NOMBRES, WEB_APELLIDOS, WEB_USU, WEB_CLAVE, WEB_CELU, WEB_FEC_CREADO) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssss", $cedula, $nombres, $apellidos, $usuario, $clave, $celular);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Usuario web creado"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error al guardar: " . $conn->error]);
    }
    $stmt->close();
}
$conn->close();
?>