package com.stmoneybarber.backend.service;

import org.springframework.stereotype.Service;

import com.stmoneybarber.backend.model.Notificacao;
import com.stmoneybarber.backend.repository.NotificacaoRepository;

import java.util.List;

@Service
public class NotificacaoService {

    private final NotificacaoRepository repository;

    public NotificacaoService(NotificacaoRepository repository) {
        this.repository = repository;
    }

    public List<Notificacao> listar() {
        return repository.findAll();
    }

    public Notificacao criar(Notificacao notificacao) {
        return repository.save(notificacao);
    }

    public Notificacao atualizar(Long id, Notificacao novaNotificacao) {
        return repository.findById(id).map(n -> {
            n.setTitulo(novaNotificacao.getTitulo());
            n.setDescricao(novaNotificacao.getDescricao());
            n.setImagemUrl(novaNotificacao.getImagemUrl());
            return repository.save(n);
        }).orElseThrow(() -> new RuntimeException("Notificação não encontrada"));
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
