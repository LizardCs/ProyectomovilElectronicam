const MARCAS_PRINCIPALES = [
    "LG", "SAMSUNG", "SONY", "PANASONIC", "PHILIPS", "DAEWOO",
    "RCA", "MIDEA", "RIVIERA", "ENGY", "GLOBAL", "TCL", "MABE"
];

const MARCAS_EXTRAS = [
    "INDURAMA", "PRIMA", "HACEB", "WHIRLPOOL",
    "ELECTROLUX", "OSTER", "HISENSE", "GENERAL ELECTRIC",
    "SHARP", "TOSHIBA", "HITACHI", "JVC", "AIWA", "AKAI",
    "ZITRO", "AOC", "KANERS", "KONKA", "AUDIOELEC"
];

const PALABRAS_CLAVE_TV = [
    "LEDTV", "LED TV", "TELEVISOR", "TELEVISIÓN", "TELEVISION",
    "SMART TV", "4K", "RECEIVER", "RECEPTOR", "ISDB-T", "FULL-SEG",
    "SINTONIZADOR", "HDTV", "GOOGLE TV"
];

const PALABRAS_CLAVE_LAVADORA = [
    "LAVADORA", "WASHING", "LAVA-SECA", "WASHTOWER", "WASHING MACHINE",
    "LAVER", "LAVE LINGE"
];

const PALABRAS_CLAVE_SECADORA = [
    "SECADORA", "DRYER", "SECADO"
];

const PALABRAS_CLAVE_REFRIGERADORA = [
    "REFRIGERADOR", "REFRIGERADORA", "REFRIGERATOR", "FRIDGE",
    "NEVERA", "CONGELADOR", "FREEZER"
];

const PALABRAS_CLAVE_COCINA = [
    "COCINA", "STOVE", "RANGE", "HORNO", "MICROONDAS", "MICROWAVE"
];

const PALABRAS_CLAVE_AUDIO = [
    "AUDIO", "PARLANTE", "SOUNDBAR", "MINICOMPONENTE", "SPEAKER",
    "SUBWOOFER", "AMPLIFICADOR"
];

const PALABRAS_CLAVE_MONITOR = [
    "MONITOR", "DISPLAY", "PANTALLA", "SCREEN", "PC MONITOR", "FLATRON"
];

const REGEX_MODELO = [
    /MODELO0\s*:?\s*([A-Z0-9][A-Z0-9-]{2,20})(?:\s|$)/i,
    /MODEL\s*(?:NO|Nº|NUM|NUMERO|NUMBER)\.?\s*[\/:EeBb\s]*:?\s*([A-Z0-9][A-Z0-9-]{2,20})(?:\s|$)/i,
    /MODEL\s*(?:NO|Nº|NUM|NUMERO|NUMBER)\.?\s*:?\s*([A-Z0-9][A-Z0-9-]{2,20})(?:\s|$)/i,
    /MODELO\s*:?\s*([A-Z0-9][A-Z0-9-]{2,20})(?:\s|$)/i,
    /MODEL\s*:?\s*([A-Z0-9][A-Z0-9-]{2,20})(?:\s|$)/i,
    /MOD\s+([A-Z0-9][A-Z0-9-]{2,20})(?:\s|$)/i,
    /MOD\.?\s*:?\s*([A-Z0-9][A-Z0-9-]{2,20})(?:\s|$)/i,
];

const REGEX_SERIE_GENERAL = [
    /SERIAL\s*(?:NO|Nº|NUM|NUMERO|NUMBER)\.?\s*:?\s*([A-Z0-9]{6,})/i,
    /(?:S\/N|SERIE|SN|SERIAL|S\/N|NUMERO\s*DE\s*SERIE)\s*:?\s*([A-Z0-9]{6,})/i,
    /(?:S\/N|SERIE|SN|SERIAL|S\/N)\s*:?\s*([A-Z0-9]{6,})/i,
    /(?:CODIGO\s*DE\s*BARRA|BARCODE)\s*:?\s*([A-Z0-9]{6,})/i,
    /NÚMERO\s+DE\s+[\s\S]{0,15}SERIE\s*:?\s*([A-Z0-9]{6,})/i,
    /\b((?!099|179|001)\d{12,18})\b/,
];

