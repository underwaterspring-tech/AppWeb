package com.underwater.app.model;

public class ItemCarrito {
    private String  productoId;
    private String  nombre;
    private String  marca;
    private int     precio;
    private Integer precioDescuento;
    private int     cantidad;
    private String  talla;
    private String  color;
    private String  imagen;
    private String  vendedorNombre;
    private String  empresaId;

    public ItemCarrito() {}

    public String  getProductoId()              { return productoId; }
    public void    setProductoId(String p)       { this.productoId = p; }
    public String  getNombre()                  { return nombre; }
    public void    setNombre(String n)           { this.nombre = n; }
    public String  getMarca()                   { return marca; }
    public void    setMarca(String m)            { this.marca = m; }
    public int     getPrecio()                  { return precio; }
    public void    setPrecio(int p)              { this.precio = p; }
    public Integer getPrecioDescuento()         { return precioDescuento; }
    public void    setPrecioDescuento(Integer p) { this.precioDescuento = p; }
    public int     getCantidad()                { return cantidad; }
    public void    setCantidad(int c)            { this.cantidad = c; }
    public String  getTalla()                   { return talla; }
    public void    setTalla(String t)            { this.talla = t; }
    public String  getColor()                   { return color; }
    public void    setColor(String c)            { this.color = c; }
    public String  getImagen()                  { return imagen; }
    public void    setImagen(String i)           { this.imagen = i; }
    public String  getVendedorNombre()          { return vendedorNombre; }
    public void    setVendedorNombre(String v)   { this.vendedorNombre = v; }
    public String  getEmpresaId()               { return empresaId; }
    public void    setEmpresaId(String e)        { this.empresaId = e; }
}