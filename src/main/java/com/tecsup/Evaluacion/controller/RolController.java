package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.dto.RolRequest;
import com.tecsup.Evaluacion.dto.RolResponse;
import com.tecsup.Evaluacion.service.RolService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RolController {

    private final RolService service;

    public RolController(RolService service) {
        this.service = service;
    }

    @GetMapping
    public List<RolResponse> listar() {
        return service.listar();
    }

    @PostMapping
    public RolResponse crear(@Valid @RequestBody RolRequest request) {
        return service.crear(request);
    }

    @PutMapping("/{id}")
    public RolResponse editar(@PathVariable Long id, @Valid @RequestBody RolRequest request) {
        return service.editar(id, request);
    }

    @PatchMapping("/{id}/estado")
    public RolResponse cambiarEstado(@PathVariable Long id, @RequestParam boolean activo) {
        return service.cambiarEstado(id, activo);
    }
}
