package com.underwater.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ViewConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/index").setViewName("forward:/index.html");
        registry.addViewController("/login").setViewName("forward:/login.html");
        registry.addViewController("/catalogo").setViewName("forward:/Catalogo.html");
        registry.addViewController("/detalle").setViewName("forward:/detalle.html");
        registry.addViewController("/carrito").setViewName("forward:/carrito.html");
        registry.addViewController("/favoritos").setViewName("forward:/favoritos.html");
        registry.addViewController("/pedidos").setViewName("forward:/pedidos.html");
        registry.addViewController("/mi-cuenta").setViewName("forward:/mi_Cuenta.html");
        registry.addViewController("/panel-admin").setViewName("forward:/panel_Admin.html");
        registry.addViewController("/panel-vendedor").setViewName("forward:/panel_Vendedor.html");
        registry.addViewController("/espera-aprobacion").setViewName("forward:/espera_Aprobacion.html");
        registry.addViewController("/marcas").setViewName("forward:/marcas.html");
        registry.addViewController("/empresas").setViewName("forward:/empresas.html");
        registry.addViewController("/checkout").setViewName("forward:/checkout.html");
        registry.addViewController("/empresas").setViewName("forward:/empresas.html");
    }
}