// utils/reporteTemplate.js

export const generarHtmlReporte = (data) => {
    const {
        servicio, fechaSimple, fechaActual,
        nombreCliente, cedulaCliente, telefonoCliente, direccionCliente,
        unidad, marca, modeloEq, serieEq, colorEq,
        checks,
        danioReportado, inspeccionEstadoDesc, recomendaciones, accesoriosDesc,
        imgModelo, imgFactura, imgFinal, firma
    } = data;

    const renderCheckIcon = (val) => (val ? 'fas fa-check-circle' : 'far fa-circle');
    const renderCheckClass = (val) => (val ? 'checked' : 'unchecked');

    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte Técnico Digital - Electrónica Mantilla</title>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                @page {
                    size: A4;
                    margin: 20mm 15mm 25mm 15mm;
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Inter', 'Segoe UI', sans-serif;
                    color: #334155;
                    line-height: 1.5;
                    font-size: 11pt;
                    width: 210mm;
                    margin: 0 auto;
                    background: white;
                }

                /* HEADER CON COLOR COMO ANTES */
                .header {
                    background: #001C38;
                    color: white;
                    padding: 30px 40px 25px;
                    border-bottom: 5px solid #007BFF;
                    border-radius: 10px 10px 0 0;
                    margin-bottom: 10mm;
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
                    color: white;
                }

                .logo-section p {
                    font-size: 15px;
                    opacity: 0.9;
                    font-weight: 300;
                    color: rgba(255, 255, 255, 0.8);
                }

                .order-badge {
                    background: #00A86B;
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
                    color: #007BFF;
                    font-size: 18px;
                }

                .info-item .label {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.8);
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    display: block;
                    margin-bottom: 5px;
                }

                .info-item .value {
                    font-size: 17px;
                    font-weight: 600;
                    color: white;
                }

                /* SECCIONES */
                .section {
                    margin-bottom: 10mm;
                    break-inside: avoid;
                }

                .section-header {
                    background: linear-gradient(90deg, #001C38, #00305C);
                    color: white;
                    padding: 4mm 6mm;
                    border-radius: 3mm 3mm 0 0;
                    display: flex;
                    align-items: center;
                    gap: 3mm;
                    font-weight: 600;
                    font-size: 11pt;
                }

                .section-header i {
                    font-size: 12pt;
                }

                .section-body {
                    padding: 6mm;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-top: none;
                    border-radius: 0 0 3mm 3mm;
                }

                /* INFORMACIÓN DEL CLIENTE - 2 FILAS DE 2 */
                .client-info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 6mm;
                }

                /* EQUIPO REVISADO - 2 FILAS DE 3 (COMO ANTES) */
                .equipment-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 6mm;
                    margin-bottom: 6mm;
                }

                .info-card {
                    background: white;
                    border-radius: 3mm;
                    padding: 4mm;
                    border-left: 3mm solid #007BFF;
                    box-shadow: 0 1mm 3mm rgba(0, 28, 56, 0.05);
                }

                .info-card .label {
                    font-size: 9pt;
                    color: #64748B;
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    display: block;
                    margin-bottom: 1mm;
                }

                .info-card .value {
                    font-size: 11pt;
                    font-weight: 600;
                    color: #001C38;
                }

                /* DIAGNOSIS CARDS */
                .diagnosis-cards {
                    display: grid;
                    gap: 4mm;
                }

                .diagnosis-card {
                    background: white;
                    border-radius: 3mm;
                    padding: 5mm;
                    border-top: 3mm solid;
                    box-shadow: 0 1.5mm 4mm rgba(0, 28, 56, 0.08);
                }

                .diagnosis-card.reported {
                    border-top-color: #EF4444;
                }

                .diagnosis-card.observed {
                    border-top-color: #F59E0B;
                }

                .diagnosis-card.solution {
                    border-top-color: #10B981;
                }

                .diagnosis-card.accessories {
                    border-top-color: #3B82F6;
                }

                .card-title {
                    display: flex;
                    align-items: center;
                    gap: 3mm;
                    font-weight: 600;
                    margin-bottom: 3mm;
                    color: #001C38;
                    font-size: 11pt;
                }

                .card-title i {
                    font-size: 12pt;
                }

                /* CHECKLIST */
                .checklist-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 3mm;
                }

                .check-item {
                    display: flex;
                    align-items: center;
                    gap: 3mm;
                    padding: 3mm;
                    background: white;
                    border-radius: 2mm;
                    border: 1px solid #E2E8F0;
                    font-size: 10pt;
                }

                .check-item.checked {
                    background: rgba(16, 185, 129, 0.08);
                    border-color: #10B981;
                    color: #10B981;
                }

                .check-item.unchecked {
                    opacity: 0.6;
                }

                .check-item i {
                    font-size: 10pt;
                }

                /* STATUS BADGES */
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 2mm 4mm;
                    border-radius: 25mm;
                    font-size: 9pt;
                    font-weight: 600;
                    margin-right: 3mm;
                    margin-bottom: 2mm;
                }

                .status-badge.warranty {
                    background: rgba(16, 185, 129, 0.15);
                    color: #10B981;
                }

                .status-badge.used {
                    background: rgba(245, 158, 11, 0.15);
                    color: #F59E0B;
                }

                .status-badge.complete {
                    background: rgba(59, 130, 246, 0.15);
                    color: #3B82F6;
                }

                /* SIGNATURE - AHORA AL FINAL */
                .signature-section {
                    text-align: center;
                    padding: 10mm;
                    background: white;
                    border-radius: 4mm;
                    border: 1mm dashed #E2E8F0;
                    margin-bottom: 15mm;
                    break-before: page;
                }

                .signature-img {
                    max-width: 180mm;
                    height: 30mm;
                    margin: 5mm 0;
                    object-fit: contain;
                }

                .signature-name {
                    font-size: 12pt;
                    font-weight: 700;
                    color: #001C38;
                    margin-top: 3mm;
                }

                .signature-note {
                    font-size: 9pt;
                    color: #64748B;
                    margin-top: 2mm;
                    font-style: italic;
                }

                /* IMAGES SECTION */
                .images-section {
                    break-before: page;
                    padding-bottom: 10mm;
                }
                
                .section-title-center {
                    text-align: center;
                    margin-bottom: 10mm;
                }
                
                .section-title-center h3 {
                    color: #001C38;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 3mm;
                    font-size: 13pt;
                    margin-bottom: 2mm;
                }
                
                .section-title-center p {
                    color: #64748B;
                    font-size: 10pt;
                }
                
                .images-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .image-card {
                    width: 160mm;
                    border-radius: 4mm;
                    overflow: hidden;
                    box-shadow: 0 2mm 6mm rgba(0, 0, 0, 0.1);
                    border: 1px solid #E2E8F0;
                    background: white;
                    margin-bottom: 8mm;
                }
                
                /* Segunda imagen con más espacio arriba */
                .image-card:nth-child(2) {
                    margin-top: 20mm;
                }
                
                /* Tercera imagen con más espacio arriba */
                .image-card:nth-child(3) {
                    margin-top: 20mm;
                }
                
                .image-card img {
                    width: 100%;
                    height: 80mm;
                    object-fit: contain;
                    background: #f8f9fa;
                    padding: 5mm;
                    display: block;
                }
                
                .image-caption {
                    padding: 4mm;
                    background: white;
                    font-weight: 700;
                    color: #001C38;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 3mm;
                    font-size: 11pt;
                    border-top: 1px solid #E2E8F0;
                    text-align: center;
                }
                
                .image-caption i {
                    font-size: 12pt;
                }

                /* FOOTER SOLO EN LA ÚLTIMA PÁGINA */
                .footer {
                    text-align: center;
                    color: #64748B;
                    font-size: 9pt;
                    padding: 5mm 0;
                    border-top: 1px solid #E2E8F0;
                    margin-top: 10mm;
                }
                
                .footer-links {
                    display: flex;
                    justify-content: center;
                    gap: 10mm;
                    margin: 3mm 0;
                }
                
                /* CONTROLES DE SALTO DE PÁGINA */
                .page-break {
                    break-before: page;
                }
                
                .keep-together {
                    break-inside: avoid;
                }
                
                /* Para diagnóstico y validaciones en misma página */
                .diagnosis-validation-group {
                    break-inside: avoid;
                }
                
                /* Contenedor para el contenido principal */
                .main-content {
                    position: relative;
                }

                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    
                    .header {
                        border-radius: 0;
                    }
                    
                    .signature-section,
                    .images-section {
                        break-before: page;
                    }
                    
                    .footer {
                        position: relative;
                        bottom: auto;
                        left: auto;
                        right: auto;
                        width: 100%;
                    }
                }
            </style>
        </head>
        <body>
            <!-- PÁGINA 1: HEADER, CLIENTE Y EQUIPO -->
            <div class="main-content">
                <header class="header">
                    <div class="header-top">
                        <div class="logo-section">
                            <h1>ELECTRÓNICA MANTILLA</h1>
                            <p>Reporte del servicio realizado</p>
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

                <!-- INFORMACIÓN DEL CLIENTE - 2 FILAS DE 2 -->
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
                                <span class="label">Cédula de Identidad</span>
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

                <!-- EQUIPO REVISADO - 2 FILAS DE 3 -->
                <section class="section">
                    <div class="section-header">
                        <i class="fas fa-box"></i> Equipo Revisado
                    </div>
                    <div class="section-body">
                        <div class="equipment-grid">
                            <div class="info-card">
                                <span class="label">Equipo</span>
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
                                    ${checks.garantia ? '<span class="status-badge warranty"><i class="fas fa-shield-alt"></i> En Garantía</span>' : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- PÁGINA 2: DIAGNÓSTICO Y VALIDACIONES -->
            <div class="page-break">
                <div class="diagnosis-validation-group">
                    <!-- DIAGNÓSTICO TÉCNICO -->
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
                                        <i class="fas fa-tools"></i> Recomendaciones dadas al cliente
                                    </div>
                                    <p>${recomendaciones}</p>
                                </div>
                                
                                <div class="diagnosis-card accessories">
                                    <div class="card-title">
                                        <i class="fas fa-box-open"></i> Accesorios Recibidos
                                    </div>
                                    <p>${checks.accesorios ? 'Sí:  ' + accesoriosDesc : 'No se recibieron accesorios'}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- VALIDACIÓN Y VERIFICACIONES -->
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
                                    <i class="${renderCheckIcon(checks.modeloSerieCheck)}"></i> Modelo/Serie Verificado
                                </div>
                                <div class="check-item ${renderCheckClass(checks.conexionesElectricas)}">
                                    <i class="${renderCheckIcon(checks.conexionesElectricas)}"></i> Instalación Eléctrica
                                </div>
                            </div>

                            <div class="status-indicators" style="margin-top: 6mm;">
                                ${checks.garantia ? '<span class="status-badge warranty"><i class="fas fa-shield-alt"></i> En Garantía</span>' : ''}
                                <span class="status-badge complete">
                                    <i class="fas fa-check-double"></i> Reporte Completo
                                </span>
                                <span class="status-badge ${checks.usado ? 'used' : ''}">
                                    <i class="fas fa-history"></i> ${checks.usado ? 'Equipo Usado' : 'Equipo Nuevo'}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <!-- PÁGINA 3: EVIDENCIA FOTOGRÁFICA -->
            <div class="page-break">
                <div class="images-section">
                    <div class="section-title-center">
                        <h3>
                            <i class="fas fa-camera"></i> Imagenes
                        </h3>
                        <p>Registro visual del servicio prestado.</p>
                    </div>
                    
                    <div class="images-container">
                        ${imgModelo ? `
                        <div class="image-card">
                            <img src="${imgModelo}" alt="Modelo y Serie">
                            <div class="image-caption">
                                <i class="fas fa-barcode"></i> Modelo / Número de serie
                            </div>
                        </div>
                        ` : ''}
                        
                        ${imgFactura ? `
                        <div class="image-card">
                            <img src="${imgFactura}" alt="Factura">
                            <div class="image-caption">
                                <i class="fas fa-file-invoice-dollar"></i> Factura
                            </div>
                        </div>
                        ` : ''}
                        
                        ${imgFinal ? `
                        <div class="image-card">
                            <img src="${imgFinal}" alt="Equipo">
                            <div class="image-caption">
                                <i class="fas fa-washing-machine"></i> Estado Eléctrico
                            </div>
                        </div>
                        ` : ''}
                        
                        ${!imgModelo && !imgFactura && !imgFinal ? `
                        <div style="text-align: center; padding: 20mm; color: #64748B;">
                            <i class="fas fa-image" style="font-size: 24pt; margin-bottom: 5mm; opacity: 0.5;"></i>
                            <p style="font-size: 11pt;">No se adjuntaron fotografías en este reporte</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- PÁGINA 4: ACEPTACIÓN Y FOOTER -->
            <div class="page-break">
                <!-- ACEPTACIÓN DEL SERVICIO -->
                <section class="signature-section">
                    <h3 style="color: #001C38; margin-bottom: 5mm; font-size: 13pt;">Firma del cliente</h3>
                    <p style="color: #64748B; max-width: 160mm; margin: 0 auto 6mm; font-size: 10pt;">
                        El cliente valida y acepta la conformidad del servicio técnico prestado.
                    </p>
                    
                    <div style="margin: 5mm 0;">
                        <img src="${firma}" alt="Firma del Cliente" class="signature-img">
                    </div>
                    
                    <div class="signature-name">${nombreCliente}</div>
                    <div class="signature-note">• C.I. ${cedulaCliente || servicio.SERV_CED_REC}</div>
                    <div class="signature-note">Fecha: ${fechaSimple}</div>
                </section>

                <!-- FOOTER SOLO EN ESTA ÚLTIMA PÁGINA -->
                <footer class="footer">
                    <p style="margin-bottom: 2mm;">
                        <strong>LOCAL Nº 1:</strong> Quis Quis 15-203 y Av. Atahualpa • Telfs: (03) 2416124 - (03) 2848891
                    </p>
                    <p style="margin-bottom: 3mm;">
                        <strong>LOCAL Nº 2:</strong> Montalvo 07-20 y Juan Benigno Vela • Telf: (03) 2828365
                    </p>
                    <div class="footer-links">
                        <span><i class="fab fa-whatsapp"></i> 0984139099 / 0986632992</span>
                        <span><i class="fas fa-envelope"></i> emantillacentro@yahoo.es</span>
                        <span><i class="fas fa-map-marker-alt"></i> Ambato - Ecuador</span>
                    </div>
                    <p style="margin-top: 3mm; font-size: 8pt; border-top: 1px solid #E2E8F0; padding-top: 2mm;">
                        Reporte generado el ${fechaActual} • ID: ${servicio.SERV_NUM}
                    </p>
                </footer>
            </div>
        </body>
        </html>`;
};