package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.model.Piso;
import com.tecsup.Evaluacion.repository.PisoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PisoService {

    private final PisoRepository repository;

    public PisoService(PisoRepository repository) {
        this.repository = repository;
    }

    public List<Piso> listar() {
        return repository.findAll();
    }

    public Piso crear(Piso piso) {
        return repository.save(piso);
    }
}
