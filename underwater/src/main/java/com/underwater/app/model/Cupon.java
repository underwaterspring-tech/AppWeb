package com.underwater.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "cupones")
public class Cupon {

    @Id
    private String id;

    private String codigo;
    private String tipo;           // PORCENTAJE | FIJO
    private int    valor;
    private String descripcion;
    private int    minimoCompra;
    private int    usoMaximo;
    private int    usoActual;
    private boolean activo;
    private LocalDateTime fechaExpiracion;
    private LocalDateTime fechaCreacion;

    // ── Quién lo creó ─────────────────────────────────────────────
    private String vendedorId;
    private String vendedorNombre;
    private String empresaId;

    public Cupon() {}

    public String getId()                            { return id; }
    public void   setId(String id)                   { this.id = id; }
    public String getCodigo()                        { return codigo; }
    public void   setCodigo(String c)                { this.codigo = c; }
    public String getTipo()                          { return tipo; }
    public void   setTipo(String t)                  { this.tipo = t; }
    public int    getValor()                         { return valor; }
    public void   setValor(int v)                    { this.valor = v; }
    public String getDescripcion()                   { return descripcion; }
    public void   setDescripcion(String d)           { this.descripcion = d; }
    public int    getMinimoCompra()                  { return minimoCompra; }
    public void   setMinimoCompra(int m)             { this.minimoCompra = m; }
    public int    getUsoMaximo()                     { return usoMaximo; }
    public void   setUsoMaximo(int u)                { this.usoMaximo = u; }
    public int    getUsoActual()                     { return usoActual; }
    public void   setUsoActual(int u)                { this.usoActual = u; }
    public boolean isActivo()                       { return activo; }
    public void   setActivo(boolean a)               { this.activo = a; }
    public LocalDateTime getFechaExpiracion()        { return fechaExpiracion; }
    public void   setFechaExpiracion(LocalDateTime f){ this.fechaExpiracion = f; }
    public LocalDateTime getFechaCreacion()          { return fechaCreacion; }
    public void   setFechaCreacion(LocalDateTime f)  { this.fechaCreacion = f; }
    public String getVendedorId()                    { return vendedorId; }
    public void   setVendedorId(String v)            { this.vendedorId = v; }
    public String getVendedorNombre()                { return vendedorNombre; }
    public void   setVendedorNombre(String v)        { this.vendedorNombre = v; }
    public String getEmpresaId()                     { return empresaId; }
    public void   setEmpresaId(String e)             { this.empresaId = e; }
}
