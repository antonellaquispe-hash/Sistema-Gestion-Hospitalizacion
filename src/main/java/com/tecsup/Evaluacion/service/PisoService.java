package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.audit.Auditable;
import com.tecsup.Evaluacion.exception.RecursoNoEncontradoException;
import com.tecsup.Evaluacion.exception.ReglaDeNegocioException;
import com.tecsup.Evaluacion.model.Cama;
import com.tecsup.Evaluacion.model.Piso;
import com.tecsup.Evaluacion.repository.CamaRepository;
import com.tecsup.Evaluacion.repository.HabitacionRepository;
import com.tecsup.Evaluacion.repository.PisoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PisoService {

    private final PisoRepository repository;
    private final HabitacionRepository habitacionRepository;
    private final CamaRepository camaRepository;

    public PisoService(PisoRepository repository, HabitacionRepository habitacionRepository, CamaRepository camaRepository) {
        this.repository = repository;
        this.habitacionRepository = habitacionRepository;
        this.camaRepository = camaRepository;
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
                new RecursoNoEncontradoException("Piso no encontrado"));
        validar(datos);
        piso.setNombre(datos.getNombre().trim());
        piso.setDescripcion(datos.getDescripcion());
        return repository.save(piso);
    }

    @Auditable(operacion = "ELIMINACION", entidad = "Piso")
    @Transactional
    public void eliminar(Long id) {
        Piso piso = repository.findById(id).orElseThrow(() ->
                new RecursoNoEncontradoException("Piso no encontrado"));
        for (com.tecsup.Evaluacion.model.Habitacion habitacion : habitacionRepository.findByPiso(piso)) {
            for (Cama cama : camaRepository.findByHabitacion(habitacion)) {
                if ("OCUPADA".equalsIgnoreCase(cama.getEstado())) {
                    throw new ReglaDeNegocioException(
                            "No se puede eliminar el piso porque tiene una cama ocupada (Cama #" + cama.getId() + ")");
                }
                camaRepository.delete(cama);
            }
            habitacionRepository.delete(habitacion);
        }
        repository.delete(piso);
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
