package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.model.IngresoHospitalario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IngresoHospitalarioRepository extends JpaRepository<IngresoHospitalario, Long> {

    @Query("SELECT i FROM IngresoHospitalario i " +
           "LEFT JOIN FETCH i.paciente " +
           "LEFT JOIN FETCH i.cama c " +
           "LEFT JOIN FETCH c.habitacion h " +
           "LEFT JOIN FETCH h.piso")
    List<IngresoHospitalario> listarConTodo();

    @Query("SELECT i FROM IngresoHospitalario i " +
           "LEFT JOIN FETCH i.paciente " +
           "LEFT JOIN FETCH i.cama c " +
           "LEFT JOIN FETCH c.habitacion h " +
           "LEFT JOIN FETCH h.piso " +
           "WHERE i.id = :id")
    Optional<IngresoHospitalario> buscarConTodoPorId(@Param("id") Long id);
}
