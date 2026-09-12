package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.model.Paciente;
import com.tecsup.Evaluacion.service.PacienteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    private final PacienteService service;

    public PacienteController(PacienteService service) {
        this.service = service;
    }

    @GetMapping
    public List<Paciente> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Paciente obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<Paciente> crear(@RequestBody Paciente paciente) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(paciente));
    }
}