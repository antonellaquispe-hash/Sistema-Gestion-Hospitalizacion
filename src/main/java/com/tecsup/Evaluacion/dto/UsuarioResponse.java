package com.tecsup.Evaluacion.dto;

public record UsuarioResponse(
        Long id,
        String nombreUsuario,
        String nombreCompleto,
        boolean activo,
        RolResponse rol
) {}
