package com.tecsup.Evaluacion.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ingresos_hospitalarios")
public class IngresoHospitalario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fechaIngreso;
    private String motivoIngreso;
    private String estado; // "ACTIVO", "FINALIZADO"

    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "cama_id")
    private Cama cama;

    public IngresoHospitalario() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getFechaIngreso() { return fechaIngreso; }
    public void setFechaIngreso(LocalDateTime fechaIngreso) { this.fechaIngreso = fechaIngreso; }

    public String getMotivoIngreso() { return motivoIngreso; }
    public void setMotivoIngreso(String motivoIngreso) { this.motivoIngreso = motivoIngreso; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Paciente getPaciente() { return paciente; }
    public void setPaciente(Paciente paciente) { this.paciente = paciente; }

    public Cama getCama() { return cama; }
    public void setCama(Cama cama) { this.cama = cama; }
}