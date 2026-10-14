package com.tecsup.Evaluacion.dto;

public record SesionResponse(
        String nombreUsuario,
        String nombreCompleto,
        String rol,
        String rutaInicial
) {}
