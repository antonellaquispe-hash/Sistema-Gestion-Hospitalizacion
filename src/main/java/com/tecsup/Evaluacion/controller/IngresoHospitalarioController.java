package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.model.IngresoHospitalario;
import com.tecsup.Evaluacion.service.IngresoHospitalarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ingresos")
public class IngresoHospitalarioController {

    @Autowired
    private IngresoHospitalarioService ingresoService;

    // RF-HOSP-07: Registrar ingreso hospitalario
    @PostMapping
    public ResponseEntity<IngresoHospitalario> registrarIngreso(@RequestParam Long pacienteId, @RequestParam String motivo) {
        IngresoHospitalario nuevoIngreso = ingresoService.registrarIngreso(pacienteId, motivo);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoIngreso);
    }

    // RF-HOSP-14: Asignar cama disponible
    @PutMapping("/{ingresoId}/asignar-cama/{camaId}")
    public ResponseEntity<IngresoHospitalario> asignarCama(@PathVariable Long ingresoId, @PathVariable Long camaId) {
        IngresoHospitalario ingresoActualizado = ingresoService.asignarCama(ingresoId, camaId);
        return ResponseEntity.ok(ingresoActualizado);
    }
}