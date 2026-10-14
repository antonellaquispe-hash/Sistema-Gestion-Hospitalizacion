package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.model.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    @Query("SELECT m FROM Movimiento m " +
           "JOIN FETCH m.ingreso i " +
           "JOIN FETCH i.paciente " +
           "JOIN FETCH m.camaOrigen " +
           "JOIN FETCH m.camaDestino")
    List<Movimiento> listarConTodo();

    @Query("SELECT m FROM Movimiento m " +
           "JOIN FETCH m.ingreso i " +
           "JOIN FETCH i.paciente " +
           "JOIN FETCH m.camaOrigen " +
           "JOIN FETCH m.camaDestino " +
           "WHERE i.id = :ingresoId")
    List<Movimiento> findByIngresoIdConTodo(@Param("ingresoId") Long ingresoId);
}
