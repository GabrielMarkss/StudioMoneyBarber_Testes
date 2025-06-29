package com.stmoneybarber.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.stmoneybarber.backend.model.Notificacao;
import com.stmoneybarber.backend.service.NotificacaoService;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notificacoes")
@CrossOrigin(origins = "*")
public class NotificacaoController {

    private final NotificacaoService service;

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    public NotificacaoController(NotificacaoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Notificacao> listar() {
        return service.listar();
    }

    @PostMapping
    public Notificacao criar(
            @RequestParam("titulo") String titulo,
            @RequestParam("descricao") String descricao,
            @RequestParam(value = "imagem", required = false) MultipartFile imagem) throws IOException {

        String imagePath = null;
        if (imagem != null && !imagem.isEmpty()) {
            File dir = new File(uploadDir);
            if (!dir.exists())
                dir.mkdirs();

            String fileName = UUID.randomUUID() + "_" + imagem.getOriginalFilename();
            File dest = new File(dir, fileName);
            imagem.transferTo(dest);
            imagePath = "/uploads/" + fileName;
        }

        Notificacao nova = new Notificacao();
        nova.setTitulo(titulo);
        nova.setDescricao(descricao);
        nova.setImagemUrl(imagePath);

        return service.criar(nova);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Notificacao> atualizar(@PathVariable Long id, @RequestBody Notificacao notificacao) {
        return ResponseEntity.ok(service.atualizar(id, notificacao));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
