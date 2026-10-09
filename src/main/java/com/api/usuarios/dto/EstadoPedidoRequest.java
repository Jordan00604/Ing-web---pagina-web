package com.api.usuarios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Se conserva el contrato de estado textual, sin inventar transiciones comerciales.
public record EstadoPedidoRequest(@NotBlank @Size(max = 50) String estado) {}
