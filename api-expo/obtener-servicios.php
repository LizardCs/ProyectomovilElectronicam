<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Incluir la conexión a la base de datos
include 'db.php';

// Consulta SQL: Traer todos los servicios
// ORDER BY SERV_ID DESC hace que los más recientes aparezcan primero
$sql = "SELECT * FROM serviciostecnicos ORDER BY SERV_ID DESC";

$result = $conn->query($sql);

$servicios = array();

if ($result->num_rows > 0) {
    // Recorremos cada fila de la base de datos
    while($row = $result->fetch_assoc()) {
        // Agregamos la fila al array de servicios
        $servicios[] = $row;
    }
}

// Devolvemos la respuesta JSON
echo json_encode([
    "success" => true,
    "servicios" => $servicios
]);

$conn->close();
?>