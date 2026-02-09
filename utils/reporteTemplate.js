// utils/reporteTemplate.js

export const generarHtmlReporte = (data) => {
    const {
        servicio, fechaSimple, fechaActual,
        nombreCliente, cedulaCliente, telefonoCliente, direccionCliente, correoCliente,
        unidad, marca, modeloEq, serieEq, colorEq,
        checks,
        danioReportado, inspeccionEstadoDesc, recomendaciones, accesoriosDesc,
        img1, desc1,
        img2, desc2,
        img3, desc3,
        img4, desc4,
        img5, desc5,
        firma
    } = data;

    const renderCheckIcon = (val) => (val ? 'fas fa-check-circle' : 'far fa-circle');
    const renderCheckClass = (val) => (val ? 'checked' : 'unchecked');

    const renderPhotoCard = (img, desc, titleDefault, iconDefault) => {
        if (!img) return '';
        return `
            <div class="full-img-card">
                <img src="${img}" />
                <div class="full-caption">
                    <i class="${iconDefault}"></i> ${titleDefault}
                    ${desc ? `<div style="font-size: 9pt; font-weight: normal; margin-top: 4px; color: #555;">${desc}</div>` : ''}
                </div>
            </div>
        `;
    };

    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Orden de Servicio - Electrónica Mantilla</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                @page { size: A4; margin: 10mm 12mm; }
                * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                body { font-family: 'Inter', sans-serif; font-size: 9pt; color: #334155; margin: 0 auto; background: #fff; width: 210mm; }

                /* HEADER */
                .header { background: #001C38; color: white; padding: 12px 20px; border-bottom: 4px solid #007BFF; border-radius: 6px 6px 0 0; display: flex; justify-content: space-between; align-items: center; margin-bottom: 4mm; }
                .brand h1 { margin: 0; font-size: 18pt; font-weight: 700; color: white; }
                .brand p { margin: 2px 0 0; font-size: 9pt; color: rgba(255, 255, 255, 0.8); }
                .meta-data { text-align: right; font-size: 9pt; color: rgba(255, 255, 255, 0.9); }
                .order-badge { background: #00A86B; color: white; padding: 4px 12px; border-radius: 50px; font-weight: 600; font-size: 10pt; display: inline-flex; align-items: center; box-shadow: 0 2px 6px rgba(0, 168, 107, 0.3); margin-bottom: 4px; }

                /* ESTRUCTURA */
                .row { display: flex; gap: 4mm; margin-bottom: 3mm; }
                .col { flex: 1; }
                .col-40 { flex: 0 0 40%; }
                .col-60 { flex: 0 0 60%; }

                .box { border: 1px solid #E2E8F0; border-radius: 4px; overflow: hidden; height: 100%; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.03); display: flex; flex-direction: column; }
                .box-header { background: linear-gradient(90deg, #001C38, #00305C); color: white; padding: 4px 10px; font-weight: 600; font-size: 9pt; display: flex; align-items: center; gap: 6px; }
                .box-header i { color: #60A5FA; }
                .box-body { padding: 8px 10px; background: #F8FAFC; flex: 1; }

                /* CAMPOS */
                .field-row { display: flex; margin-bottom: 4px; border-bottom: 1px dashed #E2E8F0; padding-bottom: 2px; }
                .field-row:last-child { border-bottom: none; margin-bottom: 0; }
                .label { font-weight: 600; color: #64748B; width: 35%; font-size: 8pt; text-transform: uppercase; }
                .value { font-weight: 600; color: #001C38; width: 65%; }

                /* BADGES */
                .status-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; font-size: 7.5pt; font-weight: 700; }
                .badge-used { background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.2); }
                .badge-warranty { background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.2); }

                /* DIAGNOSTICO */
                .diag-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .diag-item { background: white; padding: 6px; border-radius: 4px; border-left: 3px solid #007BFF; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .diag-item strong { display: block; font-size: 8pt; color: #001C38; margin-bottom: 3px; }
                .diag-item p { margin: 0; font-size: 8.5pt; color: #475569; }

                /* CHECKLIST */
                .check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
                .check-item { font-size: 8pt; display: flex; align-items: center; gap: 6px; padding: 2px; }
                .checked { color: #10B981; font-weight: 600; }
                .unchecked { color: #94A3B8; }

                /* MINI FOTOS HOJA 1 */
                .mini-gallery { display: flex; gap: 8px; height: 100%; }
                .mini-img-card { flex: 1; border: 1px solid #E2E8F0; background: white; padding: 4px; border-radius: 4px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
                .mini-img-card img { width: 100%; height: 38mm; object-fit: contain; background: #F1F5F9; flex: 1; }
                .mini-caption { font-size: 7.5pt; font-weight: 700; color: #001C38; margin-top: 4px; border-top: 1px solid #E2E8F0; padding-top: 2px; }

                /* FIRMA */
                .signature-area { margin-top: 3mm; border: 1px dashed #CBD5E1; background: #F8FAFC; border-radius: 6px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between; }
                .sig-line { border-top: 1px solid #001C38; width: 70%; margin: 0 auto; padding-top: 2px; font-weight: 700; color: #001C38; }

                /* HOJA 2 */
                .page-break { break-before: page; }
                .full-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 5mm; }
                .full-img-card { background: white; border: 1px solid #E2E8F0; padding: 8px; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); page-break-inside: avoid; }
                .full-img-card img { width: 100%; height: 80mm; object-fit: contain; background: #F8FAFC; margin-bottom: 5px; }
                .full-caption { text-align: center; font-weight: 700; color: #001C38; border-top: 2px solid #007BFF; padding-top: 5px; }

                /* FOOTER */
                .footer { text-align: center; color: #64748B; font-size: 8pt; padding: 5mm 0; border-top: 1px solid #E2E8F0; margin-top: 10mm; break-inside: avoid; }
                .footer-links { display: flex; justify-content: center; gap: 5mm; margin: 2mm 0; font-size: 7.5pt; }
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
                    <div style="margin-top: 4px;"><strong>Técnico:</strong> Carlos Mantilla</div>
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
                            <div class="field-row"><span class="label">Email</span><span class="value" style="font-size: 8pt;">${correoCliente || ''}</span></div>
                            <div class="field-row"><span class="label">Dirección</span><span class="value" style="font-size: 8pt;">${direccionCliente}</span></div>
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
                            <div class="field-row"><span class="label">Color</span><span class="value">${colorEq}</span></div>
                            <div class="field-row">
                                <span class="label">Estado</span>
                                <span class="value">
                                    <span class="status-badge ${checks.usado ? 'badge-used' : 'badge-warranty'}">
                                        <i class="fas fa-history" style="margin-right:4px;"></i> ${checks.usado ? 'USADO' : 'NUEVO'}
                                    </span>
                                    ${checks.garantia ? '<span class="status-badge badge-warranty" style="margin-left: 5px;"><i class="fas fa-shield-alt" style="margin-right:4px;"></i> GARANTÍA</span>' : ''}
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
                                <strong><i class="fas fa-tools" style="color:#10B981;"></i> Recomendaciones dadas al cliente</strong>
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

            <div class="row" style="height: 50mm;">
                <div class="col-40">
                    <div class="box">
                        <div class="box-header"><i class="fas fa-clipboard-check"></i> Verificaciones</div>
                        <div class="box-body check-grid">
                            <div class="check-item ${renderCheckClass(checks.garantia)}"><i class="${renderCheckIcon(checks.garantia)}"></i> Garantía</div>
                            <div class="check-item ${renderCheckClass(checks.papeles)}"><i class="${renderCheckIcon(checks.papeles)}"></i> Papeles</div>
                            <div class="check-item ${renderCheckClass(checks.completo)}"><i class="${renderCheckIcon(checks.completo)}"></i> Caja</div>
                            <div class="check-item ${renderCheckClass(checks.nivelacion)}"><i class="${renderCheckIcon(checks.nivelacion)}"></i> Nivelación</div>
                            <div class="check-item ${renderCheckClass(checks.presionAgua)}"><i class="${renderCheckIcon(checks.presionAgua)}"></i> Presión de agua</div>
                            <div class="check-item ${renderCheckClass(checks.conexionesElectricas)}"><i class="${renderCheckIcon(checks.conexionesElectricas)}"></i> Instalación eléctrica</div>
                        </div>
                    </div>
                </div>

                <div class="col-60">
                    <div class="mini-gallery">
                        <div class="mini-img-card">
                            ${img1 ? `<img src="${img1}" />` : '<div style="flex:1; background:#f1f5f9;"></div>'}
                            <div class="mini-caption"><i class="fas fa-barcode"></i> MODELO / SERIE</div>
                        </div>
                        <div class="mini-img-card">
                            ${img2 ? `<img src="${img2}" />` : '<div style="flex:1; background:#f1f5f9;"></div>'}
                            <div class="mini-caption"><i class="fas fa-camera"></i> ESTADO DE EQUIPO</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="signature-area">
                <div style="font-size: 8pt; color: #64748b; padding-left: 10px; line-height: 1.3; text-align: justify;">
                    <strong>Términos y Condiciones de Servicio Técnico</strong><br><br>
                    
                    <strong>1. Garantía de Servicio:</strong>
                    El establecimiento otorga una garantía limitada de noventa (90) días calendario exclusivamente sobre la mano de obra y la reparación de la falla específica reportada en este documento.
                    Esta garantía entrará en vigencia a partir de la fecha de entrega del equipo.
                    No se cubrirán daños distintos a los aquí descritos ni fallas derivadas de componentes que no fueron intervenidos en la reparación original.
                    <br>                    
                    <strong>2. Almacenaje y Abandono:</strong>
                    Transcurridos 90 días desde la notificación de finalización del servicio, se cobrará una tasa de bodegaje de ley.
                    Conforme al Art. 44 de la LODC, los equipos no retirados en un plazo de 6 meses se considerarán legalmente abandonados, permitiendo al establecimiento disponer de los mismos para recuperar costos de reparación y almacenamiento.
                    <br>                    
                    <strong>3. Exclusiones de Garantía:</strong>
                    La garantía quedará sin efecto si el equipo presenta sellos de seguridad rotos, evidencia de humedad, golpes, fluctuaciones eléctricas externas, o si ha sido manipulado por personal ajeno a este taller. 
                    El valor de chequeo y transporte se define con el cliente, el cual es independiente del costo de reparación y se cancela por adelantado.
                    <br>
                    <strong>4. Protección de Datos (LOPDP):</strong>
                    El cliente autoriza a Electrónica Mantilla al tratamiento de sus datos personales para fines de gestión de servicio, contacto mediante telefonía, WhatsApp, SMS o correo electrónico, y fines comerciales informativos. 
                    El titular podrá ejercer sus derechos de acceso, rectificación o eliminación según lo estipula la Ley Orgánica de Protección de Datos Personales vigente en Ecuador.
                    <br>                    
                    <strong>Declaración de Aceptación:</strong>
                    <br>
                    - Certifico que los datos en este documento son reales y acepto las condiciones arriba indicadas, incluyendo el límite de 90 días de garantía sobre el daño reportado.<br>
                    <strong>NOTA:</strong> ESTE TICKET NO CONSTITUYE PRUEBA DE INGRESO DE ESTE PRODUCTO.<br><br>
                </div>
                <div style="text-align: center; flex: 1;">
                    ${firma ? `<img src="${firma}" style="height: 35px; object-fit:contain; margin-bottom:5px;">` : '<div style="height:35px;"></div>'}
                    <div class="sig-line">${nombreCliente}</div>
                    <div style="font-size: 7.5pt; color: #64748B;">C.I. ${cedulaCliente || servicio.SERV_CED_REC}</div>
                </div>
            </div>

            <div class="page-break">
                <div class="full-gallery">
                    ${renderPhotoCard(img1, desc1, 'MODELO / SERIE', 'fas fa-barcode')}
                    ${renderPhotoCard(img2, desc2, 'ESTADO DEL EQUIPO', 'fas fa-camera')}
                    ${renderPhotoCard(img3, desc3, 'FACTURA / DOCUMENTOS', 'fas fa-file-invoice')}
                    ${renderPhotoCard(img4, desc4, 'VERIFICACIÓN ELÉCTRICA', 'fas fa-bolt')}
                    ${renderPhotoCard(img5, desc5, 'OTROS', 'fas fa-images')}
                </div>

                <footer class="footer">
                    <p style="margin-bottom: 2mm;">
                        <strong>LOCAL 1:</strong> Quis Quis 15-203 y Av. Atahualpa • Telfs: (03) 2416124 - (03) 2848891
                    </p>
                    <p style="margin-bottom: 3mm;">
                        <strong>LOCAL 2:</strong> Montalvo 07-20 y Juan Benigno Vela • Telf: (03) 2828365
                    </p>
                    <div class="footer-links">
                        <span><i class="fab fa-whatsapp"></i> 0984139099 / 0986632992</span>
                        <span><i class="fas fa-envelope"></i> emantillacentro@yahoo.es</span>
                        <span><i class="fas fa-map-marker-alt"></i> Ambato - Ecuador</span>
                    </div>
                    <p style="margin-top: 3mm; font-size: 7.5pt; border-top: 1px solid #E2E8F0; padding-top: 2mm;">
                        Reporte generado: ${fechaActual}
                    </p>
                </footer>
            </div>

        </body>
        </html>`;
};