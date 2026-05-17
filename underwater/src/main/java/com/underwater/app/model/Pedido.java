package com.underwater.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "pedidos")
public class Pedido {

    @Id
    private String id;

    private String usuarioId;
    private String nombreUsuario;
    private String correoUsuario;

    private DireccionEntrega direccionEntrega;
    private List<ItemPedido> items;

    private int subtotal;
    private int descuento;
    private int envio;
    private int total;

    private String metodoPago;
    private String estado;   // PROCESANDO | ENVIADO | ENTREGADO | CANCELADO

    private LocalDateTime fechaPedido;
    private LocalDateTime fechaEntrega;

    public Pedido() {}

    // Getters & setters
    public String getId()                             { return id; }
    public void   setId(String id)                    { this.id = id; }
    public String getUsuarioId()                      { return usuarioId; }
    public void   setUsuarioId(String u)              { this.usuarioId = u; }
    public String getNombreUsuario()                  { return nombreUsuario; }
    public void   setNombreUsuario(String n)          { this.nombreUsuario = n; }
    public String getCorreoUsuario()                  { return correoUsuario; }
    public void   setCorreoUsuario(String c)          { this.correoUsuario = c; }
    public DireccionEntrega getDireccionEntrega()     { return direccionEntrega; }
    public void   setDireccionEntrega(DireccionEntrega d) { this.direccionEntrega = d; }
    public List<ItemPedido> getItems()                { return items; }
    public void   setItems(List<ItemPedido> i)        { this.items = i; }
    public int    getSubtotal()                       { return subtotal; }
    public void   setSubtotal(int s)                  { this.subtotal = s; }
    public int    getDescuento()                      { return descuento; }
    public void   setDescuento(int d)                 { this.descuento = d; }
    public int    getEnvio()                          { return envio; }
    public void   setEnvio(int e)                     { this.envio = e; }
    public int    getTotal()                          { return total; }
    public void   setTotal(int t)                     { this.total = t; }
    public String getMetodoPago()                     { return metodoPago; }
    public void   setMetodoPago(String m)             { this.metodoPago = m; }
    public String getEstado()                         { return estado; }
    public void   setEstado(String e)                 { this.estado = e; }
    public LocalDateTime getFechaPedido()             { return fechaPedido; }
    public void   setFechaPedido(LocalDateTime f)     { this.fechaPedido = f; }
    public LocalDateTime getFechaEntrega()            { return fechaEntrega; }
    public void   setFechaEntrega(LocalDateTime f)    { this.fechaEntrega = f; }
}
