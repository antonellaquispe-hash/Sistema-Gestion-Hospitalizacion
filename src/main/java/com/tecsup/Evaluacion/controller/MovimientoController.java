package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.model.Movimiento;
import com.tecsup.Evaluacion.service.MovimientoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {

    private final MovimientoService service;

    public MovimientoController(MovimientoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Movimiento> listar() {
        return service.listar();
    }
}