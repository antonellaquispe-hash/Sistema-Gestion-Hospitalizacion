package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.model.SolicitudHospitalizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitudHospitalizacionRepository extends JpaRepository<SolicitudHospitalizacion, Long> {
}