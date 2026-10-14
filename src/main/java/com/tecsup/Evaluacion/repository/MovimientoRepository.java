package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.model.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    @Query("SELECT m FROM Movimiento m " +
           "JOIN FETCH m.ingreso i " +
           "JOIN FETCH i.paciente " +
           "LEFT JOIN FETCH i.cama ic " +
           "LEFT JOIN FETCH ic.habitacion ich " +
           "LEFT JOIN FETCH ich.piso " +
           "JOIN FETCH m.camaOrigen co " +
           "JOIN FETCH co.habitacion coh " +
           "JOIN FETCH coh.piso " +
           "JOIN FETCH m.camaDestino cd " +
           "JOIN FETCH cd.habitacion cdh " +
           "JOIN FETCH cdh.piso")
    List<Movimiento> listarConTodo();

    @Query("SELECT m FROM Movimiento m " +
           "JOIN FETCH m.ingreso i " +
           "JOIN FETCH i.paciente " +
           "LEFT JOIN FETCH i.cama ic " +
           "LEFT JOIN FETCH ic.habitacion ich " +
           "LEFT JOIN FETCH ich.piso " +
           "JOIN FETCH m.camaOrigen co " +
           "JOIN FETCH co.habitacion coh " +
           "JOIN FETCH coh.piso " +
           "JOIN FETCH m.camaDestino cd " +
           "JOIN FETCH cd.habitacion cdh " +
           "JOIN FETCH cdh.piso " +
           "WHERE i.id = :ingresoId")
    List<Movimiento> findByIngresoIdConTodo(@Param("ingresoId") Long ingresoId);

    @Query("SELECT m FROM Movimiento m " +
           "JOIN FETCH m.ingreso i " +
           "JOIN FETCH i.paciente " +
           "LEFT JOIN FETCH i.cama ic " +
           "LEFT JOIN FETCH ic.habitacion ich " +
           "LEFT JOIN FETCH ich.piso " +
           "JOIN FETCH m.camaOrigen co " +
           "JOIN FETCH co.habitacion coh " +
           "JOIN FETCH coh.piso " +
           "JOIN FETCH m.camaDestino cd " +
           "JOIN FETCH cd.habitacion cdh " +
           "JOIN FETCH cdh.piso " +
           "WHERE m.id = :id")
    Optional<Movimiento> buscarConTodoPorId(@Param("id") Long id);
}
