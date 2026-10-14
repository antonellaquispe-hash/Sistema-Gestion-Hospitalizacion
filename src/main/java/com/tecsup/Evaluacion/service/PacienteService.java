package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.exception.RecursoNoEncontradoException;
import com.tecsup.Evaluacion.exception.ReglaDeNegocioException;
import com.tecsup.Evaluacion.audit.Auditable;
import com.tecsup.Evaluacion.model.Paciente;
import com.tecsup.Evaluacion.repository.PacienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PacienteService {

    private final PacienteRepository repository;

    public PacienteService(PacienteRepository repository) {
        this.repository = repository;
    }

    public List<Paciente> listar() {
        return repository.findAll();
    }

    public Paciente obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
    }

    @Auditable(operacion = "REGISTRO", entidad = "Paciente")
    @Transactional
    public Paciente crear(Paciente paciente) {
        paciente.setId(null);
        if (paciente.getNombre() == null || paciente.getNombre().isBlank()) {
            throw new ReglaDeNegocioException("El nombre del paciente es obligatorio");
        }
        if (paciente.getDni() == null || paciente.getDni().isBlank()) {
            throw new ReglaDeNegocioException("El DNI del paciente es obligatorio");
        }
        if (repository.existsByDni(paciente.getDni())) {
            throw new ReglaDeNegocioException("Ya existe un paciente con el DNI " + paciente.getDni());
        }
        if (!paciente.getDni().matches("[0-9]{8}")) {
            throw new ReglaDeNegocioException("El DNI debe contener exactamente 8 dígitos");
        }
        if (paciente.getNombre().length() > 150) {
            throw new ReglaDeNegocioException("El nombre no puede superar 150 caracteres");
        }
        return repository.save(paciente);
    }
}
