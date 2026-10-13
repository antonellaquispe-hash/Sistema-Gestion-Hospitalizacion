package com.tecsup.Evaluacion.config;

import com.tecsup.Evaluacion.model.Rol;
import com.tecsup.Evaluacion.repository.RolRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class RoleInitializer {

    @Bean
    public ApplicationRunner initializeRoles(RolRepository repository) {
        return args -> {
            for (String nombre : List.of("ADMINISTRADOR", "MÉDICO", "RECEPCIONISTA")) {
                if (repository.findByNombreIgnoreCase(nombre).isEmpty()) {
                    Rol rol = new Rol();
                    rol.setNombre(nombre);
                    rol.setActivo(true);
                    repository.save(rol);
                }
            }
        };
    }
}
