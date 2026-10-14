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
        piso.setId(null);
        validar(piso);
        return repository.save(piso);
    }

    @Auditable(operacion = "MODIFICACION", entidad = "Piso")
    @Transactional
    public Piso editar(Long id, Piso datos) {
        Piso piso = repository.findById(id).orElseThrow(() ->
                new com.tecsup.Evaluacion.exception.RecursoNoEncontradoException("Piso no encontrado"));
        validar(datos);
        piso.setNombre(datos.getNombre().trim());
        piso.setDescripcion(datos.getDescripcion());
        return repository.save(piso);
    }

    private void validar(Piso piso) {
        if (piso.getNombre() == null || piso.getNombre().isBlank()) {
            throw new ReglaDeNegocioException("El nombre del piso es obligatorio");
        }
        if (piso.getNombre().length() > 100 || (piso.getDescripcion() != null && piso.getDescripcion().length() > 255)) {
            throw new ReglaDeNegocioException("Nombre máximo 100 caracteres y descripción máximo 255");
        }
    }
}
