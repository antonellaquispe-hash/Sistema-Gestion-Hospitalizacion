package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.exception.RecursoNoEncontradoException;
import com.tecsup.Evaluacion.exception.ReglaDeNegocioException;
import com.tecsup.Evaluacion.model.SolicitudEstado;
import com.tecsup.Evaluacion.model.SolicitudHospitalizacion;
import com.tecsup.Evaluacion.repository.SolicitudHospitalizacionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SolicitudHospitalizacionService {

    private final SolicitudHospitalizacionRepository repository;

    public SolicitudHospitalizacionService(SolicitudHospitalizacionRepository repository) {
        this.repository = repository;
    }

    public SolicitudHospitalizacion crear(SolicitudHospitalizacion solicitud) {
        solicitud.setFechaSolicitud(LocalDateTime.now());
        solicitud.setEstado(SolicitudEstado.PENDIENTE);
        return repository.save(solicitud);
    }

    public List<SolicitudHospitalizacion> listar() {
        return repository.findAll();
    }

    public SolicitudHospitalizacion cambiarEstado(Long id, SolicitudEstado nuevoEstado) {
        SolicitudHospitalizacion solicitud = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Solicitud de hospitalización no encontrada"));

        if (solicitud.getEstado() != SolicitudEstado.PENDIENTE) {
            throw new ReglaDeNegocioException("Solo las solicitudes pendientes pueden cambiar de estado");
        }

        solicitud.setEstado(nuevoEstado);
        return repository.save(solicitud);
    }
}