package com.tecsup.Evaluacion.dto;

import com.tecsup.Evaluacion.model.Cama;
import com.tecsup.Evaluacion.model.Habitacion;
import com.tecsup.Evaluacion.model.Piso;

/**
 * Respuesta de Cama con la jerarquía habitación -> piso materializada.
 * Se construye dentro de la transacción para evitar que Jackson intente
 * serializar proxies lazy de Hibernate (ByteBuddyInterceptor).
 */
public record CamaResponse(
        Long id,
        String estado,
        HabitacionResponse habitacion
) {

    public static CamaResponse desde(Cama cama) {
        return new CamaResponse(cama.getId(), cama.getEstado(), habitacion(cama.getHabitacion()));
    }

    private static HabitacionResponse habitacion(Habitacion habitacion) {
        if (habitacion == null) {
            return null;
        }
        return new HabitacionResponse(habitacion.getId(), habitacion.getNumero(),
                habitacion.getDescripcion(), piso(habitacion.getPiso()), habitacion.isActivo());
    }

    private static PisoResponse piso(Piso piso) {
        if (piso == null) {
            return null;
        }
        return new PisoResponse(piso.getId(), piso.getNombre(), piso.getDescripcion());
    }

    public record HabitacionResponse(
            Long id,
            String numero,
            String descripcion,
            PisoResponse piso,
            boolean activo
    ) {}

    public record PisoResponse(
            Long id,
            String nombre,
            String descripcion
    ) {}
}
