package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.model.HospitalizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HospitalizationRequestRepository extends JpaRepository<HospitalizationRequest, Long> {
}