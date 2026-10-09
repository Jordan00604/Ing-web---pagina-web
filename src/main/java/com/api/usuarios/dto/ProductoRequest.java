package com.api.usuarios.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ProductoRequest(
    @NotBlank String nombre,
    String descripcion,
    @NotNull @DecimalMin("0.01") BigDecimal precio,
    @NotNull @Min(0) Integer stock,
    String categoria,
    String talla,
    String color,
    String imagenUrl
) {}