const REGEX_SERIE_LAVADORA = [
    /SERIE\s*:?\s*([A-Z0-9]{6,})/i,
    /SER\s+([A-Z0-9]{6,})/i,
    /SERIAL\s*(?:NO|Nº|NUM|NUMERO|NUMBER)\.?\s*:?\s*$/im,
    /\b(\d{3}[A-Z]{4}\d{5})\b/,
    /\b(\d{2}[A-Z]{2}\s*\d{4})\b/,
    /\b([A-Z]{2,3}\d{4,8}[A-Z]{0,3})\b/,
    ...REGEX_SERIE_GENERAL,
];

const REGEX_SERIE_MONITOR = [
    /SERIAL\s*NO\.?\s*[A-Z]?\s*[A-Z]?\s*:?\s*([A-Z0-9]{6,})/i,
    ...REGEX_SERIE_GENERAL,
];

const detectarModelo = (texto) => {
    for (const regex of REGEX_MODELO) {
        const match = texto.match(regex);
        if (match) {
            let modelo = match[1].trim();

            if (modelo.startsWith('-') || /^[A-Z]-/.test(modelo)) {
                const idxGuion = modelo.indexOf('-');
                if (idxGuion !== -1) {
                    modelo = modelo.substring(idxGuion + 1);
                } else {
                    modelo = modelo.replace(/^[-.\s]+/, '');
                }

                if (!modelo || modelo.length < 2) {
                    const resto = texto.substring(texto.indexOf(match[1]) + match[1].length);
                    const siguienteToken = resto.match(/^\s*([A-Z0-9][A-Z0-9-]{2,20})/i);
                    if (siguienteToken) {
                        modelo = siguienteToken[1].trim();
                    }
                }
            }

            modelo = modelo
                .replace(/^[-.\s]+/, '')
                .replace(/[-.\s]+$/, '')
                .replace(/\s+/g, '');

            const palabrasInvalidasModelo = [
                "VOLTAJE", "FRECUENCIA", "POTENCIA", "SINTONIZADOR",
                "RECEPTOR", "IMPORTADO", "DIRECCIÓN", "DIRECCION",
                "FABRICADO", "HECHO", "PRECAUCION", "PRECAUCIÓN",
                "ALIMENTACION", "CONSUMO", "SERIAL", "NUMERO",
                "MODELO", "MODEL", "ELO", "DELO", "ODELO"
            ];

            if (modelo && modelo.length >= 3 && !palabrasInvalidasModelo.includes(modelo)) {
                return modelo;
            }
        }
    }

    const lines = texto.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const lineaActual = lines[i].trim().toUpperCase();
        if (/^MODEL\s*$/.test(lineaActual) || /^MODELO\s*$/.test(lineaActual)) {
            if (i > 0) {
                const lineaAnterior = lines[i - 1].trim();
                const posibleModelo = lineaAnterior.match(/^([A-Z0-9]{4,20})$/);
                if (posibleModelo) {
                    const candidato = posibleModelo[1].toUpperCase();
                    const palabrasInvalidas = [
                        "VOLTAJE", "FRECUENCIA", "POTENCIA", "SINTONIZADOR",
                        "RECEPTOR", "IMPORTADO", "DIRECCIÓN", "DIRECCION",
                        "FABRICADO", "HECHO", "PRECAUCION", "PRECAUCIÓN",
                        "ALIMENTACION", "CONSUMO", "SERIAL", "NUMERO",
                        "MODELO", "MODEL", "CAPACITY", "DIMENSION",
                        "SINO", "ELECTRONICS", "INC"
                    ];
                    if (!palabrasInvalidas.includes(candidato)) {
                        console.log("   📦 Modelo detectado en línea anterior a MODEL:", candidato);
                        return candidato;
                    }
                }
            }
        }
    }

    const patronesModelo = [
        /\b(\d{2,4}[A-Z]{1,}[A-Z0-9]{1,15})\b/gi,
        /\b([A-Z]{1,3}\d{1,3}[A-Z]{1,}[A-Z0-9]{0,15})\b/gi,
        /\b([A-Z0-9]{2,6}-[A-Z0-9]{2,6}(?:-[A-Z0-9]{2,6})?)\b/gi,
    ];

    const palabrasInvalidasModelo = [
        "VOLTAJE", "FRECUENCIA", "POTENCIA", "SINTONIZADOR",
        "RECEPTOR", "IMPORTADO", "DIRECCIÓN", "DIRECCION",
        "FABRICADO", "HECHO", "PRECAUCION", "PRECAUCIÓN",
        "ALIMENTACION", "CONSUMO", "SERIAL", "NUMERO",
        "INTERNACIONAL", "TECNOLOGIA", "GARANTIA", "ADVERTENCIA",
        "ATENCION", "PERSONAL", "SERVICIO", "TECNICO"
    ];

    for (const patron of patronesModelo) {
        const matches = texto.matchAll(patron);
        for (const m of matches) {
            const candidato = m[1].toUpperCase();
            if (
                candidato.length >= 5 &&
                candidato.length <= 20 &&
                /\d/.test(candidato) &&                    
                /[A-Z]/.test(candidato) &&                 
                !palabrasInvalidasModelo.includes(candidato)
            ) {
                console.log("   📦 Modelo detectado por patrón suelto:", candidato);
                return candidato;
            }
        }
    }

    return null;
};

