package com.tecsup.Evaluacion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearUsuarioRequest(
        @NotBlank @Size(max = 80) String nombreUsuario,
        @NotBlank @Size(max = 160) String nombreCompleto,
        @NotBlank @Size(min = 8, max = 72) String contrasena,
        @NotNull Long rolId
) {}
