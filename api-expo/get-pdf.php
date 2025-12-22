<?php
// api-expo/get-pdf.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit;
}

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    header("HTTP/1.1 400 Bad Request");
    echo json_encode(["error" => "ID de reporte requerido"]);
    exit;
}

include 'db.php';

try {
    // Obtener PDF desde la BD
    $sql = "SELECT REP_DOC, REP_SEV_NUM, REP_NOM_USU FROM reportes WHERE REP_ID = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error preparando consulta");
    }
    
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($pdf_blob, $serv_num, $tecnico);
    $stmt->fetch();
    
    if ($stmt->num_rows === 0) {
        header("HTTP/1.1 404 Not Found");
        echo json_encode(["error" => "Reporte no encontrado"]);
        exit;
    }
    
    if (empty($pdf_blob)) {
        header("HTTP/1.1 404 Not Found");
        echo json_encode(["error" => "El reporte no contiene PDF"]);
        exit;
    }
    
    // Servir el PDF
    header("Content-Type: application/pdf");
    header("Content-Disposition: inline; filename=\"Reporte_" . $serv_num . ".pdf\"");
    header("Content-Length: " . strlen($pdf_blob));
    header("Cache-Control: public, max-age=3600");
    header("Pragma: public");
    
    echo $pdf_blob;
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log("Error en get-pdf: " . $e->getMessage());
    header("HTTP/1.1 500 Internal Server Error");
    echo json_encode(["error" => "Error del servidor"]);
}
?>