/**
 * Busca el número de serie usando múltiples regex
 */
const detectarSerie = (texto, unidad = "") => {
    let regexes;
    if (unidad === "LAVADORA") {
        regexes = REGEX_SERIE_LAVADORA;
    } else if (unidad === "MONITOR") {
        regexes = REGEX_SERIE_MONITOR;
    } else {
        regexes = REGEX_SERIE_GENERAL;
    }

    for (const regex of regexes) {
        const match = texto.match(regex);
        if (match) {
            if (!match[1] || match[1].trim() === "") {
                const idxMatch = match.index + match[0].length;
                const restante = texto.substring(idxMatch);
                const siguienteLinea = restante.match(/^\s*([A-Z0-9]{4,})\b/im);
                if (siguienteLinea) {
                    const candidato = siguienteLinea[1].trim();
                    if (candidato.length >= 6) {
                        console.log("   🔢 Serie encontrada en línea siguiente:", candidato);
                        return candidato;
                    }
                }
                continue;
            }

            let serie = match[1].trim();

            const palabrasInvalidas = [
                "CORPORATION", "INTERNACIONAL", "TECNOLOGIA", "FABRICANTE",
                "ADVERTENCIA", "PRECAUCION", "VENTILATION", "SERVICEABLE",
                "MODELO", "MODEL", "POTENCIA", "ALIMENTACION", "CONSUMO",
                "HECHO", "ENSAMBLADO", "PAIS", "ORIGEN", "DIRECCION",
                "PRECAUCIÓN", "PRECAUCION", "ATENCION", "ADVERTENCIA",
                "RUC", "CAPACITY", "DIMENSION", "INSPECTOR", "MADE"
            ];

            if (palabrasInvalidas.some(p => serie.toUpperCase().includes(p))) {
                continue;
            }

            const posicionMatch = texto.indexOf(serie);
            const textoCercano = texto.substring(Math.max(0, posicionMatch - 30), posicionMatch);
            if (/RUC|RAZ[ÓO]N|RAZON/.test(textoCercano)) {
                continue;
            }

            const alfanumericos = serie.replace(/[^A-Z0-9]/g, '');
            if (alfanumericos.length < 6) {
                continue;
            }

            return serie.replace(/\s+/g, '');
        }
    }
    return null;
};

/**
 * Busca la marca en el texto
 */
const detectarMarca = (texto) => {
    if (/WH[IRL]{1,6}PO{1,2}[OL]/i.test(texto) || /WH[IRL]{1,6}PO/i.test(texto)) {
        console.log("   🏷️ Marca detectada por patrón flexible: WHIRLPOOL");
        return { marca: "WHIRLPOOL", marcaOtra: "" };
    }
    const marcasExtrasOrdenadas = MARCAS_EXTRAS.sort((a, b) => b.length - a.length);

    for (const marca of marcasExtrasOrdenadas) {
        if (marca.length <= 5) {
            const regexCorta = new RegExp(`\\b${marca}\\b`, 'i');
            if (regexCorta.test(texto)) {
                console.log("   🏷️ Marca extra corta encontrada:", marca);
                return { marca: "OTROS", marcaOtra: marca };
            }
        } else {
            if (texto.includes(marca)) {
                return { marca: "OTROS", marcaOtra: marca };
            }
        }
    }

    const marcasPrincipalesOrdenadas = MARCAS_PRINCIPALES
        .filter(m => m !== "OTROS")
        .sort((a, b) => b.length - a.length);

    for (const marca of marcasPrincipalesOrdenadas) {
        const regex = new RegExp(`\\b${marca}\\b`, 'i');
        if (regex.test(texto)) {
            return { marca, marcaOtra: "" };
        }
    }

    for (const marca of marcasPrincipalesOrdenadas) {
        if (marca.length <= 3) {
            const regexCorta = new RegExp(`\\b${marca}\\b`, 'i');
            if (regexCorta.test(texto)) {
                console.log("   🏷️ Marca corta encontrada:", marca);
                return { marca, marcaOtra: "" };
            }
        } else {
            if (texto.includes(marca)) {
                return { marca, marcaOtra: "" };
            }
        }
    }

    return { marca: "", marcaOtra: "" };
};

