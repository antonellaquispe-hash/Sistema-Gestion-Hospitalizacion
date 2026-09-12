package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.model.IngresoHospitalario;
import com.tecsup.Evaluacion.model.Movimiento;
import com.tecsup.Evaluacion.service.IngresoHospitalarioService;
import com.tecsup.Evaluacion.service.MovimientoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingresos")
public class IngresoHospitalarioController {

    @Autowired
    private IngresoHospitalarioService ingresoService;

    @Autowired
    private MovimientoService movimientoService;

    @GetMapping
    public List<IngresoHospitalario> listar() {
        return ingresoService.listar();
    }

    @GetMapping("/{id}")
    public IngresoHospitalario obtenerPorId(@PathVariable Long id) {
        return ingresoService.obtenerPorId(id);
    }

    @GetMapping("/{ingresoId}/movimientos")
    public List<Movimiento> listarMovimientos(@PathVariable Long ingresoId) {
        return movimientoService.listarPorIngreso(ingresoId);
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<IngresoHospitalario> finalizarIngreso(@PathVariable Long id) {
        return ResponseEntity.ok(ingresoService.finalizarIngreso(id));
    }

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

    // RF-HOSP-17: Trasladar paciente entre camas
    @PutMapping("/{ingresoId}/trasladar/{camaDestinoId}")
    public ResponseEntity<Movimiento> trasladarPaciente(
            @PathVariable Long ingresoId,
            @PathVariable Long camaDestinoId,
            @RequestParam String motivo,
            @RequestParam String medicoResponsable,
            @RequestParam String usuarioTraslado,
            @RequestParam(required = false) String observaciones) {
        Movimiento movimiento = ingresoService.trasladarPaciente(
                ingresoId, camaDestinoId, motivo, medicoResponsable, usuarioTraslado, observaciones);
        return ResponseEntity.ok(movimiento);
    }
}