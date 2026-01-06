import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { citas } from '../services/api';

const COLORS = {
  primary: '#D4AF37',
  secondary: '#1a1a2e',
  white: '#ffffff',
  background: '#f5f5f5',
  text: '#333333',
  textLight: '#666666',
  error: '#dc3545',
  success: '#28a745',
  warning: '#ffc107',
};

const estadoStyles = {
  pendiente: { bg: '#fff3cd', text: '#856404' },
  confirmada: { bg: '#d4edda', text: '#155724' },
  completada: { bg: '#cce5ff', text: '#004085' },
  cancelada: { bg: '#f8d7da', text: '#721c24' },
};

const estadoNombres = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export default function ConsultarScreen() {
  const [codigo, setCodigo] = useState('');
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const buscarCita = async () => {
    if (!codigo.trim()) return;

    setLoading(true);
    setMensaje('');
    setCita(null);

    try {
      const data = await citas.consultar(codigo.trim());
      setCita(data);
    } catch (error) {
      Alert.alert('Error', error.message || 'No se encontró la cita');
    }
    setLoading(false);
  };

  const cancelarCita = async () => {
    Alert.alert(
      'Confirmar Cancelación',
      '¿Está seguro de cancelar esta cita?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await citas.cancelar(codigo);
              setMensaje('Cita cancelada exitosamente');
              setCita(prev => ({ ...prev, estado: 'cancelada' }));
            } catch (error) {
              Alert.alert('Error', error.message || 'Error al cancelar la cita');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchCard}>
        <Text style={styles.searchTitle}>Buscar Cita</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={codigo}
            onChangeText={(text) => setCodigo(text.toUpperCase())}
            placeholder="Código: GO2401-XXXX"
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.searchButton, loading && styles.buttonDisabled]}
            onPress={buscarCita}
            disabled={loading || !codigo.trim()}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.secondary} size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Buscar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {mensaje && (
        <View style={styles.mensajeBox}>
          <Text style={styles.mensajeText}>{mensaje}</Text>
        </View>
      )}

      {cita && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Detalles de la Cita</Text>
            <View style={[
              styles.badge,
              { backgroundColor: estadoStyles[cita.estado].bg }
            ]}>
              <Text style={[
                styles.badgeText,
                { color: estadoStyles[cita.estado].text }
              ]}>
                {estadoNombres[cita.estado]}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Código</Text>
              <Text style={styles.infoValue}>{cita.codigo_cita}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Cliente</Text>
              <Text style={styles.infoValue}>{cita.nombre_cliente}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>{formatearFecha(cita.fecha)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hora</Text>
              <Text style={styles.infoValue}>{cita.hora}</Text>
            </View>
          </View>

          <View style={styles.infoFull}>
            <Text style={styles.infoLabel}>Oficina</Text>
            <Text style={styles.infoValue}>{cita.oficina_nombre}</Text>
            <Text style={styles.infoSubtext}>{cita.oficina_direccion}</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Operación</Text>
              <Text style={styles.infoValue}>
                {cita.monto} {cita.divisa_origen} → {cita.divisa_destino}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Teléfono Oficina</Text>
              <Text style={styles.infoValue}>{cita.oficina_telefono}</Text>
            </View>
          </View>

          {cita.notas && (
            <View style={styles.infoFull}>
              <Text style={styles.infoLabel}>Notas</Text>
              <Text style={styles.infoValue}>{cita.notas}</Text>
            </View>
          )}

          {cita.estado === 'pendiente' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelarCita}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar Cita</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>¿Necesita ayuda?</Text>
        <Text style={styles.helpText}>
          Si tiene alguna pregunta sobre su cita, contáctenos:
        </Text>
        <Text style={styles.helpContact}>📞 +57 605 123 4567</Text>
        <Text style={styles.helpContact}>📧 info@guantesdeoro.com</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 15,
  },
  searchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 15,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  mensajeBox: {
    backgroundColor: '#d4edda',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  mensajeText: {
    color: '#155724',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15,
  },
  infoItem: {
    flex: 1,
  },
  infoFull: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  infoSubtext: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: COLORS.error,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '600',
  },
  helpCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  helpContact: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 5,
  },
});
