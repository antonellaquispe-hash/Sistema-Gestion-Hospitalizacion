package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.model.Cama;
import com.tecsup.Evaluacion.model.Habitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CamaRepository extends JpaRepository<Cama, Long> {

    List<Cama> findByEstado(String estado);

    List<Cama> findByHabitacion(Habitacion habitacion);

    @Query("SELECT c FROM Cama c JOIN FETCH c.habitacion h JOIN FETCH h.piso")
    List<Cama> listarConHabitacionYPiso();

    @Query("SELECT c FROM Cama c JOIN FETCH c.habitacion h JOIN FETCH h.piso WHERE c.estado = 'DISPONIBLE' AND h.activo = true")
    List<Cama> findDisponiblesConHabitacionYPiso();

    boolean existsByHabitacionIdAndEstado(Long habitacionId, String estado);
}
