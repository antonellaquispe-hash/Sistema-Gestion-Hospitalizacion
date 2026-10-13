package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.dto.CrearUsuarioRequest;
import com.tecsup.Evaluacion.dto.EditarUsuarioRequest;
import com.tecsup.Evaluacion.dto.RolResponse;
import com.tecsup.Evaluacion.dto.UsuarioResponse;
import com.tecsup.Evaluacion.exception.RecursoNoEncontradoException;
import com.tecsup.Evaluacion.exception.ReglaDeNegocioException;
import com.tecsup.Evaluacion.model.Rol;
import com.tecsup.Evaluacion.model.Usuario;
import com.tecsup.Evaluacion.repository.RolRepository;
import com.tecsup.Evaluacion.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository,
                         PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAllByOrderByIdAsc().stream()
                .map(UsuarioService::toResponse).toList();
    }

    @Transactional
    public UsuarioResponse crear(CrearUsuarioRequest request) {
        String nombreUsuario = normalizeUsername(request.nombreUsuario());
        if (usuarioRepository.existsByNombreUsuarioIgnoreCase(nombreUsuario)) {
            throw new ReglaDeNegocioException("Ya existe el usuario " + nombreUsuario);
        }
        Rol rol = obtenerRolActivo(request.rolId());
        Usuario usuario = new Usuario();
        usuario.setNombreUsuario(nombreUsuario);
        usuario.setNombreCompleto(request.nombreCompleto().trim());
        usuario.setContrasenaHash(passwordEncoder.encode(request.contrasena()));
        usuario.setActivo(true);
        usuario.setRol(rol);
        return toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse editar(Long id, EditarUsuarioRequest request) {
        Usuario usuario = obtenerUsuario(id);
        String nombreUsuario = normalizeUsername(request.nombreUsuario());
        if (usuarioRepository.existsByNombreUsuarioIgnoreCaseAndIdNot(nombreUsuario, id)) {
            throw new ReglaDeNegocioException("Ya existe el usuario " + nombreUsuario);
        }
        usuario.setNombreUsuario(nombreUsuario);
        usuario.setNombreCompleto(request.nombreCompleto().trim());
        usuario.setRol(obtenerRolActivo(request.rolId()));
        if (request.contrasena() != null && !request.contrasena().isBlank()) {
            usuario.setContrasenaHash(passwordEncoder.encode(request.contrasena()));
        }
        return toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse cambiarEstado(Long id, boolean activo) {
        Usuario usuario = obtenerUsuario(id);
        usuario.setActivo(activo);
        return toResponse(usuarioRepository.save(usuario));
    }

    private Usuario obtenerUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }

    private Rol obtenerRolActivo(Long id) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Rol no encontrado"));
        if (!rol.isActivo()) {
            throw new ReglaDeNegocioException("No se puede asignar un rol inactivo");
        }
        return rol;
    }

    private static String normalizeUsername(String nombreUsuario) {
        return nombreUsuario.trim().toLowerCase(Locale.ROOT);
    }

    private static UsuarioResponse toResponse(Usuario usuario) {
        Rol rol = usuario.getRol();
        return new UsuarioResponse(usuario.getId(), usuario.getNombreUsuario(),
                usuario.getNombreCompleto(), usuario.isActivo(),
                new RolResponse(rol.getId(), rol.getNombre(), rol.isActivo()));
    }
}
