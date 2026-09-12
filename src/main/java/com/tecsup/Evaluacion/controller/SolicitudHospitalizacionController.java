package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.model.SolicitudEstado;
import com.tecsup.Evaluacion.model.SolicitudHospitalizacion;
import com.tecsup.Evaluacion.service.SolicitudHospitalizacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudHospitalizacionController {

    private final SolicitudHospitalizacionService service;

    public SolicitudHospitalizacionController(SolicitudHospitalizacionService service) {
        this.service = service;
    }

    @GetMapping
    public List<SolicitudHospitalizacion> listar() {
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<SolicitudHospitalizacion> crear(
            @Valid @RequestBody SolicitudHospitalizacion solicitud) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.crear(solicitud));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<SolicitudHospitalizacion> cambiarEstado(
            @PathVariable Long id,
            @RequestParam SolicitudEstado estado) {

        return ResponseEntity.ok(service.cambiarEstado(id, estado));
    }
}