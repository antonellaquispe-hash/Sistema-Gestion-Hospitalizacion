package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.exception.ReglaDeNegocioException;
import com.tecsup.Evaluacion.audit.Auditable;
import com.tecsup.Evaluacion.model.Piso;
import com.tecsup.Evaluacion.repository.PisoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Auditable(operacion = "REGISTRO", entidad = "Piso")
    @Transactional
    public Piso crear(Piso piso) {
        if (piso.getNombre() == null || piso.getNombre().isBlank()) {
            throw new ReglaDeNegocioException("El nombre del piso es obligatorio");
        }
        return repository.save(piso);
    }
}
