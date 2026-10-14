package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.dto.CamaResponse;
import com.tecsup.Evaluacion.model.Cama;
import com.tecsup.Evaluacion.service.CamaService;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public CamaResponse crear(@RequestBody Cama cama) {
        return service.crear(cama);
    }
}