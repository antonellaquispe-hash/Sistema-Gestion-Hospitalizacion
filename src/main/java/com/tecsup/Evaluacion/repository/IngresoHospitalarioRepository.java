package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.model.IngresoHospitalario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IngresoHospitalarioRepository extends JpaRepository<IngresoHospitalario, Long> {}