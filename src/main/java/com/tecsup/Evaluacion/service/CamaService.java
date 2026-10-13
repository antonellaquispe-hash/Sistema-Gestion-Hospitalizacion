package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.exception.ReglaDeNegocioException;
import com.tecsup.Evaluacion.model.Cama;
import com.tecsup.Evaluacion.repository.CamaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CamaService {

    private final CamaRepository repository;

    public CamaService(CamaRepository repository) {
        this.repository = repository;
    }

    public List<Cama> listar() {
        return repository.listarConHabitacionYPiso();
    }

    public List<Cama> listarDisponibles() {
        return repository.findDisponiblesConHabitacionYPiso();
    }

    public Cama crear(Cama cama) {
        if (cama.getEstado() == null || cama.getEstado().isBlank()) {
            throw new ReglaDeNegocioException("El estado de la cama es obligatorio");
        }
        if (cama.getHabitacion() == null || cama.getHabitacion().getId() == null) {
            throw new ReglaDeNegocioException("La habitación de la cama es obligatoria");
        }
        return repository.save(cama);
    }
}