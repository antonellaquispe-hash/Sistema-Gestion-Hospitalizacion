package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.model.Habitacion;
import com.tecsup.Evaluacion.service.HabitacionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habitaciones")
public class HabitacionController {

    private final HabitacionService habitacionService;

    public HabitacionController(HabitacionService habitacionService) {
        this.habitacionService = habitacionService;
    }

    @GetMapping
    public List<Habitacion> listar() {
        return habitacionService.listar();
    }

    @GetMapping("/por-piso/{pisoId}")
    public List<Habitacion> listarPorPiso(@PathVariable Long pisoId) {
        return habitacionService.listarPorPiso(pisoId);
    }

    @PostMapping
    public Habitacion crear(@RequestBody Habitacion habitacion) {
        return habitacionService.crear(habitacion);
    }
}
