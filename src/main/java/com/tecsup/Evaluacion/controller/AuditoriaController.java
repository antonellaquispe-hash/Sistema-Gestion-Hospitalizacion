package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.dto.AuditoriaResponse;
import com.tecsup.Evaluacion.service.AuditoriaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auditorias")
public class AuditoriaController {

    private final AuditoriaService service;

    public AuditoriaController(AuditoriaService service) {
        this.service = service;
    }

    @GetMapping
    public List<AuditoriaResponse> listar() {
        return service.listarRecientes();
    }
}
