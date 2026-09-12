package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.exception.RecursoNoEncontradoException;
import com.tecsup.Evaluacion.exception.ReglaDeNegocioException;
import com.tecsup.Evaluacion.model.Cama;
import com.tecsup.Evaluacion.model.IngresoHospitalario;
import com.tecsup.Evaluacion.model.Movimiento;
import com.tecsup.Evaluacion.model.Paciente;
import com.tecsup.Evaluacion.repository.CamaRepository;
import com.tecsup.Evaluacion.repository.IngresoHospitalarioRepository;
import com.tecsup.Evaluacion.repository.MovimientoRepository;
import com.tecsup.Evaluacion.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IngresoHospitalarioService {

    @Autowired
    private IngresoHospitalarioRepository ingresoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private CamaRepository camaRepository;

    @Autowired
    private MovimientoRepository movimientoRepository;

    // RF-HOSP-07: Registrar ingreso hospitalario
    public IngresoHospitalario registrarIngreso(Long pacienteId, String motivo) {
        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));

        IngresoHospitalario ingreso = new IngresoHospitalario();
        ingreso.setPaciente(paciente);
        ingreso.setMotivoIngreso(motivo);
        ingreso.setFechaIngreso(LocalDateTime.now());
        ingreso.setEstado("ACTIVO");

        return ingresoRepository.save(ingreso);
    }

    // RF-HOSP-14: Asignar cama disponible a paciente
    public IngresoHospitalario asignarCama(Long ingresoId, Long camaId) {
        IngresoHospitalario ingreso = ingresoRepository.findById(ingresoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Ingreso hospitalario no encontrado"));

        Cama cama = camaRepository.findById(camaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cama no encontrada"));

        if (!"DISPONIBLE".equalsIgnoreCase(cama.getEstado())) {
            throw new ReglaDeNegocioException("La cama seleccionada no se encuentra disponible");
        }

        ingreso.setCama(cama);
        cama.setEstado("OCUPADA");
        camaRepository.save(cama);

        return ingresoRepository.save(ingreso);
    }

    // RF-HOSP-17: Trasladar paciente entre camas
    public Movimiento trasladarPaciente(Long ingresoId, Long camaDestinoId,
                                        String motivo, String medicoResponsable,
                                        String usuarioTraslado, String observaciones) {
        IngresoHospitalario ingreso = ingresoRepository.findById(ingresoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Ingreso hospitalario no encontrado"));

        Cama camaOrigen = ingreso.getCama();
        if (camaOrigen == null) {
            throw new ReglaDeNegocioException("El paciente no cuenta con una cama asignada para trasladar");
        }

        Cama camaDestino = camaRepository.findById(camaDestinoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cama de destino no encontrada"));

        if (camaOrigen.getId().equals(camaDestino.getId())) {
            throw new ReglaDeNegocioException("La cama de destino debe ser diferente a la cama de origen");
        }

        if (!"DISPONIBLE".equalsIgnoreCase(camaDestino.getEstado())) {
            throw new ReglaDeNegocioException("La cama de destino no se encuentra disponible");
        }

        // RF-HOSP-19: Actualizar estado de las camas involucradas
        camaOrigen.setEstado("DISPONIBLE");
        camaRepository.save(camaOrigen);

        camaDestino.setEstado("OCUPADA");
        camaRepository.save(camaDestino);

        ingreso.setCama(camaDestino);
        ingresoRepository.save(ingreso);

        // RF-HOSP-18: Registrar historial completo de movimientos
        Movimiento movimiento = new Movimiento();
        movimiento.setIngreso(ingreso);
        movimiento.setCamaOrigen(camaOrigen);
        movimiento.setCamaDestino(camaDestino);
        movimiento.setFechaTraslado(LocalDateTime.now());
        movimiento.setMotivo(motivo);
        movimiento.setMedicoResponsable(medicoResponsable);
        movimiento.setUsuarioTraslado(usuarioTraslado);
        movimiento.setObservaciones(observaciones);

        return movimientoRepository.save(movimiento);
    }

    public List<IngresoHospitalario> listar() {
        return ingresoRepository.findAll();
    }

    public IngresoHospitalario obtenerPorId(Long id) {
        return ingresoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Ingreso hospitalario no encontrado"));
    }

    public IngresoHospitalario finalizarIngreso(Long id) {
        IngresoHospitalario ingreso = obtenerPorId(id);

        if (!"ACTIVO".equalsIgnoreCase(ingreso.getEstado())) {
            throw new ReglaDeNegocioException("Solo los ingresos activos pueden finalizarse");
        }

        Cama cama = ingreso.getCama();
        if (cama != null) {
            cama.setEstado("DISPONIBLE");
            camaRepository.save(cama);
        }

        ingreso.setEstado("FINALIZADO");
        return ingresoRepository.save(ingreso);
    }
}