package com.tecsup.Evaluacion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RolRequest(
        @NotBlank @Size(max = 40) String nombre
) {}
