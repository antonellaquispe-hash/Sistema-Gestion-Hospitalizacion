package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    boolean existsByDni(String dni);
}