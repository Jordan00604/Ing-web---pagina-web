package com.api.usuarios.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CrearPedidoRequest(
    @NotEmpty @Valid List<ItemPedidoRequest> items
) {}
