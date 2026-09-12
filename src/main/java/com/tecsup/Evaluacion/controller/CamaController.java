package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.model.Cama;
import com.tecsup.Evaluacion.service.CamaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/camas")
public class CamaController {

    private final CamaService service;

    public CamaController(CamaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Cama> listar() {
        return service.listar();
    }

    @GetMapping("/disponibles")
    public List<Cama> listarDisponibles() {
        return service.listarDisponibles();
    }
}