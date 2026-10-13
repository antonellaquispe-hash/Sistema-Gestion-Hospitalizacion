package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.dto.AuditoriaResponse;
import com.tecsup.Evaluacion.model.Auditoria;
import com.tecsup.Evaluacion.repository.AuditoriaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditoriaService {

    private final AuditoriaRepository repository;

    public AuditoriaService(AuditoriaRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void registrar(String operacion, String entidad, String identificadorRegistro) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String usuario = authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken
                ? "sistema"
                : authentication.getName();
        Auditoria auditoria = new Auditoria();
        auditoria.setUsuario(usuario);
        auditoria.setFechaHora(LocalDateTime.now());
        auditoria.setOperacion(operacion);
        auditoria.setEntidadAfectada(entidad);
        auditoria.setIdentificadorRegistro(identificadorRegistro);
        repository.save(auditoria);
    }

    @Transactional(readOnly = true)
    public List<AuditoriaResponse> listarRecientes() {
        return repository.findAllByOrderByFechaHoraDesc(PageRequest.of(0, 500)).stream()
                .map(auditoria -> new AuditoriaResponse(
                        auditoria.getId(), auditoria.getUsuario(), auditoria.getFechaHora(),
                        auditoria.getOperacion(), auditoria.getEntidadAfectada(),
                        auditoria.getIdentificadorRegistro()))
                .toList();
    }
}
