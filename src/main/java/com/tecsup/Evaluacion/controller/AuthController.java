package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.dto.LoginRequest;
import com.tecsup.Evaluacion.dto.SesionResponse;
import com.tecsup.Evaluacion.exception.RecursoNoEncontradoException;
import com.tecsup.Evaluacion.model.Usuario;
import com.tecsup.Evaluacion.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final UsuarioRepository usuarioRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          SecurityContextRepository securityContextRepository,
                          UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken csrfToken) {
        return Map.of("token", csrfToken.getToken());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletRequest servletRequest,
                                   HttpServletResponse servletResponse) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                            request.nombreUsuario(), request.contrasena()));
        } catch (AuthenticationException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "Usuario o contraseña incorrectos"));
        }

        if (servletRequest.getSession(false) != null) {
            servletRequest.changeSessionId();
        }
        SecurityContextHolderStrategy strategy = SecurityContextHolder.getContextHolderStrategy();
        SecurityContext context = strategy.createEmptyContext();
        context.setAuthentication(authentication);
        strategy.setContext(context);
        securityContextRepository.saveContext(context, servletRequest, servletResponse);

        Usuario usuario = usuarioRepository.findWithRolByNombreUsuario(authentication.getName())
                .orElseThrow(() -> new AuthenticationServiceException(
                        "No se pudo recuperar el perfil autenticado"));
        return ResponseEntity.ok(toSession(usuario));
    }

    @GetMapping("/me")
    public SesionResponse sesion(Authentication authentication) {
        Usuario usuario = usuarioRepository.findWithRolByNombreUsuario(authentication.getName())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario autenticado no encontrado"));
        return toSession(usuario);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    private static SesionResponse toSession(Usuario usuario) {
        String rol = usuario.getRol().getNombre();
        String rutaInicial = switch (rol) {
            case "ADMINISTRADOR" -> "/usuarios";
            case "MÉDICO", "RECEPCIONISTA" -> "/pacientes";
            default -> "/dashboard";
        };
        return new SesionResponse(usuario.getNombreUsuario(), usuario.getNombreCompleto(),
                rol, rutaInicial);
    }
}
