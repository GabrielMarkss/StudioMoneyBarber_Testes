package com.stmoneybarber.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stmoneybarber.backend.model.Notificacao;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
}
