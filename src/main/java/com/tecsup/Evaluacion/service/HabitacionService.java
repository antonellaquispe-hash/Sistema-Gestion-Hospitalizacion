package com.tecsup.Evaluacion.service;

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
        return repository.save(habitacion);
    }
}
