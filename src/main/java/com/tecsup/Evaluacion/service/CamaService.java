package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.exception.ReglaDeNegocioException;
import com.tecsup.Evaluacion.exception.RecursoNoEncontradoException;
import com.tecsup.Evaluacion.audit.Auditable;
import com.tecsup.Evaluacion.dto.CamaResponse;
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
    public CamaResponse crear(Cama cama) {
        cama.setId(null);
        validar(cama);
        return CamaResponse.desde(repository.save(cama));
    }

    @Auditable(operacion = "MODIFICACION", entidad = "Cama")
    @Transactional
    public CamaResponse editar(Long id, Cama datos) {
        Cama cama = repository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Cama no encontrada"));
        if ("OCUPADA".equalsIgnoreCase(cama.getEstado())) {
            throw new ReglaDeNegocioException("La cama está ocupada; gestione el traslado o alta desde Ingresos");
        }
        validar(datos);
        cama.setEstado(datos.getEstado());
        cama.setHabitacion(datos.getHabitacion());
        return CamaResponse.desde(repository.save(cama));
    }

    @Auditable(operacion = "ELIMINACION", entidad = "Cama")
    @Transactional
    public void eliminar(Long id) {
        Cama cama = repository.findById(id).orElseThrow(() ->
                new RecursoNoEncontradoException("Cama no encontrada"));
        if ("OCUPADA".equalsIgnoreCase(cama.getEstado())) {
            throw new ReglaDeNegocioException("No se puede eliminar una cama ocupada; gestione el alta desde Ingresos");
        }
        repository.delete(cama);
    }

    private void validar(Cama cama) {
        if (cama.getEstado() == null || cama.getEstado().isBlank()) {
            throw new ReglaDeNegocioException("El estado de la cama es obligatorio");
        }
        if (cama.getHabitacion() == null || cama.getHabitacion().getId() == null) {
            throw new ReglaDeNegocioException("La habitación de la cama es obligatoria");
        }
        Habitacion habitacion = habitacionRepository.findById(cama.getHabitacion().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Habitación no encontrada"));
        if (!habitacion.isActivo()) {
            throw new ReglaDeNegocioException("La habitación está inactiva");
        }
        if (!java.util.Set.of("DISPONIBLE", "LIMPIEZA").contains(cama.getEstado())) {
            throw new ReglaDeNegocioException("El estado debe ser DISPONIBLE o LIMPIEZA; la ocupación se gestiona desde Ingresos");
        }
        cama.setHabitacion(habitacion);
    }
}
