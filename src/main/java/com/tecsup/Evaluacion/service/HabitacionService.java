package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.exception.RecursoNoEncontradoException;
import com.tecsup.Evaluacion.exception.ReglaDeNegocioException;
import com.tecsup.Evaluacion.model.Habitacion;
import com.tecsup.Evaluacion.model.Piso;
import com.tecsup.Evaluacion.repository.HabitacionRepository;
import com.tecsup.Evaluacion.repository.PisoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HabitacionService {

    private final HabitacionRepository repository;
    private final PisoRepository pisoRepository;

    public HabitacionService(HabitacionRepository repository, PisoRepository pisoRepository) {
        this.repository = repository;
        this.pisoRepository = pisoRepository;
    }

    public List<Habitacion> listar() {
        return repository.listarConPiso();
    }

    public List<Habitacion> listarPorPiso(Long pisoId) {
        return repository.findByPisoIdWithPiso(pisoId);
    }

    public Habitacion crear(Habitacion habitacion) {
        if (habitacion.getNumero() == null || habitacion.getNumero().isBlank()) {
            throw new ReglaDeNegocioException("El número de la habitación es obligatorio");
        }
        if (habitacion.getPiso() == null || habitacion.getPiso().getId() == null) {
            throw new ReglaDeNegocioException("El piso de la habitación es obligatorio");
        }
        Piso piso = pisoRepository.findById(habitacion.getPiso().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Piso no encontrado"));
        habitacion.setPiso(piso);
        return repository.save(habitacion);
    }
}
