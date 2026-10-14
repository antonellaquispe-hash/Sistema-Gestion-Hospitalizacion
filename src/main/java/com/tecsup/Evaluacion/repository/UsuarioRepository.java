package com.tecsup.Evaluacion.repository;

import com.tecsup.Evaluacion.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    List<Usuario> findAllByOrderByIdAsc();
    Optional<Usuario> findByNombreUsuarioIgnoreCase(String nombreUsuario);
    @Query("SELECT u FROM Usuario u JOIN FETCH u.rol " +
            "WHERE LOWER(u.nombreUsuario) = LOWER(:nombreUsuario)")
    Optional<Usuario> findWithRolByNombreUsuario(@Param("nombreUsuario") String nombreUsuario);
    boolean existsByNombreUsuarioIgnoreCase(String nombreUsuario);
    boolean existsByNombreUsuarioIgnoreCaseAndIdNot(String nombreUsuario, Long id);
}
