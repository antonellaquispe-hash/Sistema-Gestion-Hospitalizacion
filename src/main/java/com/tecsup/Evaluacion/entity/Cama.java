package com.tecsup.Evaluacion.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "camas")
public class Cama {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String estado; // "DISPONIBLE", "OCUPADA"

    public Cama() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}