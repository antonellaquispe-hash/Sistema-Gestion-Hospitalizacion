package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.exception.RecursoNoEncontradoException;
import com.tecsup.Evaluacion.model.Movimiento;
import com.tecsup.Evaluacion.repository.IngresoHospitalarioRepository;
import com.tecsup.Evaluacion.repository.MovimientoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final IngresoHospitalarioRepository ingresoRepository;

    public MovimientoService(MovimientoRepository movimientoRepository,
                             IngresoHospitalarioRepository ingresoRepository) {
        this.movimientoRepository = movimientoRepository;
        this.ingresoRepository = ingresoRepository;
    }

    public List<Movimiento> listar() {
        return movimientoRepository.findAll();
    }

    public List<Movimiento> listarPorIngreso(Long ingresoId) {
        if (!ingresoRepository.existsById(ingresoId)) {
            throw new RecursoNoEncontradoException("Ingreso hospitalario no encontrado");
        }
        return movimientoRepository.findByIngresoId(ingresoId);
    }
}