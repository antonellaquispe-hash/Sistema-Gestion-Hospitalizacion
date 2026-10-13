package com.tecsup.Evaluacion.config;

import com.tecsup.Evaluacion.model.Rol;
import com.tecsup.Evaluacion.model.Usuario;
import com.tecsup.Evaluacion.repository.RolRepository;
import com.tecsup.Evaluacion.repository.UsuarioRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class RoleInitializer {

    @Bean
    public ApplicationRunner initializeRoles(
            RolRepository repository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap-admin.username:}") String adminUsername,
            @Value("${app.bootstrap-admin.password:}") String adminPassword) {
        return args -> {
            if (adminUsername.isBlank() != adminPassword.isBlank()) {
                throw new IllegalStateException(
                        "Configure ambas variables BOOTSTRAP_ADMIN_USER y BOOTSTRAP_ADMIN_PASSWORD");
            }
            for (String nombre : List.of("ADMINISTRADOR", "MÉDICO", "RECEPCIONISTA")) {
                if (repository.findByNombreIgnoreCase(nombre).isEmpty()) {
                    Rol rol = new Rol();
                    rol.setNombre(nombre);
                    rol.setActivo(true);
                    repository.save(rol);
                }
            }
            if (!adminUsername.isBlank() && usuarioRepository.count() == 0) {
                if (adminPassword.length() < 8 || adminPassword.length() > 72) {
                    throw new IllegalStateException(
                            "BOOTSTRAP_ADMIN_PASSWORD debe tener entre 8 y 72 caracteres");
                }
                Rol administrador = repository.findByNombreIgnoreCase("ADMINISTRADOR")
                        .orElseThrow(() -> new IllegalStateException("No se pudo crear el rol administrador"));
                Usuario usuario = new Usuario();
                usuario.setNombreUsuario(adminUsername.trim().toLowerCase(java.util.Locale.ROOT));
                usuario.setNombreCompleto("Administrador del sistema");
                usuario.setContrasenaHash(passwordEncoder.encode(adminPassword));
                usuario.setActivo(true);
                usuario.setRol(administrador);
                usuarioRepository.save(usuario);
            }
        };
    }
}
