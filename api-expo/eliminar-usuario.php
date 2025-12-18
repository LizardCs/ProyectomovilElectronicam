<?php
// api-expo/eliminar-usuario.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'];
$origen = $data['origen'];

$tabla = ($origen === 'MOVIL') ? 'usersmovil' : 'usersweb';
$columnaId = ($origen === 'MOVIL') ? 'MOV_ID' : 'WEB_ID';

$sql = "DELETE FROM $tabla WHERE $columnaId = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false]);
}
$conn->close();
?>