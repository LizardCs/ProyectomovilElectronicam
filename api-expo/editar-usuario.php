<?php
// api-expo/editar-usuario.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) { exit; }

$id       = $data['id'];
$origen   = $data['origen']; 
$nombre   = $data['nombre'];
$apellido = $data['apellido'];
$celular  = $data['celular'];
$usuario  = $data['usuario'];
$clave    = $data['clave']; // Puede venir vacío si no marcaron "Sí"

// Definir nombres de columnas según tabla
if ($origen === 'MOVIL') {
    $tabla = "usersmovil";
    $colNom = "NOM_MOV"; $colApe = "MOV_APE"; $colCel = "MOV_CELU"; $colUsu = "MOV_USU"; $colCla = "MOV_CLAVE"; $colId = "MOV_ID";
} else {
    $tabla = "usersweb";
    $colNom = "WEB_NOMBRES"; $colApe = "WEB_APELLIDOS"; $colCel = "WEB_CELU"; $colUsu = "WEB_USU"; $colCla = "WEB_CLAVE"; $colId = "WEB_ID";
}

// CONSTRUCCIÓN DINÁMICA DEL SQL
if (empty($clave)) {
    // Si no enviaron clave, NO la incluimos en el UPDATE
    $sql = "UPDATE $tabla SET $colNom=?, $colApe=?, $colCel=?, $colUsu=? WHERE $colId=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssi", $nombre, $apellido, $celular, $usuario, $id);
} else {
    // Si enviaron clave, actualizamos TODO
    $sql = "UPDATE $tabla SET $colNom=?, $colApe=?, $colCel=?, $colUsu=?, $colCla=? WHERE $colId=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssi", $nombre, $apellido, $celular, $usuario, $clave, $id);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $conn->error]);
}
$conn->close();
?>