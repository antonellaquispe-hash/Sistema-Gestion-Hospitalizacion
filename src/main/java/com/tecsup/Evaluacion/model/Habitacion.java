package com.tecsup.Evaluacion.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.List;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "habitaciones")
public class Habitacion implements EntidadIdentificable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;
    private String descripcion;

    @Column(nullable = false)
    private boolean activo = true;

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "piso_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_habitaciones_piso"))
    @JsonIgnoreProperties({"habitaciones"})
    private Piso piso;

    @OneToMany(mappedBy = "habitacion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Cama> camas;

    public Habitacion() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Piso getPiso() { return piso; }
    public void setPiso(Piso piso) { this.piso = piso; }
    public List<Cama> getCamas() { return camas; }
    public void setCamas(List<Cama> camas) { this.camas = camas; }
}
