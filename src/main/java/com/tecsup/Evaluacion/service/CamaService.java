package com.tecsup.Evaluacion.service;

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
        return repository.save(cama);
    }
}