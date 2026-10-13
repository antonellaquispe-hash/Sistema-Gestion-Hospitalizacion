package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.exception.ReglaDeNegocioException;
import com.tecsup.Evaluacion.exception.RecursoNoEncontradoException;
import com.tecsup.Evaluacion.audit.Auditable;
import com.tecsup.Evaluacion.model.Cama;
import com.tecsup.Evaluacion.model.Habitacion;
import com.tecsup.Evaluacion.repository.CamaRepository;
import com.tecsup.Evaluacion.repository.HabitacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CamaService {

    private final CamaRepository repository;
    private final HabitacionRepository habitacionRepository;

    public CamaService(CamaRepository repository, HabitacionRepository habitacionRepository) {
        this.repository = repository;
        this.habitacionRepository = habitacionRepository;
    }

    public List<Cama> listar() {
        return repository.listarConHabitacionYPiso();
    }

    public List<Cama> listarDisponibles() {
        return repository.findDisponiblesConHabitacionYPiso();
    }

    @Auditable(operacion = "REGISTRO", entidad = "Cama")
    @Transactional
    public Cama crear(Cama cama) {
        if (cama.getEstado() == null || cama.getEstado().isBlank()) {
            throw new ReglaDeNegocioException("El estado de la cama es obligatorio");
        }
        if (cama.getHabitacion() == null || cama.getHabitacion().getId() == null) {
            throw new ReglaDeNegocioException("La habitación de la cama es obligatoria");
        }
        Habitacion habitacion = habitacionRepository.findById(cama.getHabitacion().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Habitación no encontrada"));
        cama.setHabitacion(habitacion);
        return repository.save(cama);
    }
}