package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.entity.Cama;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CamaRepository extends JpaRepository<Cama, Long> {}