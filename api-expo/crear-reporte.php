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
    $serv_id = $data['serv_id'];
    $serv_num = isset($data['serv_num']) ? $data['serv_num'] : '';

    if (empty($serv_num)) {
        echo json_encode(["success" => false, "message" => "Número de servicio requerido"]);
        exit;
    }

    // Decodificar PDF
    $pdf_content = base64_decode($pdf_b64);
    $pdf_size = strlen($pdf_content);
    
    if ($pdf_size < 100) {
        echo json_encode(["success" => false, "message" => "PDF inválido o vacío"]);
        exit;
    }

    // Preparar transacción
    $conn->begin_transaction();

    try {
        // Preparar statement para INSERT con BLOB
        $sql = "INSERT INTO reportes (REP_CED_USU, REP_NOM_USU, REP_TIPO, REP_DOC, REP_SEV_NUM, REP_FECHA) 
                VALUES (?, ?, ?, ?, ?, NOW())";
        
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Error preparando statement: " . $conn->error);
        }
        
        // IMPORTANTE: Para BLOB usamos 'b' como tipo en bind_param
        // 'sssbs' significa: string, string, string, BLOB, string
        $stmt->bind_param("sssbs", 
            $ced_usu,      // string
            $nom_usu,      // string  
            $tipo,         // string
            $null,         // BLOB (placeholder)
            $serv_num      // string
        );
        
        // Asignar el BLOB usando send_long_data
        $null = NULL;
        $stmt->send_long_data(3, $pdf_content); // Índice 3 = cuarto parámetro (0-based)
        
        // Ejecutar
        if (!$stmt->execute()) {
            throw new Exception("Error ejecutando statement: " . $stmt->error);
        }
        
        $reporte_id = $stmt->insert_id;
        $stmt->close();
        
        // Actualizar servicio
        $sql2 = "UPDATE serviciostecnicos SET SERV_EST = 1, SERV_FECH_FIN = NOW() WHERE SERV_ID = ?";
        $stmt2 = $conn->prepare($sql2);
        $stmt2->bind_param("i", $serv_id);
        $stmt2->execute();
        $stmt2->close();

        $conn->commit();
        
        echo json_encode([
            "success" => true, 
            "message" => "Reporte creado exitosamente",
            "report_id" => $reporte_id,
            "serv_num" => $serv_num,
            "pdf_size" => $pdf_size,
            "fecha" => date('Y-m-d H:i:s')
        ]);
        
    } catch (Exception $e) {
        $conn->rollback();
        error_log("Error en crear-reporte: " . $e->getMessage());
        echo json_encode([
            "success" => false, 
            "message" => "Error: " . $e->getMessage(),
            "error_detail" => $conn->error
        ]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Datos no recibidos"]);
}

$conn->close();
?>