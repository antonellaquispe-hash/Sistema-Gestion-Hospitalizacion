package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.model.IngresoHospitalario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngresoHospitalarioRepository extends JpaRepository<IngresoHospitalario, Long> {

    @Query("SELECT i FROM IngresoHospitalario i JOIN FETCH i.paciente JOIN FETCH i.cama c JOIN FETCH c.habitacion h JOIN FETCH h.piso")
    List<IngresoHospitalario> listarConTodo();
}