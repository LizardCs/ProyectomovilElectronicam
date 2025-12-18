<?php
// api-expo/crear-usuario-movil.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'db.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($_SERVER['REQUEST_METHOD'] == 'POST' && !empty($data)) {
    // Mapeo de datos del formulario de React Native a columnas de la BD
    $cedula   = $data['cedula'] ?? '';
    $nombre   = $data['nombre'] ?? '';
    $apellido = $data['apellido'] ?? '';
    $celular  = $data['celular'] ?? '';
    $usuario  = $data['usuario'] ?? '';
    $clave    = $data['clave'] ?? ''; // Recomendación: usar password_hash en producción
    $rol      = $data['rol'] ?? '0';

    if (empty($cedula) || empty($usuario) || empty($clave)) {
        echo json_encode(["success" => false, "message" => "Faltan campos obligatorios"]);
        exit;
    }

    $sql = "INSERT INTO usersmovil (MOV_CED, NOM_MOV, MOV_APE, MOV_CELU, MOV_USU, MOV_CLAVE, MOV_ROL) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssssi", $cedula, $nombre, $apellido, $celular, $usuario, $clave, $rol);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Usuario móvil creado"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error al guardar: " . $conn->error]);
    }
    $stmt->close();
}
$conn->close();
?>