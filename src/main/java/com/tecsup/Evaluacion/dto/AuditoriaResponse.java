package com.tecsup.Evaluacion.dto;

import java.time.LocalDateTime;

public record AuditoriaResponse(
        Long id,
        String usuario,
        LocalDateTime fechaHora,
        String operacion,
        String entidadAfectada,
        String identificadorRegistro
) {}
