package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.dto.RolRequest;
import com.tecsup.Evaluacion.dto.RolResponse;
import com.tecsup.Evaluacion.exception.RecursoNoEncontradoException;
import com.tecsup.Evaluacion.exception.ReglaDeNegocioException;
import com.tecsup.Evaluacion.model.Rol;
import com.tecsup.Evaluacion.repository.RolRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class RolService {

    private final RolRepository repository;

    public RolService(RolRepository repository) {
        this.repository = repository;
    }

    public List<RolResponse> listar() {
        return repository.findAll().stream().map(RolService::toResponse).toList();
    }

    public RolResponse crear(RolRequest request) {
        String nombre = normalize(request.nombre());
        if (repository.existsByNombreIgnoreCase(nombre)) {
            throw new ReglaDeNegocioException("Ya existe el rol " + nombre);
        }
        Rol rol = new Rol();
        rol.setNombre(nombre);
        rol.setActivo(true);
        return toResponse(repository.save(rol));
    }

    public RolResponse editar(Long id, RolRequest request) {
        Rol rol = obtener(id);
        String nombre = normalize(request.nombre());
        if (repository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new ReglaDeNegocioException("Ya existe el rol " + nombre);
        }
        rol.setNombre(nombre);
        return toResponse(repository.save(rol));
    }

    public RolResponse cambiarEstado(Long id, boolean activo) {
        Rol rol = obtener(id);
        rol.setActivo(activo);
        return toResponse(repository.save(rol));
    }

    private Rol obtener(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Rol no encontrado"));
    }

    private static String normalize(String nombre) {
        return nombre.trim().toUpperCase(Locale.ROOT);
    }

    private static RolResponse toResponse(Rol rol) {
        return new RolResponse(rol.getId(), rol.getNombre(), rol.isActivo());
    }
}
