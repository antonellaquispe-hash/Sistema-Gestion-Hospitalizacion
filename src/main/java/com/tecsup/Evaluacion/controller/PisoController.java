package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.model.Piso;
import com.tecsup.Evaluacion.service.PisoService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PutMapping("/{id}")
    public Piso editar(@PathVariable Long id, @RequestBody Piso piso) {
        return service.editar(id, piso);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
