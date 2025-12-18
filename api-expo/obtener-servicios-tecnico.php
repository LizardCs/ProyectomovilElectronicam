<?php
// api-expo/obtener-servicios-tecnico.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';

// Recibimos la cédula por GET
$cedula = $_GET['cedula'] ?? '';

if (empty($cedula)) {
    echo json_encode(["success" => false, "message" => "Cédula requerida"]);
    exit;
}

$response = ["success" => false, "servicios" => []];

try {
    // Filtramos por SERV_CED_REC (Cédula del Receptor/Técnico)
    $sql = "SELECT * FROM serviciostecnicos WHERE SERV_CED_REC = ? ORDER BY SERV_FECH_ASIG DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $cedula);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $response["servicios"][] = $row;
    }
    $response["success"] = true;
} catch (Exception $e) {
    $response["message"] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>