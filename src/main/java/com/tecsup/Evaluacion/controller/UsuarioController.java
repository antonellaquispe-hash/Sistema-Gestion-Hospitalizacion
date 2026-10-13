package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.dto.CrearUsuarioRequest;
import com.tecsup.Evaluacion.dto.EditarUsuarioRequest;
import com.tecsup.Evaluacion.dto.UsuarioResponse;
import com.tecsup.Evaluacion.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return service.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse crear(@Valid @RequestBody CrearUsuarioRequest request) {
        return service.crear(request);
    }

    @PutMapping("/{id}")
    public UsuarioResponse editar(@PathVariable Long id,
                                  @Valid @RequestBody EditarUsuarioRequest request) {
        return service.editar(id, request);
    }

    @PatchMapping("/{id}/estado")
    public UsuarioResponse cambiarEstado(@PathVariable Long id, @RequestParam boolean activo) {
        return service.cambiarEstado(id, activo);
    }
}
