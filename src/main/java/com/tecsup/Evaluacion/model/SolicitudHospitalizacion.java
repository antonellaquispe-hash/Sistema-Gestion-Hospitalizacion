package com.tecsup.Evaluacion.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes_hospitalizacion")
public class SolicitudHospitalizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "documento_paciente")
    private String documentoPaciente;

    @NotBlank
    @Column(name = "motivo")
    private String motivo;

    @Column(name = "fecha_solicitud")
    private LocalDateTime fechaSolicitud;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private SolicitudEstado estado;

    public SolicitudHospitalizacion() {
    }

    public Long getId() {
        return id;
    }

    public String getDocumentoPaciente() {
        return documentoPaciente;
    }

    public void setDocumentoPaciente(String documentoPaciente) {
        this.documentoPaciente = documentoPaciente;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public LocalDateTime getFechaSolicitud() {
        return fechaSolicitud;
    }

    public void setFechaSolicitud(LocalDateTime fechaSolicitud) {
        this.fechaSolicitud = fechaSolicitud;
    }

    public SolicitudEstado getEstado() {
        return estado;
    }

    public void setEstado(SolicitudEstado estado) {
        this.estado = estado;
    }
}