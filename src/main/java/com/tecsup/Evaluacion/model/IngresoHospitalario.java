package com.tecsup.Evaluacion.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
    @JoinColumn(name = "paciente_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_ingresos_paciente"))
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "cama_id", foreignKey = @ForeignKey(name = "fk_ingresos_cama"))
    private Cama cama;

    @OneToMany(mappedBy = "ingreso", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Movimiento> movimientos = new ArrayList<>();

    @Transient
    @JsonIgnore
    public Habitacion getHabitacion() {
        return cama != null ? cama.getHabitacion() : null;
    }

    @Transient
    @JsonIgnore
    public Piso getPiso() {
        Habitacion h = getHabitacion();
        return h != null ? h.getPiso() : null;
    }

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
    public List<Movimiento> getMovimientos() { return movimientos; }
    public void setMovimientos(List<Movimiento> movimientos) { this.movimientos = movimientos; }
}
