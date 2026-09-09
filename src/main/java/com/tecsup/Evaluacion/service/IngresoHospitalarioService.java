package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.entity.Cama;
import com.tecsup.Evaluacion.entity.IngresoHospitalario;
import com.tecsup.Evaluacion.entity.Paciente;
import com.tecsup.Evaluacion.repository.CamaRepository;
import com.tecsup.Evaluacion.repository.IngresoHospitalarioRepository;
import com.tecsup.Evaluacion.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class IngresoHospitalarioService {

    @Autowired
    private IngresoHospitalarioRepository ingresoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private CamaRepository camaRepository;

    // RF-HOSP-07: Registrar ingreso hospitalario
    public IngresoHospitalario registrarIngreso(Long pacienteId, String motivo) {
        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

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
                .orElseThrow(() -> new RuntimeException("Ingreso hospitalario no encontrado"));

        Cama cama = camaRepository.findById(camaId)
                .orElseThrow(() -> new RuntimeException("Cama no encontrada"));

        if (!"DISPONIBLE".equalsIgnoreCase(cama.getEstado())) {
            throw new RuntimeException("La cama seleccionada no se encuentra disponible");
        }

        ingreso.setCama(cama);
        cama.setEstado("OCUPADA");
        camaRepository.save(cama);

        return ingresoRepository.save(ingreso);
    }
}