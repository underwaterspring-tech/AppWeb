package com.underwater.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "empresas")
public class Empresa {

    @Id
    private String id;

    @Field("nombreEmpresa")
    private String nombre;

    private String nit;
    private String direccion;
    private String ciudad;

    @Field("nombreEncargado")
    private String nombreEncargado;

    private String correo;
    private String telefono;
    private String descripcion;
    private String rol;            // siempre VENDEDOR
    private String estado;         // PENDIENTE | APROBADA | RECHAZADA
    private boolean activo;

    @Field("fechaRegistro")
    private String fechaRegistro;

    @Field("usuarioId")
    private String usuarioId;

    public Empresa() {}

    public Empresa(String nombre, String nit, String ciudad, String usuarioId) {
        this.nombre        = nombre;
        this.nit           = nit;
        this.ciudad        = ciudad;
        this.direccion     = ciudad;
        this.usuarioId     = usuarioId;
        this.rol           = "VENDEDOR";
        this.estado        = "PENDIENTE";
        this.activo        = false;
        this.fechaRegistro = java.time.LocalDate.now().toString();
    }

    // Getters & setters
    public String getId()                        { return id; }
    public void   setId(String id)               { this.id = id; }
    public String getNombre()                    { return nombre; }
    public void   setNombre(String n)            { this.nombre = n; }
    public String getNit()                       { return nit; }
    public void   setNit(String n)               { this.nit = n; }
    public String getDireccion()                 { return direccion; }
    public void   setDireccion(String d)         { this.direccion = d; }
    public String getCiudad()                    { return ciudad; }
    public void   setCiudad(String c)            { this.ciudad = c; }
    public String getNombreEncargado()           { return nombreEncargado; }
    public void   setNombreEncargado(String n)   { this.nombreEncargado = n; }
    public String getCorreo()                    { return correo; }
    public void   setCorreo(String c)            { this.correo = c; }
    public String getTelefono()                  { return telefono; }
    public void   setTelefono(String t)          { this.telefono = t; }
    public String getDescripcion()               { return descripcion; }
    public void   setDescripcion(String d)       { this.descripcion = d; }
    public String getRol()                       { return rol; }
    public void   setRol(String r)               { this.rol = r; }
    public String getEstado()                    { return estado; }
    public void   setEstado(String e)            { this.estado = e; }
    public boolean isActivo()                   { return activo; }
    public void   setActivo(boolean a)           { this.activo = a; }
    public String getFechaRegistro()             { return fechaRegistro; }
    public void   setFechaRegistro(String f)     { this.fechaRegistro = f; }
    public String getUsuarioId()                 { return usuarioId; }
    public void   setUsuarioId(String u)         { this.usuarioId = u; }
}
