package com.tecsup.Evaluacion.audit;

import com.tecsup.Evaluacion.dto.CamaResponse;
import com.tecsup.Evaluacion.dto.RolResponse;
import com.tecsup.Evaluacion.dto.UsuarioResponse;
import com.tecsup.Evaluacion.model.EntidadIdentificable;
import com.tecsup.Evaluacion.service.AuditoriaService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditoriaAspect {

    private final AuditoriaService auditoriaService;

    public AuditoriaAspect(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @Around("@annotation(auditable)")
    public Object registrarOperacion(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        Object resultado = joinPoint.proceed();
        Long id = obtenerId(resultado, joinPoint.getArgs());
        if (id == null) {
            throw new IllegalStateException("La operación auditable no produjo un identificador de registro");
        }
        auditoriaService.registrar(auditable.operacion(), auditable.entidad(), id.toString());
        return resultado;
    }

    private static Long obtenerId(Object resultado, Object[] argumentos) {
        if (resultado instanceof EntidadIdentificable entidad) {
            return entidad.getId();
        }
        if (resultado instanceof UsuarioResponse usuario) {
            return usuario.id();
        }
        if (resultado instanceof RolResponse rol) {
            return rol.id();
        }
        if (resultado instanceof CamaResponse cama) {
            return cama.id();
        }
        for (Object argumento : argumentos) {
            if (argumento instanceof Long id) {
                return id;
            }
        }
        return null;
    }
}
