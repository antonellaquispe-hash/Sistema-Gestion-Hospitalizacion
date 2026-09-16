package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.model.Piso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PisoRepository extends JpaRepository<Piso, Long> {
}