/**
 * Detecta el tipo de equipo
 */
const detectarUnidad = (texto, modelo) => {
    if (/FLATRON/i.test(texto)) {
        return "MONITOR";
    }
    if (PALABRAS_CLAVE_TV.some(p => texto.includes(p))) {
        return "TV LED";
    }
    if (PALABRAS_CLAVE_LAVADORA.some(p => texto.includes(p))) {
        return "LAVADORA";
    }
    if (PALABRAS_CLAVE_SECADORA.some(p => texto.includes(p))) {
        return "SECADORA";
    }
    if (PALABRAS_CLAVE_REFRIGERADORA.some(p => texto.includes(p))) {
        return "REFRIGERADORA";
    }
    if (PALABRAS_CLAVE_COCINA.some(p => texto.includes(p))) {
        return "COCINA";
    }
    if (PALABRAS_CLAVE_AUDIO.some(p => texto.includes(p))) {
        return "EQUIPO AUDIO";
    }

    if (modelo) {
        const mod = modelo.toUpperCase();

        if (/^(UN|QN|OLED|KDL|PX|RLED|LED|LCD|DSG|LAS|RL)/.test(mod) ||
            /\d{2}(?=.*(?:TV|LED|PULGADA|INCH|"|''))/.test(mod) ||
            /\d{2,3}"/.test(mod) ||
            /(?:19|22|24|28|32|40|42|43|48|49|50|55|58|60|65|70|75|77|85|86|98)"/.test(mod)) {
            return "TV LED";
        }

        if (/^(WA|WF|WT|WM|WW|WTW)/.test(mod)) {
            return "LAVADORA";
        }

        if (/^(RF|RT|RB|RM)/.test(mod)) {
            return "REFRIGERADORA";
        }

        if (/^(DV|SD|DC)/.test(mod)) {
            return "SECADORA";
        }
        if (/^(VS|VA|VP|VG|VX|LS|U\d|P\d|C\d|S\d|W\d)/i.test(mod)) {
            return "MONITOR";
        }
    }

    return "";
};

export const reconocerSticker = (texto) => {
    const textoLimpio = texto.toUpperCase();

    console.log("🔍 [IA] Iniciando reconocimiento avanzado...");

    // PRIMERO: Detectar unidad (es más fácil y confiable)
    const unidad = detectarUnidad(textoLimpio, null);
    console.log("   📺 Unidad:", unidad || "❌ No detectada");

    // Detectar modelo
    const modelo = detectarModelo(textoLimpio);
    console.log("   📦 Modelo:", modelo || "❌ No detectado");

    // Detectar serie (usando regex específicos según unidad)
    const serie = detectarSerie(textoLimpio, unidad);
    console.log("   🔢 Serie:", serie || "❌ No detectada");

    // Detectar marca
    const { marca, marcaOtra } = detectarMarca(textoLimpio);
    console.log("   🏷️ Marca:", marca || "❌ No detectada", marcaOtra ? `(${marcaOtra})` : "");

    // Si no hay serie, usar el modelo
    const serieFinal = serie || modelo || "";
    if (!serie && modelo) {
        console.log("   💡 Serie copiada del modelo:", modelo);
    }

    const resultado = {
        modelo: modelo || "",
        serie: serieFinal,
        marca: marca || "",
        marcaOtra: marcaOtra || "",
        unidad: unidad || ""
    };

    console.log("═══════════════════════════════════");
    console.log("📋 RESULTADO FINAL:", JSON.stringify(resultado, null, 2));
    console.log("═══════════════════════════════════");

    return resultado;
};