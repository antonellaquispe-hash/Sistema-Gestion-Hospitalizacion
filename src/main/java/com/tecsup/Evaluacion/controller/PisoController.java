package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.model.Piso;
import com.tecsup.Evaluacion.service.PisoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pisos")
public class PisoController {

    private final PisoService service;

    public PisoController(PisoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Piso> listar() {
        return service.listar();
    }

    @PostMapping
    public Piso crear(@RequestBody Piso piso) {
        return service.crear(piso);
    }
}
