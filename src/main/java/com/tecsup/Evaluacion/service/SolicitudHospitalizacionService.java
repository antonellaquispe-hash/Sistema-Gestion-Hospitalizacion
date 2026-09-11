package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.model.SolicitudEstado;
import com.tecsup.Evaluacion.model.SolicitudHospitalizacion;
import com.tecsup.Evaluacion.repository.SolicitudHospitalizacionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

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

    public SolicitudHospitalizacion cambiarEstado(Long id, SolicitudEstado nuevoEstado) {
        SolicitudHospitalizacion solicitud = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud de hospitalización no encontrada"));

        if (solicitud.getEstado() != SolicitudEstado.PENDIENTE) {
            throw new RuntimeException("Solo las solicitudes pendientes pueden cambiar de estado");
        }

        solicitud.setEstado(nuevoEstado);
        return repository.save(solicitud);
    }
}