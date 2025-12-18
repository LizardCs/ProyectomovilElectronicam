<?php
// api-expo/editar-usuario.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) { echo json_encode(["success" => false, "message" => "Sin datos"]); exit; }

$id = $data['id'];
$origen = $data['origen']; // 'MOVIL' o 'WEB'
$nuevoUsuario = $data['usuario'];
$nuevaClave = $data['clave'];

if ($origen === 'MOVIL') {
    $sql = "UPDATE usersmovil SET MOV_USU = ?, MOV_CLAVE = ? WHERE MOV_ID = ?";
} else {
    $sql = "UPDATE usersweb SET WEB_USU = ?, WEB_CLAVE = ? WHERE WEB_ID = ?";
}

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssi", $nuevoUsuario, $nuevaClave, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Credenciales actualizadas"]);
} else {
    echo json_encode(["success" => false, "message" => $conn->error]);
}
$conn->close();
?>