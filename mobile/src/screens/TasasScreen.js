import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { divisas } from '../services/api';

const COLORS = {
  primary: '#D4AF37',
  secondary: '#1a1a2e',
  white: '#ffffff',
  background: '#f5f5f5',
  text: '#333333',
  textLight: '#666666',
  success: '#28a745',
};

export default function TasasScreen() {
  const [tasas, setTasas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarTasas();
  }, []);

  const cargarTasas = async () => {
    try {
      const data = await divisas.obtenerTasas();
      setTasas(data);
    } catch (error) {
      console.error('Error al cargar tasas:', error);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarTasas();
  };

  const formatearNumero = (num) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.pair}>
          {item.divisa_origen} → {item.divisa_destino}
        </Text>
        <Text style={styles.updated}>
          {formatearFecha(item.actualizado_en)}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.rateColumn}>
          <Text style={styles.rateLabel}>Compra</Text>
          <Text style={[styles.rateValue, { color: COLORS.success }]}>
            {formatearNumero(item.tasa_compra)}
          </Text>
        </View>
        <View style={styles.rateColumn}>
          <Text style={styles.rateLabel}>Venta</Text>
          <Text style={[styles.rateValue, { color: COLORS.primary }]}>
            {formatearNumero(item.tasa_venta)}
          </Text>
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
        data={tasas}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Información</Text>
            <Text style={styles.infoText}>
              • Tasa de Compra: Precio al que compramos su divisa
            </Text>
            <Text style={styles.infoText}>
              • Tasa de Venta: Precio al que le vendemos divisa
            </Text>
            <Text style={styles.infoText}>
              • Las tasas pueden variar durante el día
            </Text>
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
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pair: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  updated: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  cardBody: {
    flexDirection: 'row',
    padding: 15,
  },
  rateColumn: {
    flex: 1,
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  rateValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 5,
  },
});
