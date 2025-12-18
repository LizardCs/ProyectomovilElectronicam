<?php
// api-expo/crear-reporte.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $ced_usu = $data['cedula'];
    $nom_usu = $data['nombre'];
    $tipo    = $data['tipo']; 
    $pdf_b64 = $data['pdf_base64']; 
    $serv_id = $data['serv_id']; // ID del servicio original

    // 1. Guardar el PDF físicamente
    $nombre_archivo = "REPORTE_" . $serv_id . "_" . time() . ".pdf";
    $ruta = "documentos/" . $nombre_archivo;
    if(!is_dir('documentos')) mkdir('documentos', 0777, true);
    file_put_contents($ruta, base64_decode($pdf_b64));

    // Iniciar transacción para asegurar que ambos cambios ocurran
    $conn->begin_transaction();

    try {
        // 2. Insertar en tabla reportes
        $sql1 = "INSERT INTO reportes (REP_CED_USU, REP_NOM_USU, REP_TIPO, REP_DOC, REP_FECHA) VALUES (?, ?, ?, ?, NOW())";
        $stmt1 = $conn->prepare($sql1);
        $stmt1->bind_param("ssss", $ced_usu, $nom_usu, $tipo, $nombre_archivo);
        $stmt1->execute();

        // 3. ACTUALIZAR SERVICIO (Estado 1 y Fecha Fin)
        $sql2 = "UPDATE serviciostecnicos SET SERV_EST = 1, SERV_FECH_FIN = NOW() WHERE SERV_ID = ?";
        $stmt2 = $conn->prepare($sql2);
        $stmt2->bind_param("i", $serv_id);
        $stmt2->execute();

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Servicio finalizado y reporte creado"]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}
$conn->close();
?>