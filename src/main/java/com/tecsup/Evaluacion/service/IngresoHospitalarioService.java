package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.exception.RecursoNoEncontradoException;
import com.tecsup.Evaluacion.exception.ReglaDeNegocioException;
import com.tecsup.Evaluacion.audit.Auditable;
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
import org.springframework.transaction.annotation.Transactional;

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
    @Auditable(operacion = "REGISTRO", entidad = "IngresoHospitalario")
    @Transactional
    public IngresoHospitalario registrarIngreso(Long pacienteId, String motivo) {
        if (motivo == null || motivo.isBlank() || motivo.length() > 500) {
            throw new ReglaDeNegocioException("El motivo es obligatorio y debe tener como máximo 500 caracteres");
        }
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
    @Auditable(operacion = "MODIFICACION", entidad = "IngresoHospitalario")
    @Transactional
    public IngresoHospitalario asignarCama(Long ingresoId, Long camaId) {
        IngresoHospitalario ingreso = ingresoRepository.findById(ingresoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Ingreso hospitalario no encontrado"));

        if (!"ACTIVO".equalsIgnoreCase(ingreso.getEstado())) {
            throw new ReglaDeNegocioException("Solo se puede asignar una cama a un ingreso activo");
        }
        if (ingreso.getCama() != null) {
            throw new ReglaDeNegocioException("El ingreso ya tiene cama; utilice el traslado");
        }

        Cama cama = camaRepository.findById(camaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cama no encontrada"));

        if (!cama.getHabitacion().isActivo() || !"DISPONIBLE".equalsIgnoreCase(cama.getEstado())) {
            throw new ReglaDeNegocioException("La cama seleccionada no se encuentra disponible");
        }

        ingreso.setCama(cama);
        cama.setEstado("OCUPADA");
        camaRepository.save(cama);
        ingresoRepository.save(ingreso);

        // Se reconsulta con fetch completo: evita que Jackson reciba proxies lazy
        return ingresoRepository.buscarConTodoPorId(ingreso.getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Ingreso hospitalario no encontrado"));
    }

    // RF-HOSP-17: Trasladar paciente entre camas
    @Auditable(operacion = "REGISTRO", entidad = "Movimiento")
    @Transactional
    public Movimiento trasladarPaciente(Long ingresoId, Long camaDestinoId,
                                        String motivo, String medicoResponsable,
                                        String usuarioTraslado, String observaciones) {
        IngresoHospitalario ingreso = ingresoRepository.findById(ingresoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Ingreso hospitalario no encontrado"));

        if (!"ACTIVO".equalsIgnoreCase(ingreso.getEstado())) {
            throw new ReglaDeNegocioException("Solo se pueden trasladar ingresos activos");
        }
        if (motivo == null || motivo.isBlank() || motivo.length() > 500
                || medicoResponsable == null || medicoResponsable.isBlank() || medicoResponsable.length() > 150
                || usuarioTraslado == null || usuarioTraslado.isBlank() || usuarioTraslado.length() > 100
                || (observaciones != null && observaciones.length() > 1000)) {
            throw new ReglaDeNegocioException("Los datos del traslado son obligatorios o exceden la longitud permitida");
        }

        Cama camaOrigen = ingreso.getCama();
        if (camaOrigen == null) {
            throw new ReglaDeNegocioException("El paciente no cuenta con una cama asignada para trasladar");
        }

        Cama camaDestino = camaRepository.findById(camaDestinoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cama de destino no encontrada"));

        if (camaOrigen.getId().equals(camaDestino.getId())) {
            throw new ReglaDeNegocioException("La cama de destino debe ser diferente a la cama de origen");
        }

        if (!camaDestino.getHabitacion().isActivo() || !"DISPONIBLE".equalsIgnoreCase(camaDestino.getEstado())) {
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

        Movimiento guardado = movimientoRepository.save(movimiento);
        // Se reconsulta con fetch completo: evita que Jackson reciba proxies lazy
        return movimientoRepository.buscarConTodoPorId(guardado.getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Movimiento no encontrado"));
    }

    public List<IngresoHospitalario> listar() {
        return ingresoRepository.listarConTodo();
    }

    public IngresoHospitalario obtenerPorId(Long id) {
        return ingresoRepository.buscarConTodoPorId(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Ingreso hospitalario no encontrado"));
    }

    @Auditable(operacion = "MODIFICACION", entidad = "IngresoHospitalario")
    @Transactional
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
