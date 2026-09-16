package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.model.Habitacion;
import com.tecsup.Evaluacion.model.Piso;
import com.tecsup.Evaluacion.service.HabitacionService;
import com.tecsup.Evaluacion.service.PisoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habitaciones")
public class HabitacionController {

    private final HabitacionService habitacionService;
    private final PisoService pisoService;

    public HabitacionController(HabitacionService habitacionService, PisoService pisoService) {
        this.habitacionService = habitacionService;
        this.pisoService = pisoService;
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
