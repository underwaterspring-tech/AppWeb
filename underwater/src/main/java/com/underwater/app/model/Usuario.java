package com.underwater.app.model;

import org.springframework.data.annotation.Id;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "usuarios")
public class Usuario {

    @Id
    private String id;

    private String nombre;

    @Indexed(unique = true)
    @Field("correo")
    private String email;

    private String telefono;
    private String direccion;
    @JsonIgnore
    private String password;
    private String rol;        // COMPRADOR | VENDEDOR
    private boolean activo;

    @Field("fechaRegistro")
    private String fechaRegistro;

    // ── Carrito embebido ──────────────────────────────────────────
    private List<ItemCarrito> carrito = new ArrayList<>();

    // ── Favoritos embebidos (lista de productoIds) ────────────────
    private List<String> favoritos = new ArrayList<>();

    public Usuario() {}

    public Usuario(String nombre, String email, String telefono, String password) {
        this.nombre        = nombre;
        this.email         = email;
        this.telefono      = telefono;
        this.password      = password;
        this.rol           = "COMPRADOR";
        this.activo        = true;
        this.fechaRegistro = java.time.LocalDate.now().toString();
        this.carrito       = new ArrayList<>();
        this.favoritos     = new ArrayList<>();
    }

    // Getters & setters
    public String getId()                         { return id; }
    public void   setId(String id)                { this.id = id; }
    public String getNombre()                     { return nombre; }
    public void   setNombre(String n)             { this.nombre = n; }
    public String getEmail()                      { return email; }
    public void   setEmail(String e)              { this.email = e; }
    public String getTelefono()                   { return telefono; }
    public void   setTelefono(String t)           { this.telefono = t; }
    public String getDireccion()                  { return direccion; }
    public void   setDireccion(String d)          { this.direccion = d; }
    public String getPassword()                   { return password; }
    public void   setPassword(String p)           { this.password = p; }
    public String getRol()                        { return rol; }
    public void   setRol(String r)                { this.rol = r; }
    public boolean isActivo()                    { return activo; }
    public void   setActivo(boolean a)            { this.activo = a; }
    public String getFechaRegistro()              { return fechaRegistro; }
    public void   setFechaRegistro(String f)      { this.fechaRegistro = f; }
    public List<ItemCarrito> getCarrito()         { return carrito != null ? carrito : new ArrayList<>(); }
    public void   setCarrito(List<ItemCarrito> c) { this.carrito = c; }
    public List<String> getFavoritos()            { return favoritos != null ? favoritos : new ArrayList<>(); }
    public void   setFavoritos(List<String> f)    { this.favoritos = f; }
}