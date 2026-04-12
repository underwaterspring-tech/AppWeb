package com.nexoshop.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "productos")
public class Producto {

    @Id
    private String id;

    private String nombre;
    private String marca;
    private String categoria;
    private String genero;
    private String descripcion;

    private int precio;
    private Integer precioDescuento;

    private List<String> tallas;
    private List<String> colores;

    private int stock;
    private Map<String, Integer> stockPorTalla;

    private String vendedorId;
    private String empresaId;

    private String estado; // "ACTIVO", "BORRADOR", "SUSPENDIDO"
    private boolean publicado;

    private LocalDateTime fechaRegistro;

    // ── IMÁGENES ───────────────────────────────────────────────────
    // Lista de rutas relativas, ej: ["/uploads/productos/abc123_1.jpg", ...]
    // La primera es la imagen principal que se muestra en el catálogo.
    private List<String> imagenes;

    // ── Constructores ──────────────────────────────────────────────
    public Producto() {
    }

    public Producto(String nombre, String marca, String categoria,
            String genero, String descripcion, int precio,
            Integer precioDescuento, List<String> tallas,
            List<String> colores, String vendedorId,
            String empresaId, boolean publicado) {
        this.nombre = nombre;
        this.marca = marca;
        this.categoria = categoria;
        this.genero = genero;
        this.descripcion = descripcion;
        this.precio = precio;
        this.precioDescuento = precioDescuento;
        this.tallas = tallas;
        this.colores = colores;
        this.vendedorId = vendedorId;
        this.empresaId = empresaId;
        this.publicado = publicado;
        this.estado = publicado ? "ACTIVO" : "BORRADOR";
        this.fechaRegistro = LocalDateTime.now();
    }

    // ── Getters & Setters ──────────────────────────────────────────
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String n) {
        this.nombre = n;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String m) {
        this.marca = m;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String c) {
        this.categoria = c;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String g) {
        this.genero = g;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String d) {
        this.descripcion = d;
    }

    public int getPrecio() {
        return precio;
    }

    public void setPrecio(int p) {
        this.precio = p;
    }

    public Integer getPrecioDescuento() {
        return precioDescuento;
    }

    public void setPrecioDescuento(Integer p) {
        this.precioDescuento = p;
    }

    public List<String> getTallas() {
        return tallas;
    }

    public void setTallas(List<String> t) {
        this.tallas = t;
    }

    public List<String> getColores() {
        return colores;
    }

    public void setColores(List<String> c) {
        this.colores = c;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int s) {
        this.stock = s;
    }

    public Map<String, Integer> getStockPorTalla() {
        return stockPorTalla;
    }

    public void setStockPorTalla(Map<String, Integer> s) {
        this.stockPorTalla = s;
    }

    public String getVendedorId() {
        return vendedorId;
    }

    public void setVendedorId(String v) {
        this.vendedorId = v;
    }

    public String getEmpresaId() {
        return empresaId;
    }

    public void setEmpresaId(String e) {
        this.empresaId = e;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String e) {
        this.estado = e;
    }

    public boolean isPublicado() {
        return publicado;
    }

    public void setPublicado(boolean p) {
        this.publicado = p;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime f) {
        this.fechaRegistro = f;
    }

    public List<String> getImagenes() {
        return imagenes;
    }

    public void setImagenes(List<String> i) {
        this.imagenes = i;
    }
}