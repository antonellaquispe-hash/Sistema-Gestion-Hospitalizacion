package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.model.Cama;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CamaRepository extends JpaRepository<Cama, Long> {

    List<Cama> findByEstado(String estado);
}