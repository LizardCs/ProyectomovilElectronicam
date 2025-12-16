<?php
// C:\xampp\htdocs\api-expo\db.php

$host = "localhost";
$user = "root"; 
$pass = "";  
$db   = "electronic_mantilla_reports";

// Crear conexión
$conn = new mysqli($host, $user, $pass, $db);

// Verificar conexión
if ($conn->connect_error) {
    // En producción, no mostrar detalles del error
    http_response_code(500);
    die(json_encode([
        "success" => false,
        "message" => "Error de conexión con la base de datos"
    ]));
}

// Configurar charset
$conn->set_charset("utf8mb4");

// Para debugging (quitar en producción)
// echo "<!-- Conexión exitosa -->";
?>