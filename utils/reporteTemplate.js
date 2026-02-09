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
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                @page {
                    size: A4;
                    margin: 10mm 12mm;
                }
                
                * {
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                body {
                    font-family: 'Inter', sans-serif;
                    font-size: 9pt;
                    color: #334155;
                    margin: 0 auto;
                    background: #fff;
                    width: 210mm;
                }

                /* --- HEADER --- */
                .header {
                    background: #001C38;
                    color: white;
                    padding: 12px 20px;
                    border-bottom: 4px solid #007BFF;
                    border-radius: 6px 6px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4mm;
                }

                .brand h1 {
                    margin: 0;
                    font-size: 18pt;
                    font-weight: 700;
                    color: white;
                }

                .brand p {
                    margin: 2px 0 0;
                    font-size: 9pt;
                    color: rgba(255, 255, 255, 0.8);
                }

                .meta-data {
                    text-align: right;
                    font-size: 9pt;
                    color: rgba(255, 255, 255, 0.9);
                }

                .order-badge {
                    background: #00A86B;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 10pt;
                    display: inline-flex;
                    align-items: center;
                    box-shadow: 0 2px 6px rgba(0, 168, 107, 0.3);
                    margin-bottom: 4px;
                }

                /* --- ESTRUCTURA --- */
                .row {
                    display: flex;
                    gap: 4mm;
                    margin-bottom: 3mm;
                }

                .col { flex: 1; }
                .col-40 { flex: 0 0 40%; }
                .col-60 { flex: 0 0 60%; }

                .box {
                    border: 1px solid #E2E8F0;
                    border-radius: 4px;
                    overflow: hidden;
                    height: 100%;
                    background: white;
                }

                .box-header {
                    background: linear-gradient(90deg, #001C38, #00305C);
                    color: white;
                    padding: 4px 10px;
                    font-weight: 600;
                    font-size: 9pt;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .box-header i { color: #60A5FA; }

                .box-body {
                    padding: 8px 10px;
                    background: #F8FAFC;
                }

                /* --- CAMPOS --- */
                .field-row {
                    display: flex;
                    margin-bottom: 4px;
                    border-bottom: 1px dashed #E2E8F0;
                    padding-bottom: 2px;
                }
                .field-row:last-child { border-bottom: none; margin-bottom: 0; }

                .label {
                    font-weight: 600;
                    color: #64748B;
                    width: 35%;
                    font-size: 8pt;
                    text-transform: uppercase;
                }

                .value {
                    font-weight: 600;
                    color: #001C38;
                    width: 65%;
                }

                /* --- BADGES --- */
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 7.5pt;
                    font-weight: 700;
                }
                .badge-used { background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.2); }
                .badge-warranty { background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.2); }

                /* --- DIAGNÓSTICO --- */
                .diag-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                .diag-item {
                    background: white;
                    padding: 6px;
                    border-radius: 4px;
                    border-left: 3px solid #007BFF;
                }
                .diag-item strong {
                    display: block;
                    font-size: 8pt;
                    color: #001C38;
                    margin-bottom: 3px;
                }
                .diag-item p { margin: 0; font-size: 8.5pt; color: #475569; }

                /* --- CHECKLIST --- */
                .check-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4px;
                }
                .check-item {
                    font-size: 8pt;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .checked { color: #10B981; font-weight: 600; }
                .unchecked { color: #94A3B8; }

                /* --- FIRMA --- */
                .signature-area {
                    margin-top: 3mm;
                    border: 1px dashed #CBD5E1;
                    background: #F8FAFC;
                    border-radius: 6px;
                    padding: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .sig-line {
                    border-top: 1px solid #001C38;
                    width: 70%;
                    margin: 0 auto;
                    padding-top: 2px;
                    font-weight: 700;
                    color: #001C38;
                }

                /* --- GALERÍA PÁGINA 2 --- */
                .page-break { break-before: page; }
                .full-gallery { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 15px; 
                    margin-top: 5mm;
                }
                .full-img-card {
                    background: white;
                    border: 1px solid #E2E8F0;
                    padding: 8px;
                    border-radius: 6px;
                }
                .full-img-card img {
                    width: 100%;
                    height: 80mm;
                    object-fit: contain;
                    background: #F8FAFC;
                }
                .full-caption {
                    text-align: center;
                    font-weight: 700;
                    color: #001C38;
                    border-top: 2px solid #007BFF;
                    padding-top: 5px;
                    margin-top: 5px;
                }

                .footer {
                    text-align: center;
                    color: #64748B;
                    font-size: 8pt;
                    padding: 5mm 0;
                    border-top: 1px solid #E2E8F0;
                    margin-top: 10mm;
                }
            </style>
        </head>
        <body>

            <header class="header">
                <div class="brand">
                    <h1>ELECTRÓNICA MANTILLA</h1>
                    <p>Reporte Técnico y Orden de Servicio</p>
                </div>
                <div class="meta-data">
                    <div class="order-badge">
                        <i class="fas fa-file-invoice" style="margin-right:5px;"></i> Orden: #${servicio.SERV_NUM}
                    </div>
                    <div style="margin-top: 4px;"><strong>Fecha:</strong> ${fechaSimple}</div>
                    <div><strong>Técnico:</strong> Carlos Mantilla</div>
                </div>
            </header>

            <div class="row">
                <div class="col">
                    <div class="box">
                        <div class="box-header"><i class="fas fa-user-circle"></i> Información del Cliente</div>
                        <div class="box-body">
                            <div class="field-row"><span class="label">Cliente</span><span class="value">${nombreCliente}</span></div>
                            <div class="field-row"><span class="label">ID/RUC</span><span class="value">${cedulaCliente || servicio.SERV_CED_REC}</span></div>
                            <div class="field-row"><span class="label">Teléfono</span><span class="value">${telefonoCliente}</span></div>
                            <div class="field-row"><span class="label">Dirección</span><span class="value">${direccionCliente}</span></div>
                        </div>
                    </div>
                </div>

                <div class="col">
                    <div class="box">
                        <div class="box-header"><i class="fas fa-box"></i> Datos del Equipo</div>
                        <div class="box-body">
                            <div class="field-row"><span class="label">Equipo</span><span class="value">${unidad}</span></div>
                            <div class="field-row"><span class="label">Marca</span><span class="value">${marca}</span></div>
                            <div class="field-row"><span class="label">Modelo</span><span class="value">${modeloEq}</span></div>
                            <div class="field-row"><span class="label">Serie</span><span class="value">${serieEq}</span></div>
                            <div class="field-row">
                                <span class="label">Estado</span>
                                <span class="value">
                                    <span class="status-badge ${checks.usado ? 'badge-used' : 'badge-warranty'}">
                                        <i class="fas fa-history"></i> ${checks.usado ? 'USADO' : 'NUEVO'}
                                    </span>
                                    ${checks.garantia ? '<span class="status-badge badge-warranty" style="margin-left:5px;"><i class="fas fa-shield-alt"></i> GARANTÍA</span>' : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col">
                    <div class="box">
                        <div class="box-header"><i class="fas fa-stethoscope"></i> Diagnóstico Técnico</div>
                        <div class="box-body diag-grid">
                            <div class="diag-item">
                                <strong><i class="fas fa-exclamation-triangle" style="color:#EF4444;"></i> Daño Reportado</strong>
                                <p>${danioReportado}</p>
                            </div>
                            <div class="diag-item">
                                <strong><i class="fas fa-search" style="color:#F59E0B;"></i> Observaciones</strong>
                                <p>${inspeccionEstadoDesc}</p>
                            </div>
                            <div class="diag-item">
                                <strong><i class="fas fa-tools" style="color:#10B981;"></i> Recomendaciones</strong>
                                <p>${recomendaciones}</p>
                            </div>
                            <div class="diag-item">
                                <strong><i class="fas fa-box-open" style="color:#3B82F6;"></i> Accesorios</strong>
                                <p>${checks.accesorios ? accesoriosDesc : 'Ninguno'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-40">
                    <div class="box">
                        <div class="box-header"><i class="fas fa-clipboard-check"></i> Verificaciones</div>
                        <div class="box-body check-grid">
                            <div class="check-item ${renderCheckClass(checks.garantia)}"><i class="${renderCheckIcon(checks.garantia)}"></i> Garantía</div>
                            <div class="check-item ${renderCheckClass(checks.papeles)}"><i class="${renderCheckIcon(checks.papeles)}"></i> Papeles</div>
                            <div class="check-item ${renderCheckClass(checks.completo)}"><i class="${renderCheckIcon(checks.completo)}"></i> Caja/Empaque</div>
                            <div class="check-item ${renderCheckClass(checks.nivelacion)}"><i class="${renderCheckIcon(checks.nivelacion)}"></i> Nivelación</div>
                            <div class="check-item ${renderCheckClass(checks.presionAgua)}"><i class="${renderCheckIcon(checks.presionAgua)}"></i> Presión Agua</div>
                            <div class="check-item ${renderCheckClass(checks.conexionesElectricas)}"><i class="${renderCheckIcon(checks.conexionesElectricas)}"></i> Inst. Eléctrica</div>
                        </div>
                    </div>
                </div>
                <div class="col-60">
                     <div class="signature-area" style="height: 100%;">
                        <div style="font-size: 7.5pt; color: #64748b; width: 45%;">
                            <strong>NOTA:</strong> El cliente declara conformidad con el servicio recibido.
                            Garantía sobre la reparación efectuada.
                        </div>
                        <div style="text-align: center; flex: 1;">
                            <img src="${firma}" style="height: 40px; object-fit:contain;">
                            <div class="sig-line">${nombreCliente}</div>
                            <div style="font-size: 7pt; color: #64748B;">C.I. ${cedulaCliente || servicio.SERV_CED_REC}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="page-break">
                <div class="full-gallery">
                    ${imgModelo ? `
                        <div class="full-img-card">
                            <img src="${imgModelo}">
                            <div class="full-caption"><i class="fas fa-barcode"></i> MODELO Y SERIE</div>
                        </div>` : ''}
                    ${imgFactura ? `
                        <div class="full-img-card">
                            <img src="${imgFactura}">
                            <div class="full-caption"><i class="fas fa-file-invoice"></i> FACTURA / COMPROBANTE</div>
                        </div>` : ''}
                    ${imgFinal ? `
                        <div class="full-img-card">
                            <img src="${imgFinal}">
                            <div class="full-caption"><i class="fas fa-check-double"></i> EVIDENCIA FINAL</div>
                        </div>` : ''}
                </div>

                <footer class="footer">
                    <p><strong>LOCAL 1:</strong> Quis Quis 15-203 y Av. Atahualpa • <strong>LOCAL 2:</strong> Montalvo 07-20 y Juan Benigno Vela</p>
                    <p>Ambato - Ecuador • Reporte generado: ${fechaActual}</p>
                </footer>
            </div>
        </body>
        </html>`;
};