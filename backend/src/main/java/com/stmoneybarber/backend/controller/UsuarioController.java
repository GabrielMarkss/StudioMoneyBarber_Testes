package com.stmoneybarber.backend.controller;

import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.stmoneybarber.backend.model.Usuario;
import com.stmoneybarber.backend.repository.UsuarioRepository;
import com.stmoneybarber.backend.service.JwtService;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin("*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Usuario usuario) {
        // Verificar email duplicado
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email já está em uso");
        }

        // Tratar telefone: se vazio ou só espaços, salvar como null
        String telefone = usuario.getTelefone();
        if (telefone != null && !telefone.trim().isEmpty()) {
            if (usuarioRepository.findByTelefone(telefone).isPresent()) {
                return ResponseEntity.badRequest().body("Telefone já está em uso");
            }
        } else {
            usuario.setTelefone(null);
        }

        usuarioRepository.save(usuario);
        return ResponseEntity.ok("Usuário cadastrado com sucesso");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        try {
            String identificador = loginData.get("identificador");
            String senha = loginData.get("senha");

            if (identificador == null || senha == null) {
                return ResponseEntity.badRequest().body("Identificador e senha são obrigatórios");
            }

            Optional<Usuario> usuarioOpt = Optional.empty();

            // Tenta encontrar por email
            if (identificador.contains("@")) {
                usuarioOpt = usuarioRepository.findByEmail(identificador);
            }

            // Se não achou por email, tenta por telefone
            if (usuarioOpt.isEmpty()) {
                usuarioOpt = usuarioRepository.findByTelefone(identificador);
            }

            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                if (usuario.getSenha().equals(senha)) { // Em produção, use hash
                    String token = jwtService.generateToken(usuario.getEmail());
                    return ResponseEntity.ok(Collections.singletonMap("token", token));
                } else {
                    return ResponseEntity.status(401).body("Senha incorreta");
                }
            }

            return ResponseEntity.status(404).body("Usuário não encontrado");

        } catch (Exception e) {
            e.printStackTrace(); // Mostra o erro no console
            return ResponseEntity.status(500).body("Erro interno no servidor: " + e.getMessage());
        }
    }

}
