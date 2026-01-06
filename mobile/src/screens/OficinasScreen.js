import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { oficinas } from '../services/api';

const COLORS = {
  primary: '#D4AF37',
  secondary: '#1a1a2e',
  accent: '#16213e',
  white: '#ffffff',
  background: '#f5f5f5',
  text: '#333333',
  textLight: '#666666',
};

export default function OficinasScreen({ navigation }) {
  const [listaOficinas, setListaOficinas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarOficinas();
  }, []);

  const cargarOficinas = async () => {
    try {
      const data = await oficinas.obtenerTodas();
      setListaOficinas(data);
    } catch (error) {
      console.error('Error al cargar oficinas:', error);
    }
    setLoading(false);
  };

  const abrirMapa = (latitud, longitud) => {
    const url = `https://www.google.com/maps?q=${latitud},${longitud}`;
    Linking.openURL(url);
  };

  const llamar = (telefono) => {
    Linking.openURL(`tel:${telefono.replace(/\s/g, '')}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.nombre}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.icon}>📍</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Dirección</Text>
            <Text style={styles.infoText}>{item.direccion}</Text>
          </View>
        </View>

        {item.telefono && (
          <TouchableOpacity style={styles.infoRow} onPress={() => llamar(item.telefono)}>
            <Text style={styles.icon}>📞</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={[styles.infoText, { color: COLORS.primary }]}>{item.telefono}</Text>
            </View>
          </TouchableOpacity>
        )}

        {item.horario && (
          <View style={styles.infoRow}>
            <Text style={styles.icon}>🕐</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Horario</Text>
              <Text style={styles.infoText}>{item.horario}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Agendar', { oficinaId: item.id })}
          >
            <Text style={styles.primaryButtonText}>Agendar Cita</Text>
          </TouchableOpacity>

          {item.latitud && item.longitud && (
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => abrirMapa(item.latitud, item.longitud)}
            >
              <Text style={styles.outlineButtonText}>Ver Mapa</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={listaOficinas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay oficinas disponibles</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    backgroundColor: COLORS.secondary,
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  cardBody: {
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  outlineButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: 16,
  },
});
