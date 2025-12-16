<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

// Obtener técnicos (MOV_ROL = 0)
$sql = "SELECT MOV_CED, NOM_MOV, MOV_APE, 
        CONCAT(NOM_MOV, ' ', MOV_APE) as nombre_completo 
        FROM usersmovil 
        WHERE MOV_ROL = 0 
        ORDER BY NOM_MOV";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $tecnicos = [];
    while ($row = $result->fetch_assoc()) {
        $tecnicos[] = $row;
    }
    echo json_encode([
        "success" => true,
        "tecnicos" => $tecnicos
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "No se encontraron técnicos"
    ]);
}

$conn->close();
?>