import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type ProductoApi = {
  id: number;
  title: string;
  image: string;
  price: number;
  category: string;
  description: string;
};

type Producto = {
  id: number;
  nombre: string;
  imagenUrl: string;
  precio: number;
  categoria: string;
  descripcion: string;
};

function convertirProducto(datos: ProductoApi): Producto {
  return {
    id: datos.id,
    nombre: datos.title.trim(),
    imagenUrl: datos.image.trim(),
    precio: datos.price,
    categoria: datos.category,
    descripcion: datos.description,
  };
}

export default function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarProductos() {
      setCargando(true);
      setError(false);
      try {
        const respuesta = await axios.get<ProductoApi[]>('https://fakestoreapi.com/products', {
          signal: controller.signal,
          timeout: 10000,
        });
        if (!controller.signal.aborted) {
          setProductos(respuesta.data.map(convertirProducto));
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }

    void cargarProductos();
    return () => controller.abort();
  }, [intento]);

  if (seleccionado) {
    return (
      <ScrollView contentContainerStyle={estilos.pantalla}>
        <Button title="Volver a la lista" onPress={() => setSeleccionado(null)} />
        <Image source={{ uri: seleccionado.imagenUrl }} style={estilos.fotoDetalle} resizeMode="contain" />
        <Text style={estilos.titulo}>{seleccionado.nombre}</Text>
        <Text style={estilos.precio}>US$ {seleccionado.precio.toFixed(2)}</Text>
        <Text style={estilos.categoria}>{seleccionado.categoria}</Text>
        <Text>{seleccionado.descripcion}</Text>
      </ScrollView>
    );
  }

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.titulo}>Catálogo de productos</Text>
      {cargando ? (
        <View style={estilos.estado}>
          <ActivityIndicator size="small" />
          <Text>Cargando productos…</Text>
        </View>
      ) : error ? (
        <View style={estilos.estado}>
          <Text accessibilityRole="alert">No se pudieron cargar los productos.</Text>
          <Button title="Reintentar" onPress={() => setIntento(valor => valor + 1)} />
        </View>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={item => String(item.id)}
          ListEmptyComponent={<Text>No hay productos disponibles.</Text>}
          renderItem={({ item }) => (
            <Pressable accessibilityRole="button" onPress={() => setSeleccionado(item)} style={estilos.tarjeta}>
              <Image source={{ uri: item.imagenUrl }} style={estilos.foto} resizeMode="contain" />
              <View style={estilos.datos}>
                <Text>{item.nombre}</Text>
                <Text style={estilos.precio}>US$ {item.precio.toFixed(2)}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flexGrow: 1, padding: 16, paddingTop: 48, backgroundColor: 'white' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  estado: { gap: 8, marginTop: 16 },
  tarjeta: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  datos: { flex: 1, marginLeft: 12 },
  foto: { width: 60, height: 60 },
  fotoDetalle: { width: '100%', height: 180, marginVertical: 12 },
  precio: { fontWeight: 'bold' },
  categoria: { marginVertical: 8 },
});
