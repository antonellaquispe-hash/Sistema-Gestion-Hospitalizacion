package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.exception.RecursoNoEncontradoException;
import com.tecsup.Evaluacion.exception.ReglaDeNegocioException;
import com.tecsup.Evaluacion.audit.Auditable;
import com.tecsup.Evaluacion.model.SolicitudEstado;
import com.tecsup.Evaluacion.model.SolicitudHospitalizacion;
import com.tecsup.Evaluacion.repository.SolicitudHospitalizacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SolicitudHospitalizacionService {

    private final SolicitudHospitalizacionRepository repository;

    public SolicitudHospitalizacionService(SolicitudHospitalizacionRepository repository) {
        this.repository = repository;
    }

    @Auditable(operacion = "REGISTRO", entidad = "SolicitudHospitalizacion")
    @Transactional
    public SolicitudHospitalizacion crear(SolicitudHospitalizacion solicitud) {
        solicitud.setFechaSolicitud(LocalDateTime.now());
        solicitud.setEstado(SolicitudEstado.PENDIENTE);
        return repository.save(solicitud);
    }

    public List<SolicitudHospitalizacion> listar() {
        return repository.findAll();
    }

    @Auditable(operacion = "MODIFICACION", entidad = "SolicitudHospitalizacion")
    @Transactional
    public SolicitudHospitalizacion cambiarEstado(Long id, SolicitudEstado nuevoEstado) {
        SolicitudHospitalizacion solicitud = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Solicitud de hospitalización no encontrada"));

        if (solicitud.getEstado() != SolicitudEstado.PENDIENTE) {
            throw new ReglaDeNegocioException("Solo las solicitudes pendientes pueden cambiar de estado");
        }

        if (nuevoEstado == null || nuevoEstado == SolicitudEstado.PENDIENTE) {
            throw new ReglaDeNegocioException("El nuevo estado debe ser APROBADA, RECHAZADA o CANCELADA");
        }

        solicitud.setEstado(nuevoEstado);
        return repository.save(solicitud);
    }

    @Auditable(operacion = "ELIMINACION", entidad = "SolicitudHospitalizacion")
    @Transactional
    public void eliminarPendiente(Long id) {
        SolicitudHospitalizacion solicitud = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Solicitud de hospitalización no encontrada"));
        if (solicitud.getEstado() != SolicitudEstado.PENDIENTE) {
            throw new ReglaDeNegocioException("Solo se pueden eliminar solicitudes pendientes");
        }
        repository.delete(solicitud);
    }
}