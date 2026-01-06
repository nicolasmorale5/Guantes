import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const COLORS = {
  primary: '#D4AF37',
  secondary: '#1a1a2e',
  white: '#ffffff',
  background: '#f5f5f5',
  text: '#333333',
  textLight: '#666666',
  success: '#28a745',
};

export default function CitaConfirmadaScreen({ navigation, route }) {
  const { cita, destino } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.successIcon}>
          <Text style={styles.successIconText}>✓</Text>
        </View>

        <Text style={styles.title}>¡Cita Agendada!</Text>
        <Text style={styles.subtitle}>
          Tu cita ha sido registrada exitosamente.
        </Text>

        <Text style={styles.label}>Código de Confirmación</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{cita.codigo}</Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha:</Text>
            <Text style={styles.detailValue}>{cita.fecha}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hora:</Text>
            <Text style={styles.detailValue}>{cita.hora}</Text>
          </View>
          {cita.monto_estimado && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monto estimado:</Text>
              <Text style={styles.detailValue}>
                {cita.monto_estimado} {destino}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.note}>
          Guarda este código para consultar o cancelar tu cita.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Main', { screen: 'Inicio' })}
          >
            <Text style={styles.primaryButtonText}>Volver al Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => navigation.navigate('Main', { screen: 'Consultar' })}
          >
            <Text style={styles.outlineButtonText}>Consultar Cita</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successIconText: {
    fontSize: 40,
    color: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 25,
  },
  label: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  codeBox: {
    backgroundColor: COLORS.background,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 25,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 2,
  },
  details: {
    width: '100%',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  note: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 25,
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
