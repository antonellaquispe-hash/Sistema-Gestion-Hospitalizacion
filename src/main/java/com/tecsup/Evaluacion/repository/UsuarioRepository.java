package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    List<Usuario> findAllByOrderByIdAsc();
    Optional<Usuario> findByNombreUsuarioIgnoreCase(String nombreUsuario);
    boolean existsByNombreUsuarioIgnoreCase(String nombreUsuario);
    boolean existsByNombreUsuarioIgnoreCaseAndIdNot(String nombreUsuario, Long id);
}
