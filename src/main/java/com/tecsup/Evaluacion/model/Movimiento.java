package com.tecsup.Evaluacion.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos")
public class Movimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fechaTraslado;
    private String motivo;
    private String medicoResponsable;
    private String usuarioTraslado;
    private String observaciones;

    @ManyToOne
    @JoinColumn(name = "ingreso_id")
    private IngresoHospitalario ingreso;

    @ManyToOne
    @JoinColumn(name = "cama_origen_id")
    private Cama camaOrigen;

    @ManyToOne
    @JoinColumn(name = "cama_destino_id")
    private Cama camaDestino;

    public Movimiento() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getFechaTraslado() { return fechaTraslado; }
    public void setFechaTraslado(LocalDateTime fechaTraslado) { this.fechaTraslado = fechaTraslado; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getMedicoResponsable() { return medicoResponsable; }
    public void setMedicoResponsable(String medicoResponsable) { this.medicoResponsable = medicoResponsable; }

    public String getUsuarioTraslado() { return usuarioTraslado; }
    public void setUsuarioTraslado(String usuarioTraslado) { this.usuarioTraslado = usuarioTraslado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public IngresoHospitalario getIngreso() { return ingreso; }
    public void setIngreso(IngresoHospitalario ingreso) { this.ingreso = ingreso; }

    public Cama getCamaOrigen() { return camaOrigen; }
    public void setCamaOrigen(Cama camaOrigen) { this.camaOrigen = camaOrigen; }

    public Cama getCamaDestino() { return camaDestino; }
    public void setCamaDestino(Cama camaDestino) { this.camaDestino = camaDestino; }
}