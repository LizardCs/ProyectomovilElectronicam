<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';

$usuarios = [];

// Obtener de Móvil
$resMovil = $conn->query("SELECT MOV_ID as id, MOV_CED as cedula, NOM_MOV as nombre, MOV_APE as apellido, MOV_USU as usuario, MOV_ROL as rol, 'MOVIL' as origen FROM usersmovil");
while($row = $resMovil->fetch_assoc()) { $usuarios[] = $row; }

// Obtener de Web
$resWeb = $conn->query("SELECT WEB_ID as id, WEB_CED as cedula, WEB_NOMBRES as nombre, WEB_APELLIDOS as apellido, WEB_USU as usuario, 'WEB' as rol, 'WEB' as origen FROM usersweb");
while($row = $resWeb->fetch_assoc()) { $usuarios[] = $row; }

echo json_encode(["success" => true, "usuarios" => $usuarios]);
$conn->close();