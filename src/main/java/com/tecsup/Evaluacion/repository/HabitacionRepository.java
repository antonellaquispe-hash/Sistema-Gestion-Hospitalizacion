package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.model.Habitacion;
import com.tecsup.Evaluacion.model.Piso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {

    List<Habitacion> findByPiso(Piso piso);

    @Query("SELECT h FROM Habitacion h JOIN FETCH h.piso")
    List<Habitacion> listarConPiso();

    @Query("SELECT h FROM Habitacion h JOIN FETCH h.piso WHERE h.piso.id = :pisoId")
    List<Habitacion> findByPisoIdWithPiso(Long pisoId);
}
