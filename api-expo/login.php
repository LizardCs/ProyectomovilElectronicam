<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Manejar preflight CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db.php';

// Recibir JSON desde Expo
$data = json_decode(file_get_contents("php://input"));

// Validar que recibimos datos
if (!$data) {
    echo json_encode(["success" => false, "message" => "No se recibieron datos"]);
    exit();
}

// Validar campos requeridos
if (!isset($data->usuario) || !isset($data->clave) || empty($data->usuario) || empty($data->clave)) {
    echo json_encode(["success" => false, "message" => "Usuario y contraseña requeridos"]);
    exit();
}

$usuario = trim($data->usuario);
$clave = trim($data->clave);

// DEBUG: Mostrar lo que llega
error_log("Login attempt - Usuario: $usuario");

// Consulta SQL - CORREGIDA: usar usersmovil en lugar de usuarios
$sql = "SELECT MOV_ID, NOM_MOV, MOV_APE, MOV_ROL, MOV_CELU, MOV_USU 
        FROM usersmovil 
        WHERE MOV_USU = ? AND MOV_CLAVE = ?";
        
$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("SQL Error: " . $conn->error);
    echo json_encode(["success" => false, "message" => "Error en la consulta SQL: " . $conn->error]);
    exit();
}

$stmt->bind_param("ss", $usuario, $clave);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    
    // Determinar rol (1=admin, 0=tecnico)
    $rol_nombre = ($row['MOV_ROL'] == 1) ? "admin" : "tecnico";
    
    // Login exitoso
    echo json_encode([
        "success" => true,
        "message" => "Login exitoso",
        "user" => [
            "id" => $row['MOV_ID'],
            "nombre" => $row['NOM_MOV'],
            "apellido" => $row['MOV_APE'],
            "nombre_completo" => $row['NOM_MOV'] . " " . $row['MOV_APE'],
            "telefono" => $row['MOV_CELU'] ?? '',
            "usuario" => $row['MOV_USU'],
            "rol" => $row['MOV_ROL'], // 1 o 0
            "rol_nombre" => $rol_nombre
        ],
        "redirect_to" => ($row['MOV_ROL'] == 1) ? "/admin/home" : "/tecnico/home"
    ]);
} else {
    // Login fallido
    error_log("Login failed - Usuario: $usuario");
    echo json_encode([
        "success" => false, 
        "message" => "Usuario o contraseña incorrectos"
    ]);
}

$stmt->close();
$conn->close();
?>