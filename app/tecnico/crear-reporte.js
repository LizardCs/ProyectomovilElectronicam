import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from "react";
import {
    ActivityIndicator, Alert, Image, KeyboardAvoidingView,
    Platform, ScrollView, StyleSheet,
    Switch,
    Text, TextInput, TouchableOpacity, View
} from "react-native";
import SignatureScreen from "react-native-signature-canvas";

// --- NUEVA IMPORTACIÓN DEL SERVICIO ---
import { crearReporte } from "../../services/crearReporte";

export default function CrearReporte() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const servicio = JSON.parse(params.servicio);

    const [loading, setLoading] = useState(false);

    // 1. DATOS DEL CLIENTE
    const [nombreCliente, setNombreCliente] = useState("");
    const [cedulaCliente, setCedulaCliente] = useState("");
    const [telefonoCliente, setTelefonoCliente] = useState("");
    const [direccionCliente, setDireccionCliente] = useState("");

    // 2. IDENTIFICACIÓN DEL EQUIPO
    const [unidad, setUnidad] = useState("");
    const [marca, setMarca] = useState("");
    const [modeloEq, setModeloEq] = useState("");
    const [serieEq, setSerieEq] = useState("");
    const [colorEq, setColorEq] = useState("");

    // 3. ESTADOS Y CHECKS TÉCNICOS
    const [checks, setChecks] = useState({
        garantia: false, papeles: false, pendiente: false, completo: false,
        nuevo: false, usado: true, excepcion: false,
        nivelacion: false, presionAgua: false,
        modeloSerieCheck: false, conexionesElectricas: false,
        conexionesAgua: false, equipoInstalado: false,
        accesorios: false,
        aceptaCondiciones: false
    });

    const [danioReportado, setDanioReportado] = useState("");
    const [inspeccionEstadoDesc, setInspeccionEstadoDesc] = useState("");
    const [accesoriosDesc, setAccesoriosDesc] = useState("");
    const [recomendaciones, setRecomendaciones] = useState("");

    // 4. FOTOS
    const [fotoModelo, setFotoModelo] = useState(null);
    const [descModelo, setDescModelo] = useState("");
    const [fotoFactura, setFotoFactura] = useState(null);
    const [descFactura, setDescFactura] = useState("");
    const [fotoElectrico, setFotoElectrico] = useState(null);
    const [descElectrico, setDescElectrico] = useState("");

    const [firma, setFirma] = useState(null);
    const [showSig, setShowSig] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            const hayProgreso = nombreCliente || unidad || danioReportado || fotoModelo || firma;
            if (!hayProgreso || loading) return;
            e.preventDefault();
            Alert.alert("¿Descartar reporte?", "Se perderán todos los datos y fotos de este reporte técnico.", [
                { text: "Continuar editando", style: "cancel" },
                { text: "Salir y borrar", style: "destructive", onPress: () => navigation.dispatch(e.data.action) }
            ]);
        });
        return unsubscribe;
    }, [navigation, nombreCliente, unidad, danioReportado, fotoModelo, firma, loading]);

    const toggleCheck = (key) => setChecks(prev => ({ ...prev, [key]: !prev[key] }));

    const seleccionarImagen = (key) => {
        Alert.alert("Origen de la imagen", "¿Desea capturar una foto o elegir de la galería?", [
            { text: "Cámara", onPress: () => abrirMedia(key, 'camera') },
            { text: "Galería", onPress: () => abrirMedia(key, 'library') },
            { text: "Cancelar", style: "cancel" }
        ]);
    };

    const abrirMedia = async (key, origen) => {
        const opciones = { allowsEditing: true, aspect: [4, 3], quality: 0.5, base64: true };
        let result = origen === 'camera' ? await ImagePicker.launchCameraAsync(opciones) : await ImagePicker.launchImageLibraryAsync(opciones);
        if (!result.canceled) {
            const asset = result.assets[0];
            if (key === 'modelo') setFotoModelo(asset);
            else if (key === 'factura') setFotoFactura(asset);
            else setFotoElectrico(asset);
        }
    };

    const generarReporteGod = async () => {
        if (!nombreCliente || !unidad || !danioReportado || !firma || !checks.aceptaCondiciones) {
            Alert.alert("Atención", "Campos obligatorios: Cliente, Equipo, Daño, Firma y Aceptar Condiciones.");
            return;
        }

        setLoading(true);

        const fechaActual = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const fechaSimple = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const renderCheckIcon = (val) => (val ? 'fas fa-check-circle' : 'far fa-circle');
        const renderCheckClass = (val) => (val ? 'checked' : 'unchecked');

        const imgModelo = fotoModelo ? `data:image/jpeg;base64,${fotoModelo.base64}` : '';
        const imgFactura = fotoFactura ? `data:image/jpeg;base64,${fotoFactura.base64}` : '';
        const imgFinal = fotoElectrico ? `data:image/jpeg;base64,${fotoElectrico.base64}` : '';

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte Técnico Digital - Electrónica Mantilla</title>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                :root {
                    --primary: #001C38;
                    --secondary: #007BFF;
                    --accent: #00A86B;
                    --light-bg: #F8FAFC;
                    --border: #E2E8F0;
                    --shadow: rgba(0, 28, 56, 0.08);
                    --text: #334155;
                    --text-light: #64748B;
                    --success: #10B981;
                    --warning: #F59E0B;
                    --danger: #EF4444;
                    --info: #3B82F6;
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Inter', 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                    color: var(--text);
                    line-height: 1.6;
                    padding: 20px;
                    font-size: 15px;
                }

                .container {
                    max-width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px var(--shadow);
                    overflow: hidden;
                    position: relative;
                }

                .container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background: linear-gradient(90deg, var(--primary), var(--secondary), var(--accent));
                }

                /* HEADER */
                .header {
                    background: var(--primary);
                    color: white;
                    padding: 30px 40px 25px;
                    border-bottom: 5px solid var(--secondary);
                }

                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }

                .logo-section h1 {
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                    margin-bottom: 5px;
                }

                .logo-section p {
                    font-size: 15px;
                    opacity: 0.9;
                    font-weight: 300;
                }

                .order-badge {
                    background: var(--accent);
                    color: white;
                    padding: 8px 20px;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 16px;
                    display: inline-flex;
                    align-items: center;
                    box-shadow: 0 4px 12px rgba(0, 168, 107, 0.3);
                }

                .order-badge i {
                    margin-right: 8px;
                }

                .header-info {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 30px;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin-top: 15px;
                }

                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .info-item i {
                    color: var(--secondary);
                    font-size: 18px;
                }

                /* MAIN CONTENT */
                .main-content {
                    padding: 40px;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 40px;
                }

                /* SECTIONS */
                .section {
                    background: var(--light-bg);
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    overflow: hidden;
                }

                .section-header {
                    background: linear-gradient(90deg, var(--primary), #00305C);
                    color: white;
                    padding: 18px 25px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: 600;
                    font-size: 16px;
                }

                .section-header i {
                    font-size: 18px;
                }

                .section-body {
                    padding: 25px;
                }

                /* CLIENT INFO */
                .client-info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }

                .info-card {
                    background: white;
                    border-radius: 10px;
                    padding: 18px;
                    border-left: 4px solid var(--secondary);
                    box-shadow: 0 2px 8px var(--shadow);
                }

                .info-card .label {
                    font-size: 13px;
                    color: var(--text-light);
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    display: block;
                    margin-bottom: 5px;
                }

                .info-card .value {
                    font-size: 17px;
                    font-weight: 600;
                    color: var(--primary);
                }

                /* DIAGNOSIS CARDS */
                .diagnosis-cards {
                    display: grid;
                    gap: 20px;
                    margin-top: 20px;
                }

                .diagnosis-card {
                    background: white;
                    border-radius: 10px;
                    padding: 20px;
                    border-top: 4px solid;
                    box-shadow: 0 3px 10px var(--shadow);
                }

                .diagnosis-card.reported {
                    border-top-color: var(--danger);
                }

                .diagnosis-card.observed {
                    border-top-color: var(--warning);
                }

                .diagnosis-card.solution {
                    border-top-color: var(--success);
                }

                .diagnosis-card.accessories {
                    border-top-color: var(--info);
                }

                .card-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: var(--primary);
                }

                .card-title i {
                    font-size: 18px;
                }

                /* CHECKLIST */
                .checklist-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }

                .check-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px;
                    background: white;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                }

                .check-item.checked {
                    background: rgba(16, 185, 129, 0.08);
                    border-color: var(--success);
                    color: var(--success);
                }

                .check-item.unchecked {
                    opacity: 0.6;
                }

                .check-item i {
                    font-size: 16px;
                }

                /* STATUS BADGES */
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 6px 14px;
                    border-radius: 50px;
                    font-size: 13px;
                    font-weight: 600;
                    margin-right: 10px;
                    margin-bottom: 10px;
                }

                .status-badge.warranty {
                    background: rgba(16, 185, 129, 0.15);
                    color: var(--success);
                }

                .status-badge.used {
                    background: rgba(245, 158, 11, 0.15);
                    color: var(--warning);
                }

                .status-badge.complete {
                    background: rgba(59, 130, 246, 0.15);
                    color: var(--info);
                }

                /* SIGNATURE */
                .signature-section {
                    text-align: center;
                    padding: 30px;
                    background: white;
                    border-radius: 12px;
                    border: 2px dashed var(--border);
                    margin-top: 30px;
                }

                .signature-img {
                    max-width: 250px;
                    height: auto;
                    margin: 20px 0;
                }

                .signature-name {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--primary);
                    margin-top: 10px;
                }

                .signature-note {
                    font-size: 13px;
                    color: var(--text-light);
                    margin-top: 8px;
                    font-style: italic;
                }

                /* IMAGES SECTION - MODIFICADA */
                .images-section {
                    margin-top: 50px;
                    padding-top: 30px;
                    border-top: 1px solid var(--border);
                }
                
                .images-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 35px; /* Más espacio entre imágenes */
                    margin-top: 25px;
                    width: 100%;
                }
                
                .image-card {
                    width: 90%; /* Más ancho */
                    max-width: 500px; /* Ancho máximo más grande */
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); /* Sombra más pronunciada */
                    border: 1px solid var(--border);
                    background: white;
                }
                
                .image-card img {
                    width: 100%;
                    height: 280px; /* Más alta */
                    object-fit: contain; /* Para mantener proporción */
                    background: #f8f9fa; /* Fondo gris claro para imágenes transparentes */
                    padding: 10px; /* Espacio alrededor de la imagen */
                    display: block;
                }
                
                .image-caption {
                    padding: 18px 20px;
                    background: white;
                    font-weight: 700; /* Más negrita */
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center; /* Centrado */
                    gap: 12px;
                    font-size: 16px; /* Texto más grande */
                    border-top: 1px solid var(--border);
                    text-align: center;
                }
                
                .image-caption i {
                    font-size: 18px; /* Iconos más grandes */
                }

                /* FOOTER */
                .footer {
                    padding: 25px 40px;
                    background: var(--light-bg);
                    border-top: 1px solid var(--border);
                    text-align: center;
                    color: var(--text-light);
                    font-size: 14px;
                }

                .footer-links {
                    display: flex;
                    justify-content: center;
                    gap: 30px;
                    margin-top: 15px;
                }

                /* RESPONSIVE */
                @media (max-width: 1100px) {
                    .content-grid {
                        grid-template-columns: 1fr;
                    }
                }
                
                @media (max-width: 768px) {
                    .image-card {
                        width: 95%; /* Más ancho en móviles */
                    }
                    
                    .image-card img {
                        height: 250px; /* Un poco menos alta en móviles */
                    }
                }

                @media print {
                    body {
                        background: none;
                        padding: 0;
                    }
                    
                    .container {
                        box-shadow: none;
                        border-radius: 0;
                        max-width: 100%;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- HEADER -->
                <header class="header">
                    <div class="header-top">
                        <div class="logo-section">
                            <h1>ELECTRÓNICA MANTILLA</h1>
                            <p>Servicio Técnico Especializado</p>
                        </div>
                        <div class="order-badge">
                            <i class="fas fa-file-invoice"></i> Orden: ${servicio.SERV_NUM}
                        </div>
                    </div>
                    
                    <div class="header-info">
                        <div class="info-item">
                            <i class="fas fa-calendar-alt"></i>
                            <div>
                                <div class="label">Fecha de Emisión</div>
                                <div class="value">${fechaSimple}</div>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-user-tie"></i>
                            <div>
                                <div class="label">Técnico Responsable</div>
                                <div class="value">Carlos Mantilla</div>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-star"></i>
                            <div>
                                <div class="label">Estado del Reporte</div>
                                <div class="value">Completado</div>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- MAIN CONTENT -->
                <main class="main-content">
                    <div class="content-grid">
                        <!-- CLIENT SECTION -->
                        <section class="section">
                            <div class="section-header">
                                <i class="fas fa-user-circle"></i> Información del Cliente
                            </div>
                            <div class="section-body">
                                <div class="client-info-grid">
                                    <div class="info-card">
                                        <span class="label">Nombre</span>
                                        <div class="value">${nombreCliente}</div>
                                    </div>
                                    <div class="info-card">
                                        <span class="label">Cédula</span>
                                        <div class="value">${cedulaCliente || servicio.SERV_CED_REC}</div>
                                    </div>
                                    <div class="info-card">
                                        <span class="label">Teléfono</span>
                                        <div class="value">${telefonoCliente}</div>
                                    </div>
                                    <div class="info-card">
                                        <span class="label">Dirección</span>
                                        <div class="value">${direccionCliente}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- EQUIPMENT SECTION -->
                        <section class="section">
                            <div class="section-header">
                                <i class="fas fa-box"></i> Equipo Revisado
                            </div>
                            <div class="section-body">
                                <div class="client-info-grid">
                                    <div class="info-card">
                                        <span class="label">Tipo de Equipo</span>
                                        <div class="value">${unidad}</div>
                                    </div>
                                    <div class="info-card">
                                        <span class="label">Marca</span>
                                        <div class="value">${marca}</div>
                                    </div>
                                    <div class="info-card">
                                        <span class="label">Modelo</span>
                                        <div class="value">${modeloEq}</div>
                                    </div>
                                    <div class="info-card">
                                        <span class="label">Número de Serie</span>
                                        <div class="value">${serieEq}</div>
                                    </div>
                                    <div class="info-card">
                                        <span class="label">Color</span>
                                        <div class="value">${colorEq}</div>
                                    </div>
                                    <div class="info-card">
                                        <span class="label">Estado</span>
                                        <div class="value">
                                            <span class="status-badge ${checks.usado ? 'used' : ''}">
                                                <i class="fas fa-clock"></i> ${checks.usado ? 'Usado' : 'Nuevo'}
                                            </span>
                                            ${checks.garantia ? '<span class="status-badge warranty"><i class="fas fa-shield-alt"></i>  En Garantía</span>' : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <!-- DIAGNOSIS & SOLUTION SECTION -->
                    <section class="section">
                        <div class="section-header">
                            <i class="fas fa-stethoscope"></i> Diagnóstico Técnico
                        </div>
                        <div class="section-body">
                            <div class="diagnosis-cards">
                                <div class="diagnosis-card reported">
                                    <div class="card-title">
                                        <i class="fas fa-exclamation-triangle"></i> Daño Reportado
                                    </div>
                                    <p>${danioReportado}</p>
                                </div>
                                
                                <div class="diagnosis-card observed">
                                    <div class="card-title">
                                        <i class="fas fa-search"></i> Observaciones del Técnico
                                    </div>
                                    <p>${inspeccionEstadoDesc}</p>
                                </div>
                                
                                <div class="diagnosis-card solution">
                                    <div class="card-title">
                                        <i class="fas fa-tools"></i> Recomendaciones al cliente
                                    </div>
                                    <p>${recomendaciones}</p>
                                </div>
                                
                                <div class="diagnosis-card accessories">
                                    <div class="card-title">
                                        <i class="fas fa-box-open"></i> Accesorios Recibidos
                                    </div>
                                    <p>${checks.accesorios ? 'Sí - ' + accesoriosDesc : 'No se recibieron accesorios'}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- VALIDATION & CHECKS -->
                    <section class="section">
                        <div class="section-header">
                            <i class="fas fa-clipboard-check"></i> Puntos a tomar en cuenta
                        </div>
                        <div class="section-body">
                            <div class="checklist-grid">
                                <div class="check-item ${renderCheckClass(checks.garantia)}">
                                    <i class="${renderCheckIcon(checks.garantia)}"></i> En Garantía
                                </div>
                                <div class="check-item ${renderCheckClass(checks.papeles)}">
                                    <i class="${renderCheckIcon(checks.papeles)}"></i> Con Papeles
                                </div>
                                <div class="check-item ${renderCheckClass(checks.pendiente)}">
                                    <i class="${renderCheckIcon(checks.pendiente)}"></i> Pendiente
                                </div>
                                <div class="check-item ${renderCheckClass(checks.completo)}">
                                    <i class="${renderCheckIcon(checks.completo)}"></i> Caja Completa
                                </div>
                                <div class="check-item ${renderCheckClass(checks.nivelacion)}">
                                    <i class="${renderCheckIcon(checks.nivelacion)}"></i> Nivelación
                                </div>
                                <div class="check-item ${renderCheckClass(checks.presionAgua)}">
                                    <i class="${renderCheckIcon(checks.presionAgua)}"></i> Presión de Agua
                                </div>
                                <div class="check-item ${renderCheckClass(checks.modeloSerieCheck)}">
                                    <i class="${renderCheckIcon(checks.modeloSerieCheck)}"></i> Modelo / Serie Verificado
                                </div>
                                <div class="check-item ${renderCheckClass(checks.conexionesElectricas)}">
                                    <i class="${renderCheckIcon(checks.conexionesElectricas)}"></i> Instalación Eléctrica
                                </div>
                            </div>

                            <div class="status-indicators" style="margin-top: 25px;">
                                ${checks.garantia ? '<span class="status-badge warranty"><i class="fas fa-shield-alt"></i> En Garantía</span>' : ''}
                                <span class="status-badge complete">
                                    <i class="fas fa-check-double"></i>  Reporte realizado
                                </span>
                                <span class="status-badge ${checks.usado ? 'used' : ''}">
                                    <i class="fas fa-history"></i> ${checks.usado ? ' Equipo Usado' : ' Equipo Nuevo'}
                                </span>
                            </div>
                        </div>
                    </section>

                    <!-- SIGNATURE -->
                    <div class="signature-section">
                        <h3 style="color: var(--primary); margin-bottom: 20px;">Firma del cliente</h3>
                        <p style="color: var(--text-light); max-width: 600px; margin: 0 auto 25px;">
                            El cliente verifica que acepta la conformidad del servicio técnico prestado.
                        </p>
                        
                        <div style="margin: 30px 0;">
                            <img src="${firma}" alt="Firma del Cliente" class="signature-img">
                        </div>
                        
                        <div class="signature-name">${nombreCliente}</div>
                        <div class="signature-note">• C.I. ${cedulaCliente || servicio.SERV_CED_REC}</div>
                        <div class="signature-note">Fecha: ${fechaSimple}</div>
                    </div>

                    <!-- IMAGES SECTION MODIFICADA -->
                    <div class="images-section">
                        <h3 style="color: var(--primary); display: flex; align-items: center; justify-content: center; gap: 10px;">
                            <i class="fas fa-camera"></i> Evidencia Fotográfica
                        </h3>
                        <p style="color: var(--text-light); margin-top: 10px; text-align: center;">
                            Registro visual del equipo antes y después de la reparación.
                        </p>
                        
                        <div class="images-container">
                            ${imgModelo ? `
                            <div class="image-card">
                                <img src="${imgModelo}" alt="Modelo y Serie">
                                <div class="image-caption">
                                    <i class="fas fa-barcode"></i> Modelo y Número de Serie
                                </div>
                            </div>
                            ` : ''}
                            
                            ${imgFactura ? `
                            <div class="image-card">
                                <img src="${imgFactura}" alt="Factura">
                                <div class="image-caption">
                                    <i class="fas fa-file-invoice-dollar"></i> Documentación Recibida
                                </div>
                            </div>
                            ` : ''}
                            
                            ${imgFinal ? `
                            <div class="image-card">
                                <img src="${imgFinal}" alt="Equipo">
                                <div class="image-caption">
                                    <i class="fas fa-washing-machine"></i> Estado Físico del Equipo
                                </div>
                            </div>
                            ` : ''}
                            
                            ${!imgModelo && !imgFactura && !imgFinal ? `
                            <div style="text-align: center; padding: 40px; color: var(--text-light);">
                                <i class="fas fa-image" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                                <p>No se adjuntaron fotografías en este reporte</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </main>

                <!-- FOOTER -->
                <footer class="footer">
                    <p style="margin-bottom: 5px;">
                        <strong>LOCAL Nº 1:</strong> Quis Quis 15-203 y Av. Atahualpa • Telfs: (03) 2416124 - (03) 2848891
                    </p>
                    <p style="margin-bottom: 10px;">
                        <strong>LOCAL Nº 2:</strong> Montalvo 07-20 y Juan Benigno Vela • Telf: (03) 2828365
                    </p>
                    <div class="footer-links">
                        <span><i class="fab fa-whatsapp"></i> 0984139099 / 0986632992</span>
                        <span><i class="fas fa-envelope"></i> emantillacentro@yahoo.es</span>
                        <span><i class="fas fa-map-marker-alt"></i> Ambato - Ecuador</span>
                    </div>
                    <p style="margin-top: 15px; font-size: 12px; border-top: 1px solid var(--border); padding-top: 10px;">
                        Reporte generado el ${fechaActual} • ID: ${servicio.SERV_NUM}
                    </p>
                </footer>
            </div>
        </body>
        </html>`;

        try {
            // Generar el archivo PDF
            const { base64, uri } = await Print.printToFileAsync({ html: htmlContent, base64: true });

            // LLAMADA AL SERVICIO crearReporte.js
            const res = await crearReporte({
                cedula: servicio.SERV_CED_REC,
                nombre: servicio.SERV_NOM_REC,
                tipo: danioReportado,
                pdf_base64: base64,
                serv_id: servicio.SERV_ID,
                serv_num: servicio.SERV_NUM
            });

            if (res.success) {
                Alert.alert("Éxito", "Reporte guardado y servicio finalizado.");
                await Sharing.shareAsync(uri); // Compartir el PDF
                router.push("/tecnico/home");
            } else {
                Alert.alert("Error", res.message || "Error al subir el reporte");
            }
        } catch (e) {
            Alert.alert("Error", "Problema al sincronizar con la nube: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (showSig) {
        return (
            <View style={StyleSheet.absoluteFill}>
                <SignatureScreen
                    onOK={(sig) => { setFirma(sig); setShowSig(false); }}
                    onEmpty={() => setShowSig(false)}
                    descriptionText="Firma del Cliente"
                    confirmText="Guardar"
                    clearText="Limpiar"
                />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color="#FFF" /></TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Generar Reporte Técnico</Text>
                    <Text style={styles.headerSubtitle}>Orden Nº: {servicio.SERV_NUM}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* 1. DATOS CLIENTE */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>1. Datos del Cliente</Text>
                    <TextInput style={styles.input} placeholder="Nombre del cliente" value={nombreCliente} onChangeText={setNombreCliente} />
                    <TextInput style={styles.input} placeholder="Número de cédula" keyboardType="numeric" value={cedulaCliente} onChangeText={setCedulaCliente} />
                    <TextInput style={styles.input} placeholder="Teléfono de contacto" keyboardType="phone-pad" value={telefonoCliente} onChangeText={setTelefonoCliente} />
                    <TextInput style={styles.input} placeholder="Dirección del domicilio" value={direccionCliente} onChangeText={setDireccionCliente} />
                </View>

                {/* 2. IDENTIFICACION EQUIPO */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>2. Identificación del Equipo</Text>
                    <View style={styles.row}>
                        <TextInput style={[styles.input, { width: '48%' }]} placeholder="Unidad (Ej. Lavadora)" value={unidad} onChangeText={setUnidad} />
                        <TextInput style={[styles.input, { width: '48%' }]} placeholder="Marca" value={marca} onChangeText={setMarca} />
                    </View>
                    <TextInput style={styles.input} placeholder="Modelo" value={modeloEq} onChangeText={setModeloEq} />
                    <TextInput style={styles.input} placeholder="N° Serie" value={serieEq} onChangeText={setSerieEq} />
                    <TextInput style={styles.input} placeholder="Color" value={colorEq} onChangeText={setColorEq} />
                </View>

                {/* 3. RECEPCIÓN Y DIAGNÓSTICO */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>3. Recepción y Diagnóstico</Text>
                    <View style={styles.row}>
                        <CheckItem label="En Garantía" value={checks.garantia} onToggle={() => toggleCheck('garantia')} />
                        <CheckItem label="Con Papeles" value={checks.papeles} onToggle={() => toggleCheck('papeles')} />
                    </View>
                    <View style={styles.row}>
                        <CheckItem label="Pendiente" value={checks.pendiente} onToggle={() => toggleCheck('pendiente')} />
                        <CheckItem label="Caja Completa" value={checks.completo} onToggle={() => toggleCheck('completo')} />
                    </View>
                    <TextInput style={styles.inputArea} multiline placeholder="DESCRIBA EL DAÑO REPORTADO..." value={danioReportado} onChangeText={setDanioReportado} />
                </View>

                {/* 4. ACCESORIOS */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>4. ¿Recibe Accesorios?</Text>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.radioItem} onPress={() => setChecks({ ...checks, accesorios: true })}>
                            <Ionicons name={checks.accesorios ? "radio-button-on" : "radio-button-off"} size={22} color={checks.accesorios ? "#001C38" : "#666"} />
                            <Text style={styles.radioLabel}>SÍ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.radioItem} onPress={() => setChecks({ ...checks, accesorios: false })}>
                            <Ionicons name={!checks.accesorios ? "radio-button-on" : "radio-button-off"} size={22} color={!checks.accesorios ? "#001C38" : "#666"} />
                            <Text style={styles.radioLabel}>NO</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput style={styles.inputAcc} placeholder="Especifique accesorios recibidos..." value={accesoriosDesc} onChangeText={setAccesoriosDesc} />
                </View>

                {/* 5. INSPECCIÓN ESTADO */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>5. Inspección de Estado</Text>
                    <View style={styles.row}>
                        <CheckItem label="Estado Nuevo" value={checks.nuevo} onToggle={() => toggleCheck('nuevo')} />
                        <CheckItem label="Estado Usado" value={checks.usado} onToggle={() => toggleCheck('usado')} />
                    </View>
                    <CheckItem label="Fuera de Garantía" value={checks.excepcion} onToggle={() => toggleCheck('excepcion')} />
                    <TextInput style={styles.inputArea} multiline placeholder="Observaciones físicas (rayones, golpes)..." value={inspeccionEstadoDesc} onChangeText={setInspeccionEstadoDesc} />
                </View>

                {/* 6. PUNTOS TÉCNICOS */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>6. Verificación Técnica</Text>
                    <View style={styles.row}>
                        <CheckItem label="Nivelación Ok" value={checks.nivelacion} onToggle={() => toggleCheck('nivelacion')} />
                        <CheckItem label="Presión de Agua" value={checks.presionAgua} onToggle={() => toggleCheck('presionAgua')} />
                    </View>
                    <View style={styles.row}>
                        <CheckItem label="Verif. Modelo" value={checks.modeloSerieCheck} onToggle={() => toggleCheck('modeloSerieCheck')} />
                        <CheckItem label="Inst. Eléctrica" value={checks.conexionesElectricas} onToggle={() => toggleCheck('conexionesElectricas')} />
                    </View>
                </View>

                {/* 7. EVIDENCIA FOTOGRÁFICA */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>7. Registro Fotográfico</Text>
                    <ItemFoto label="Foto Modelo/Serie" icon="barcode-outline" color="#007AFF" foto={fotoModelo} desc={descModelo} onFoto={() => seleccionarImagen('modelo')} onDesc={setDescModelo} />
                    <ItemFoto label="Foto de la Factura" icon="receipt-outline" color="#34C759" foto={fotoFactura} desc={descFactura} onFoto={() => seleccionarImagen('factura')} onDesc={setDescFactura} />
                    <ItemFoto label="Evidencia de Revisión" icon="flash-outline" color="#FF9500" foto={fotoElectrico} desc={descElectrico} onFoto={() => seleccionarImagen('electrico')} onDesc={setDescElectrico} />
                </View>

                {/* 8. CIERRE */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>8. Firma y Cierre</Text>
                    <TextInput style={styles.inputArea} multiline placeholder="Recomendaciones para el cliente..." value={recomendaciones} onChangeText={setRecomendaciones} />
                    <View style={styles.termsBox}>
                        <Text style={styles.termsText}>Certifico que el trabajo ha sido realizado y acepto los términos de conformidad.</Text>
                        <Switch value={checks.aceptaCondiciones} onValueChange={() => toggleCheck('aceptaCondiciones')} />
                    </View>
                    <Text style={styles.label}>Firma Digital del Cliente</Text>
                    <TouchableOpacity style={styles.signBox} onPress={() => setShowSig(true)}>
                        {firma ? <Image source={{ uri: firma }} style={styles.fill} resizeMode="contain" /> : <View style={{ alignItems: 'center' }}><Ionicons name="pencil-outline" size={24} color="#999" /><Text style={{ color: '#999', marginTop: 5 }}>Presione aquí para firmar</Text></View>}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.btnSubmit} onPress={generarReporteGod} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>GUARDAR Y FINALIZAR TRABAJO</Text>}
                </TouchableOpacity>
                <View style={{ height: 50 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ... (Componentes auxiliares y estilos se mantienen igual)
const CheckItem = ({ label, value, onToggle }) => (
    <TouchableOpacity style={styles.checkItem} onPress={onToggle}>
        <Ionicons name={value ? "checkbox" : "square-outline"} size={22} color={value ? "#001C38" : "#666"} />
        <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
);

const ItemFoto = ({ label, icon, color, foto, desc, onFoto, onDesc }) => (
    <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity style={styles.photoBtn} onPress={onFoto}>
            {foto ? <Image source={{ uri: foto.uri }} style={styles.fill} /> : <Ionicons name={icon} size={40} color={color} />}
        </TouchableOpacity>
        <TextInput style={styles.inputSmall} placeholder="Descripción de la foto..." value={desc} onChangeText={onDesc} />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    header: { backgroundColor: "#001C38", paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
    headerTitleContainer: { alignItems: 'center', flex: 1 },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
    headerSubtitle: { fontSize: 12, color: "#88BBDC" },
    scroll: { padding: 15 },
    card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 3 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#001C38', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 5, textTransform: 'uppercase' },
    label: { fontSize: 13, fontWeight: 'bold', color: '#444', marginTop: 10, marginBottom: 5 },
    input: { backgroundColor: '#F9F9F9', borderBottomWidth: 1, borderBottomColor: '#DDD', padding: 8, marginBottom: 10, fontSize: 15 },
    inputArea: { backgroundColor: '#F9F9F9', borderRadius: 8, padding: 10, minHeight: 60, textAlignVertical: 'top' },
    inputAcc: { borderBottomWidth: 1, borderBottomColor: '#EEE', fontSize: 14, marginTop: 5 },
    inputSmall: { fontSize: 12, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 5, color: '#666' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    checkItem: { flexDirection: 'row', alignItems: 'center', width: '48%' },
    checkLabel: { marginLeft: 8, fontSize: 13, color: '#333' },
    radioItem: { flexDirection: 'row', alignItems: 'center', width: '45%', paddingVertical: 10 },
    radioLabel: { marginLeft: 10, fontSize: 15, fontWeight: '600', color: '#333' },
    photoBtn: { width: '100%', height: 160, backgroundColor: '#F8F9FA', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 5, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#CCC', overflow: 'hidden' },
    fill: { width: '100%', height: '100%' },
    termsBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6', padding: 12, borderRadius: 10, marginVertical: 15 },
    termsText: { flex: 1, fontSize: 11, color: '#856404', marginRight: 10 },
    signBox: { width: '100%', height: 130, borderStyle: 'dashed', borderWidth: 2, borderColor: '#007AFF', borderRadius: 12, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center' },
    btnSubmit: { backgroundColor: '#34C759', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 40, elevation: 5 },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});