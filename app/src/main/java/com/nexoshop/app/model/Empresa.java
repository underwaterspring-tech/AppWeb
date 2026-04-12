package com.nexoshop.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

// ============================================================
// MODELO: Empresa — coleccion "empresas", BD "empresa"
// ============================================================
@Document(collection = "empresas")
public class Empresa {

    @Id
    private String id;

    private String nombre;

    @Indexed(unique = true)
    private String nit;

    private String ciudad;

    // ID del usuario VENDEDOR dueño de esta empresa
    @Field("usuarioId")
    private String usuarioId;

    // "PENDIENTE", "APROBADA", "RECHAZADA"
    private String estado;

    private boolean activo;

    private LocalDateTime fechaRegistro;

    public Empresa() {}

    // Constructor completo
    public Empresa(String nombre, String nit, String ciudad, String usuarioId) {
        this.nombre        = nombre;
        this.nit           = nit;
        this.ciudad        = ciudad;
        this.usuarioId     = usuarioId;
        this.estado        = "PENDIENTE";
        this.activo        = false;
        this.fechaRegistro = LocalDateTime.now();
    }

    // Getters y Setters
    public String getId()                         { return id; }
    public void   setId(String id)                { this.id = id; }
    public String getNombre()                     { return nombre; }
    public void   setNombre(String n)             { this.nombre = n; }
    public String getNit()                        { return nit; }
    public void   setNit(String n)                { this.nit = n; }
    public String getCiudad()                     { return ciudad; }
    public void   setCiudad(String c)             { this.ciudad = c; }
    public String getUsuarioId()                  { return usuarioId; }
    public void   setUsuarioId(String u)          { this.usuarioId = u; }
    public String getEstado()                     { return estado; }
    public void   setEstado(String e)             { this.estado = e; }
    public boolean isActivo()                     { return activo; }
    public void    setActivo(boolean a)           { this.activo = a; }
    public LocalDateTime getFechaRegistro()       { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime f) { this.fechaRegistro = f; }
}