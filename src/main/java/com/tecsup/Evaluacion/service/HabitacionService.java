package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.exception.RecursoNoEncontradoException;
import com.tecsup.Evaluacion.exception.ReglaDeNegocioException;
import com.tecsup.Evaluacion.audit.Auditable;
import com.tecsup.Evaluacion.model.Habitacion;
import com.tecsup.Evaluacion.model.Piso;
import com.tecsup.Evaluacion.repository.HabitacionRepository;
import com.tecsup.Evaluacion.repository.PisoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HabitacionService {

    private final HabitacionRepository repository;
    private final PisoRepository pisoRepository;
    private final com.tecsup.Evaluacion.repository.CamaRepository camaRepository;

    public HabitacionService(HabitacionRepository repository, PisoRepository pisoRepository,
                             com.tecsup.Evaluacion.repository.CamaRepository camaRepository) {
        this.repository = repository;
        this.pisoRepository = pisoRepository;
        this.camaRepository = camaRepository;
    }

    public List<Habitacion> listar() {
        return repository.listarConPiso();
    }

    public List<Habitacion> listarPorPiso(Long pisoId) {
        return repository.findByPisoIdWithPiso(pisoId);
    }

    @Auditable(operacion = "REGISTRO", entidad = "Habitacion")
    @Transactional
    public Habitacion crear(Habitacion habitacion) {
        habitacion.setId(null);
        habitacion.setActivo(true);
        validar(habitacion);
        return repository.save(habitacion);
    }

    @Auditable(operacion = "MODIFICACION", entidad = "Habitacion")
    @Transactional
    public Habitacion editar(Long id, Habitacion datos) {
        Habitacion habitacion = obtener(id);
        validar(datos);
        if (!habitacion.getPiso().getId().equals(datos.getPiso().getId())
                && camaRepository.existsByHabitacionIdAndEstado(id, "OCUPADA")) {
            throw new ReglaDeNegocioException("No se puede cambiar de piso una habitación con camas ocupadas");
        }
        habitacion.setNumero(datos.getNumero().trim());
        habitacion.setDescripcion(datos.getDescripcion());
        habitacion.setPiso(datos.getPiso());
        return repository.save(habitacion);
    }

    @Auditable(operacion = "MODIFICACION", entidad = "Habitacion")
    @Transactional
    public Habitacion cambiarEstado(Long id, boolean activo) {
        Habitacion habitacion = obtener(id);
        if (!activo && camaRepository.existsByHabitacionIdAndEstado(id, "OCUPADA")) {
            throw new ReglaDeNegocioException("No se puede desactivar una habitación con camas ocupadas");
        }
        habitacion.setActivo(activo);
        return repository.save(habitacion);
    }

    private Habitacion obtener(Long id) {
        return repository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Habitación no encontrada"));
    }

    private void validar(Habitacion habitacion) {
        if (habitacion.getNumero() == null || habitacion.getNumero().isBlank()) {
            throw new ReglaDeNegocioException("El número de la habitación es obligatorio");
        }
        if (habitacion.getPiso() == null || habitacion.getPiso().getId() == null) {
            throw new ReglaDeNegocioException("El piso de la habitación es obligatorio");
        }
        Piso piso = pisoRepository.findById(habitacion.getPiso().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Piso no encontrado"));
        habitacion.setPiso(piso);
        if (habitacion.getNumero().length() > 20 || (habitacion.getDescripcion() != null && habitacion.getDescripcion().length() > 255)) {
            throw new ReglaDeNegocioException("Número máximo 20 caracteres y descripción máximo 255");
        }
    }
}
